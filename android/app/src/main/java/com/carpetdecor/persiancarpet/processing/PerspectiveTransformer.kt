package com.carpetdecor.persiancarpet.processing

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.PointF

/**
 * High-precision 4-point perspective transformer for Persian carpets.
 * Calculates homography matrix mapping carpet rectangular coordinates to arbitrary quad on room floor.
 * Completely preserves original carpet colors, pixel fidelity, weave texture, and details.
 */
class PerspectiveTransformer {

    data class QuadPoints(
        val topLeft: PointF,
        val topRight: PointF,
        val bottomRight: PointF,
        val bottomLeft: PointF
    ) {
        fun toFloatArray(): FloatArray {
            return floatArrayOf(
                topLeft.x, topLeft.y,
                topRight.x, topRight.y,
                bottomRight.x, bottomRight.y,
                bottomLeft.x, bottomLeft.y
            )
        }
    }

    /**
     * Compute transformation matrix from source rectangular bounds to target quad points.
     */
    fun computePerspectiveMatrix(srcWidth: Float, srcHeight: Float, targetQuad: QuadPoints): Matrix {
        val src = floatArrayOf(
            0f, 0f,
            srcWidth, 0f,
            srcWidth, srcHeight,
            0f, srcHeight
        )
        val dst = targetQuad.toFloatArray()

        val matrix = Matrix()
        matrix.setPolyToPoly(src, 0, dst, 0, 4)
        return matrix
    }

    /**
     * Renders perspective-warped carpet onto canvas using anti-aliasing and bilinear filtering.
     */
    fun drawWarpedBitmap(
        canvas: Canvas,
        bitmap: Bitmap,
        matrix: Matrix,
        paint: Paint = Paint().apply {
            isAntiAlias = true
            isFilterBitmap = true
            isDither = true
        }
    ) {
        canvas.drawBitmap(bitmap, matrix, paint)
    }

    /**
     * Creates a high-fidelity warped bitmap with exact bounds.
     */
    fun createWarpedBitmap(
        source: Bitmap,
        targetQuad: QuadPoints,
        outputWidth: Int,
        outputHeight: Int
    ): Bitmap {
        val output = Bitmap.createBitmap(outputWidth, outputHeight, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(output)
        val matrix = computePerspectiveMatrix(
            source.width.toFloat(),
            source.height.toFloat(),
            targetQuad
        )
        val paint = Paint().apply {
            isAntiAlias = true
            isFilterBitmap = true
            isDither = true
        }
        canvas.drawBitmap(source, matrix, paint)
        return output
    }
}
