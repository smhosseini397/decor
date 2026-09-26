package com.carpetdecor.persiancarpet.processing

import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Matrix
import android.graphics.Paint
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import androidx.core.content.FileProvider
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream

/**
 * High-resolution image exporter for Persian Carpet Staging.
 * Exports high-fidelity JPEG or PNG composites to Android MediaStore gallery and handles sharing.
 */
class ImageExporter(private val context: Context) {

    enum class ExportFormat {
        JPEG, PNG
    }

    data class ExportOptions(
        val format: ExportFormat = ExportFormat.JPEG,
        val quality: Int = 95 // 1 to 100
    )

    /**
     * Composites room background + realistic floor shadow + warped carpet into a full-resolution bitmap.
     */
    fun compositeFinalImage(
        roomBitmap: Bitmap,
        carpetBitmap: Bitmap,
        carpetQuad: PerspectiveTransformer.QuadPoints,
        shadowConfig: RealisticShadowRenderer.ShadowConfig
    ): Bitmap {
        val output = Bitmap.createBitmap(
            roomBitmap.width,
            roomBitmap.height,
            Bitmap.Config.ARGB_8888
        )
        val canvas = Canvas(output)
        val paint = Paint().apply {
            isAntiAlias = true
            isFilterBitmap = true
            isDither = true
        }

        // 1. Draw base room interior
        canvas.drawBitmap(roomBitmap, 0f, 0f, paint)

        // 2. Draw realistic floor shadow
        val shadowRenderer = RealisticShadowRenderer()
        shadowRenderer.drawFloorShadow(canvas, carpetQuad, shadowConfig)

        // 3. Draw perspective-warped carpet
        val transformer = PerspectiveTransformer()
        val matrix = transformer.computePerspectiveMatrix(
            carpetBitmap.width.toFloat(),
            carpetBitmap.height.toFloat(),
            carpetQuad
        )
        canvas.drawBitmap(carpetBitmap, matrix, paint)

        return output
    }

    /**
     * Saves the composite image to Android MediaStore gallery.
     */
    suspend fun saveToGallery(
        bitmap: Bitmap,
        options: ExportOptions
    ): Result<Uri> = withContext(Dispatchers.IO) {
        try {
            val filename = "CarpetDecor_${System.currentTimeMillis()}.${if (options.format == ExportFormat.JPEG) "jpg" else "png"}"
            val mimeType = if (options.format == ExportFormat.JPEG) "image/jpeg" else "image/png"
            val compressFormat = if (options.format == ExportFormat.JPEG) Bitmap.CompressFormat.JPEG else Bitmap.CompressFormat.PNG

            val contentValues = ContentValues().apply {
                put(MediaStore.MediaColumns.DISPLAY_NAME, filename)
                put(MediaStore.MediaColumns.MIME_TYPE, mimeType)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/CarpetDecor")
                    put(MediaStore.MediaColumns.IS_PENDING, 1)
                }
            }

            val resolver = context.contentResolver
            val uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues)
                ?: return@withContext Result.failure(Exception("Failed to create MediaStore entry"))

            resolver.openOutputStream(uri)?.use { outputStream ->
                bitmap.compress(compressFormat, options.quality, outputStream)
            } ?: return@withContext Result.failure(Exception("Failed to open output stream"))

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                contentValues.clear()
                contentValues.put(MediaStore.MediaColumns.IS_PENDING, 0)
                resolver.update(uri, contentValues, null, null)
            }

            Result.success(uri)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Creates an Android Share Intent for the rendered carpet staging image.
     */
    suspend fun createShareIntent(
        bitmap: Bitmap,
        options: ExportOptions
    ): Result<Intent> = withContext(Dispatchers.IO) {
        try {
            val cachePath = File(context.cacheDir, "images")
            cachePath.mkdirs()
            val file = File(cachePath, "shared_carpet_decor.${if (options.format == ExportFormat.JPEG) "jpg" else "png"}")
            val stream = FileOutputStream(file)
            val compressFormat = if (options.format == ExportFormat.JPEG) Bitmap.CompressFormat.JPEG else Bitmap.CompressFormat.PNG
            bitmap.compress(compressFormat, options.quality, stream)
            stream.close()

            val contentUri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.provider",
                file
            )

            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = if (options.format == ExportFormat.JPEG) "image/jpeg" else "image/png"
                putExtra(Intent.EXTRA_STREAM, contentUri)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            Result.success(Intent.createChooser(shareIntent, "اشتراک‌گذاری طرح چیدمان فرش"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
