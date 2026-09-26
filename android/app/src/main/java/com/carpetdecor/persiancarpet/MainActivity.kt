package com.carpetdecor.persiancarpet

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.net.Uri
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.LayoutDirection
import com.carpetdecor.persiancarpet.ui.EditorScreen
import com.carpetdecor.persiancarpet.ui.HomeScreen
import com.carpetdecor.persiancarpet.ui.theme.PersianCarpetTheme
import java.io.InputStream
import kotlin.math.max

enum class AppNavScreen {
    HOME, EDITOR
}

class MainActivity : ComponentActivity() {

    private var carpetBitmapState = mutableStateOf<Bitmap?>(null)
    private var roomBitmapState = mutableStateOf<Bitmap?>(null)

    // Activity Result Launchers
    private val pickCarpetLauncher = registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let { loadBitmapSafely(it)?.let { bmp -> carpetBitmapState.value = bmp } }
    }

    private val takeCarpetCameraLauncher = registerForActivityResult(
        ActivityResultContracts.TakePicturePreview()
    ) { bmp: Bitmap? ->
        bmp?.let { carpetBitmapState.value = it }
    }

    private val pickRoomLauncher = registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let { loadBitmapSafely(it)?.let { bmp -> roomBitmapState.value = bmp } }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Generate high-resolution offline sample carpets and rooms so app works right out of the box
        carpetBitmapState.value = createSampleCarpetBitmap(1)
        roomBitmapState.value = createSampleRoomBitmap(1)

        setContent {
            PersianCarpetTheme {
                // Ensure RTL layout across the entire application
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(
                        modifier = Modifier.fillMaxSize(),
                        color = MaterialTheme.colorScheme.background
                    ) {
                        var currentScreen by remember { mutableStateOf(AppNavScreen.HOME) }

                        val carpet = carpetBitmapState.value
                        val room = roomBitmapState.value

                        when (currentScreen) {
                            AppNavScreen.HOME -> {
                                HomeScreen(
                                    carpetBitmap = carpet,
                                    roomBitmap = room,
                                    onPickCarpetGallery = { pickCarpetLauncher.launch("image/*") },
                                    onTakeCarpetCamera = { takeCarpetCameraLauncher.launch(null) },
                                    onPickRoomGallery = { pickRoomLauncher.launch("image/*") },
                                    onSelectSampleCarpet = { variant ->
                                        carpetBitmapState.value = createSampleCarpetBitmap(variant)
                                        Toast.makeText(this, "طرح فرش نمونه بارگذاری شد.", Toast.LENGTH_SHORT).show()
                                    },
                                    onSelectSampleRoom = { variant ->
                                        roomBitmapState.value = createSampleRoomBitmap(variant)
                                        Toast.makeText(this, "تصویر دکوراسیون نمونه بارگذاری شد.", Toast.LENGTH_SHORT).show()
                                    },
                                    onStartStaging = {
                                        if (carpet != null && room != null) {
                                            currentScreen = AppNavScreen.EDITOR
                                        }
                                    }
                                )
                            }
                            AppNavScreen.EDITOR -> {
                                if (carpet != null && room != null) {
                                    EditorScreen(
                                        roomBitmap = room,
                                        initialCarpetBitmap = carpet,
                                        onNavigateBack = { currentScreen = AppNavScreen.HOME }
                                    )
                                } else {
                                    currentScreen = AppNavScreen.HOME
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Safely decodes an image URI with memory limits suitable for Samsung S20 FE and modern devices.
     */
    private fun loadBitmapSafely(uri: Uri, maxDimension: Int = 2048): Bitmap? {
        return try {
            var stream: InputStream? = contentResolver.openInputStream(uri)
            val options = BitmapFactory.Options().apply { inJustDecodeBounds = true }
            BitmapFactory.decodeStream(stream, null, options)
            stream?.close()

            var sampleSize = 1
            val maxSide = max(options.outWidth, options.outHeight)
            while (maxSide / sampleSize > maxDimension) {
                sampleSize *= 2
            }

            stream = contentResolver.openInputStream(uri)
            val decodeOptions = BitmapFactory.Options().apply {
                inSampleSize = sampleSize
                inPreferredConfig = Bitmap.Config.ARGB_8888
            }
            val bitmap = BitmapFactory.decodeStream(stream, null, decodeOptions)
            stream?.close()
            bitmap
        } catch (e: Exception) {
            Toast.makeText(this, getString(R.string.err_load_image), Toast.LENGTH_SHORT).show()
            null
        }
    }

    /**
     * Generates a rich, authentic Persian carpet bitmap offline with fringes, borders, and medallion.
     */
    private fun createSampleCarpetBitmap(variant: Int): Bitmap {
        val w = 900
        val h = 1350
        val bmp = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bmp)
        val p = Paint().apply { isAntiAlias = true }

        val bgDarkCrimson = if (variant == 1) Color.rgb(139, 26, 26) else Color.rgb(24, 43, 73)
        val navy = Color.rgb(18, 30, 49)
        val gold = Color.rgb(212, 175, 55)
        val ivory = Color.rgb(245, 240, 225)

        // Outer field
        p.color = bgDarkCrimson
        canvas.drawRect(40f, 60f, (w - 40).toFloat(), (h - 60).toFloat(), p)

        // Multiple ornamental borders (حاشیه فرش)
        p.style = Paint.Style.STROKE
        p.color = navy
        p.strokeWidth = 24f
        canvas.drawRect(52f, 72f, (w - 52).toFloat(), (h - 72).toFloat(), p)

        p.color = gold
        p.strokeWidth = 10f
        canvas.drawRect(68f, 88f, (w - 68).toFloat(), (h - 88).toFloat(), p)

        p.color = ivory
        p.strokeWidth = 6f
        canvas.drawRect(76f, 96f, (w - 76).toFloat(), (h - 96).toFloat(), p)

        // Inner field
        p.style = Paint.Style.FILL
        p.color = if (variant == 1) Color.rgb(168, 32, 32) else Color.rgb(30, 58, 95)
        canvas.drawRect(80f, 100f, (w - 80).toFloat(), (h - 100).toFloat(), p)

        // Central Persian Medallion (ترنج مرکزی)
        val cx = w / 2f
        val cy = h / 2f
        p.color = gold
        canvas.drawCircle(cx, cy, 180f, p)
        p.color = navy
        canvas.drawCircle(cx, cy, 140f, p)
        p.color = ivory
        canvas.drawCircle(cx, cy, 90f, p)
        p.color = bgDarkCrimson
        canvas.drawCircle(cx, cy, 50f, p)

        // Corner Medallions (لچک‌های چهار گوشه)
        val cornerR = 120f
        p.color = gold
        canvas.drawCircle(80f, 100f, cornerR, p)
        canvas.drawCircle((w - 80).toFloat(), 100f, cornerR, p)
        canvas.drawCircle(80f, (h - 100).toFloat(), cornerR, p)
        canvas.drawCircle((w - 80).toFloat(), (h - 100).toFloat(), cornerR, p)

        // Top and bottom authentic fringes (ریشه‌های سفید ابریشم)
        p.color = ivory
        p.strokeWidth = 3f
        for (x in 40 until (w - 40) step 4) {
            canvas.drawLine(x.toFloat(), 60f, x.toFloat(), 20f, p)
            canvas.drawLine(x.toFloat(), (h - 60).toFloat(), x.toFloat(), (h - 20).toFloat(), p)
        }

        return bmp
    }

    /**
     * Generates a realistic room interior bitmap with floor parquet or stone marble.
     */
    private fun createSampleRoomBitmap(variant: Int): Bitmap {
        val w = 1280
        val h = 800
        val bmp = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bmp)
        val p = Paint().apply { isAntiAlias = true }

        // Wall (Upper half)
        p.color = Color.rgb(238, 235, 228)
        canvas.drawRect(0f, 0f, w.toFloat(), 340f, p)

        // Wall moulding / Baseboard (قرنیز دیوار)
        p.color = Color.rgb(215, 210, 200)
        canvas.drawRect(0f, 330f, w.toFloat(), 346f, p)

        // Floor (Lower half with perspective)
        if (variant == 1) {
            // Warm Oak Parquet Floor
            p.color = Color.rgb(180, 138, 95)
            canvas.drawRect(0f, 346f, w.toFloat(), h.toFloat(), p)

            // Perspective parquet planks
            p.color = Color.rgb(150, 110, 72)
            p.strokeWidth = 2f
            for (i in -4..14) {
                val startX = i * 140f
                val endX = (i - 5) * 220f
                canvas.drawLine(startX, 346f, endX, h.toFloat(), p)
            }
            for (y in 346 until h step 65) {
                canvas.drawLine(0f, y.toFloat(), w.toFloat(), y.toFloat(), p)
            }
        } else {
            // Elegant Marble Floor
            p.color = Color.rgb(228, 224, 218)
            canvas.drawRect(0f, 346f, w.toFloat(), h.toFloat(), p)

            p.color = Color.rgb(205, 200, 192)
            p.strokeWidth = 2f
            for (i in -3..12) {
                canvas.drawLine(i * 180f, 346f, (i - 4) * 260f, h.toFloat(), p)
            }
            for (y in 346 until h step 90) {
                canvas.drawLine(0f, y.toFloat(), w.toFloat(), y.toFloat(), p)
            }
        }

        // Ambient lighting gradient on floor
        p.color = Color.argb(40, 255, 255, 255)
        canvas.drawRect(0f, 346f, w.toFloat(), 440f, p)

        return bmp
    }
}
