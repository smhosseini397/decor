package com.carpetdecor.persiancarpet.processing

import android.graphics.Bitmap
import android.graphics.BlurMaskFilter
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PointF
import kotlin.math.cos
import kotlin.math.sin

/**
 * Realistic floor shadow generator for Persian carpets.
 * Renders physically grounded ambient contact shadow and directional cast shadow
 * that adheres naturally to room floor perspective.
 */
class RealisticShadowRenderer {

    data class ShadowConfig(
        val opacity: Float = 0.55f,      // 0.0 to 1.0
        val blurRadius: Float = 24f,     // 2 to 60 px
        val elevation: Float = 14f,      // vertical floor offset
        val lightAngleDeg: Float = 45f,  // 0 to 360 degrees
        val ambientOcclusion: Float = 0.45f // Contact shadow intensity
    )

    /**
     * Draws realistic composite floor shadow underneath the carpet quad onto the target canvas.
     */
    fun drawFloorShadow(
        canvas: Canvas,
        quad: PerspectiveTransformer.QuadPoints,
        config: ShadowConfig
    ) {
        val angleRad = Math.toRadians(config.lightAngleDeg.toDouble())
        val offsetX = (cos(angleRad) * config.elevation).toFloat()
        val offsetY = (sin(angleRad) * config.elevation * 0.6f + config.elevation * 0.4f).toFloat()

        // 1. Primary Cast Shadow (Soft Gaussian Blur)
        val shadowPaint = Paint().apply {
            isAntiAlias = true
            color = Color.argb((config.opacity * 255).toInt().coerceIn(0, 255), 18, 14, 12)
            style = Paint.Style.FILL
            if (config.blurRadius > 1f) {
                maskFilter = BlurMaskFilter(config.blurRadius, BlurMaskFilter.Blur.NORMAL)
            }
        }

        val castShadowPath = Path().apply {
            moveTo(quad.topLeft.x + offsetX, quad.topLeft.y + offsetY)
            lineTo(quad.topRight.x + offsetX, quad.topRight.y + offsetY)
            lineTo(quad.bottomRight.x + offsetX, quad.bottomRight.y + offsetY)
            lineTo(quad.bottomLeft.x + offsetX, quad.bottomLeft.y + offsetY)
            close()
        }

        canvas.drawPath(castShadowPath, shadowPaint)

        // 2. Contact Ambient Occlusion Shadow (Sharp, close, dark rim directly under rug edges)
        if (config.ambientOcclusion > 0.05f) {
            val contactPaint = Paint().apply {
                isAntiAlias = true
                color = Color.argb((config.ambientOcclusion * 255).toInt().coerceIn(0, 255), 10, 8, 7)
                style = Paint.Style.STROKE
                strokeWidth = 6f
                maskFilter = BlurMaskFilter(4f, BlurMaskFilter.Blur.NORMAL)
            }

            val contactPath = Path().apply {
                moveTo(quad.topLeft.x, quad.topLeft.y)
                lineTo(quad.topRight.x, quad.topRight.y)
                lineTo(quad.bottomRight.x, quad.bottomRight.y)
                lineTo(quad.bottomLeft.x, quad.bottomLeft.y)
                close()
            }
            canvas.drawPath(contactPath, contactPaint)
        }
    }
}
