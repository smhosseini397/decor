package com.carpetdecor.persiancarpet.ui.components

import android.graphics.Bitmap
import android.graphics.Paint
import android.graphics.PointF
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.asAndroidBitmap
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.input.pointer.pointerInput
import com.carpetdecor.persiancarpet.processing.PerspectiveTransformer
import com.carpetdecor.persiancarpet.processing.RealisticShadowRenderer
import kotlin.math.hypot

enum class ActiveCorner {
    NONE, TOP_LEFT, TOP_RIGHT, BOTTOM_RIGHT, BOTTOM_LEFT, WHOLE_BODY
}

@Composable
fun PerspectiveCanvasView(
    roomBitmap: Bitmap,
    carpetBitmap: Bitmap,
    quad: PerspectiveTransformer.QuadPoints,
    shadowConfig: RealisticShadowRenderer.ShadowConfig,
    showGuides: Boolean,
    onQuadChange: (PerspectiveTransformer.QuadPoints) -> Unit,
    modifier: Modifier = Modifier
) {
    var activeTarget by remember { mutableStateOf(ActiveCorner.NONE) }
    var lastTouchPos by remember { mutableStateOf(Offset.Zero) }

    val transformer = remember { PerspectiveTransformer() }
    val shadowRenderer = remember { RealisticShadowRenderer() }

    val hitRadiusPx = 70f // Generous touch target for precision dragging

    Canvas(
        modifier = modifier
            .fillMaxSize()
            .pointerInput(quad) {
                detectDragGestures(
                    onDragStart = { offset ->
                        lastTouchPos = offset

                        // Hit test corners
                        val dTL = hypot(offset.x - quad.topLeft.x, offset.y - quad.topLeft.y)
                        val dTR = hypot(offset.x - quad.topRight.x, offset.y - quad.topRight.y)
                        val dBR = hypot(offset.x - quad.bottomRight.x, offset.y - quad.bottomRight.y)
                        val dBL = hypot(offset.x - quad.bottomLeft.x, offset.y - quad.bottomLeft.y)

                        activeTarget = when {
                            dTL < hitRadiusPx -> ActiveCorner.TOP_LEFT
                            dTR < hitRadiusPx -> ActiveCorner.TOP_RIGHT
                            dBR < hitRadiusPx -> ActiveCorner.BOTTOM_RIGHT
                            dBL < hitRadiusPx -> ActiveCorner.BOTTOM_LEFT
                            isPointInsideQuad(offset.x, offset.y, quad) -> ActiveCorner.WHOLE_BODY
                            else -> ActiveCorner.NONE
                        }
                    },
                    onDrag = { change, dragAmount ->
                        change.consume()
                        val dx = dragAmount.x
                        val dy = dragAmount.y

                        when (activeTarget) {
                            ActiveCorner.TOP_LEFT -> {
                                onQuadChange(
                                    quad.copy(
                                        topLeft = PointF(quad.topLeft.x + dx, quad.topLeft.y + dy)
                                    )
                                )
                            }
                            ActiveCorner.TOP_RIGHT -> {
                                onQuadChange(
                                    quad.copy(
                                        topRight = PointF(quad.topRight.x + dx, quad.topRight.y + dy)
                                    )
                                )
                            }
                            ActiveCorner.BOTTOM_RIGHT -> {
                                onQuadChange(
                                    quad.copy(
                                        bottomRight = PointF(quad.bottomRight.x + dx, quad.bottomRight.y + dy)
                                    )
                                )
                            }
                            ActiveCorner.BOTTOM_LEFT -> {
                                onQuadChange(
                                    quad.copy(
                                        bottomLeft = PointF(quad.bottomLeft.x + dx, quad.bottomLeft.y + dy)
                                    )
                                )
                            }
                            ActiveCorner.WHOLE_BODY -> {
                                onQuadChange(
                                    PerspectiveTransformer.QuadPoints(
                                        topLeft = PointF(quad.topLeft.x + dx, quad.topLeft.y + dy),
                                        topRight = PointF(quad.topRight.x + dx, quad.topRight.y + dy),
                                        bottomRight = PointF(quad.bottomRight.x + dx, quad.bottomRight.y + dy),
                                        bottomLeft = PointF(quad.bottomLeft.x + dx, quad.bottomLeft.y + dy)
                                    )
                                )
                            }
                            ActiveCorner.NONE -> Unit
                        }
                    },
                    onDragEnd = {
                        activeTarget = ActiveCorner.NONE
                    },
                    onDragCancel = {
                        activeTarget = ActiveCorner.NONE
                    }
                )
            }
    ) {
        drawIntoCanvas { canvas ->
            val native = canvas.nativeCanvas

            // 1. Draw room background
            val paint = Paint().apply {
                isAntiAlias = true
                isFilterBitmap = true
            }
            native.drawBitmap(roomBitmap, 0f, 0f, paint)

            // 2. Draw realistic floor shadow
            shadowRenderer.drawFloorShadow(native, quad, shadowConfig)

            // 3. Draw perspective warped carpet
            val matrix = transformer.computePerspectiveMatrix(
                carpetBitmap.width.toFloat(),
                carpetBitmap.height.toFloat(),
                quad
            )
            native.drawBitmap(carpetBitmap, matrix, paint)
        }

        // 4. Draw interactive UI overlay (perspective guide lines & corner handles)
        if (showGuides) {
            val pTL = Offset(quad.topLeft.x, quad.topLeft.y)
            val pTR = Offset(quad.topRight.x, quad.topRight.y)
            val pBR = Offset(quad.bottomRight.x, quad.bottomRight.y)
            val pBL = Offset(quad.bottomLeft.x, quad.bottomLeft.y)

            // Draw bounding guide polygon
            val guideColor = Color(0xFF38BDF8)
            val pathEffect = PathEffect.dashPathEffect(floatArrayOf(12f, 8f), 0f)

            drawLine(guideColor, pTL, pTR, strokeWidth = 3f, pathEffect = pathEffect)
            drawLine(guideColor, pTR, pBR, strokeWidth = 3f, pathEffect = pathEffect)
            drawLine(guideColor, pBR, pBL, strokeWidth = 3f, pathEffect = pathEffect)
            drawLine(guideColor, pBL, pTL, strokeWidth = 3f, pathEffect = pathEffect)

            // Draw perspective diagonals
            val subGuideColor = Color(0x6638BDF8)
            drawLine(subGuideColor, pTL, pBR, strokeWidth = 1.5f, pathEffect = pathEffect)
            drawLine(subGuideColor, pTR, pBL, strokeWidth = 1.5f, pathEffect = pathEffect)

            // Draw handles at 4 corners
            listOf(pTL, pTR, pBR, pBL).forEachIndexed { index, point ->
                val isActive = when (index) {
                    0 -> activeTarget == ActiveCorner.TOP_LEFT
                    1 -> activeTarget == ActiveCorner.TOP_RIGHT
                    2 -> activeTarget == ActiveCorner.BOTTOM_RIGHT
                    else -> activeTarget == ActiveCorner.BOTTOM_LEFT
                }

                // Outer halo
                drawCircle(
                    color = if (isActive) Color(0x6638BDF8) else Color(0x3338BDF8),
                    radius = if (isActive) 34f else 24f,
                    center = point
                )
                // Solid circle pin
                drawCircle(
                    color = Color.White,
                    radius = 12f,
                    center = point
                )
                drawCircle(
                    color = Color(0xFF0284C7),
                    radius = 8f,
                    center = point
                )
            }
        }
    }
}

private fun isPointInsideQuad(x: Float, y: Float, quad: PerspectiveTransformer.QuadPoints): Boolean {
    // Cross product test for point in convex polygon
    fun ccw(ax: Float, ay: Float, bx: Float, by: Float, px: Float, py: Float): Boolean {
        return (bx - ax) * (py - ay) - (by - ay) * (px - ax) >= 0
    }

    val b1 = ccw(quad.topLeft.x, quad.topLeft.y, quad.topRight.x, quad.topRight.y, x, y)
    val b2 = ccw(quad.topRight.x, quad.topRight.y, quad.bottomRight.x, quad.bottomRight.y, x, y)
    val b3 = ccw(quad.bottomRight.x, quad.bottomRight.y, quad.bottomLeft.x, quad.bottomLeft.y, x, y)
    val b4 = ccw(quad.bottomLeft.x, quad.bottomLeft.y, quad.topLeft.x, quad.topLeft.y, x, y)

    return (b1 == b2) && (b2 == b3) && (b3 == b4)
}
