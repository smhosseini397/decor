package com.carpetdecor.persiancarpet.ui

import android.graphics.Bitmap
import android.graphics.PointF
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.carpetdecor.persiancarpet.R
import com.carpetdecor.persiancarpet.processing.CarpetSegmenter
import com.carpetdecor.persiancarpet.processing.ImageExporter
import com.carpetdecor.persiancarpet.processing.PerspectiveTransformer
import com.carpetdecor.persiancarpet.processing.RealisticShadowRenderer
import com.carpetdecor.persiancarpet.ui.components.BackgroundRemovalSheet
import com.carpetdecor.persiancarpet.ui.components.PerspectiveCanvasView
import com.carpetdecor.persiancarpet.ui.components.ShadowControlsSheet
import com.carpetdecor.persiancarpet.ui.theme.*
import kotlinx.coroutines.launch

enum class EditorActiveSheet {
    NONE, SHADOW, BACKGROUND_REMOVAL, EXPORT
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditorScreen(
    roomBitmap: Bitmap,
    initialCarpetBitmap: Bitmap,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var carpetBitmap by remember { mutableStateOf(initialCarpetBitmap) }
    var activeSheet by remember { mutableStateOf(EditorActiveSheet.NONE) }
    var showGuides by remember { mutableStateOf(true) }

    // Initialize default floor quad in lower perspective section of room
    val initialQuad = remember(roomBitmap) {
        val w = roomBitmap.width.toFloat()
        val h = roomBitmap.height.toFloat()
        PerspectiveTransformer.QuadPoints(
            topLeft = PointF(w * 0.25f, h * 0.52f),
            topRight = PointF(w * 0.75f, h * 0.52f),
            bottomRight = PointF(w * 0.88f, h * 0.88f),
            bottomLeft = PointF(w * 0.12f, h * 0.88f)
        )
    }

    var currentQuad by remember { mutableStateOf(initialQuad) }
    var shadowConfig by remember { mutableStateOf(RealisticShadowRenderer.ShadowConfig()) }
    var segmentationParams by remember { mutableStateOf(CarpetSegmenter.SegmentationParams()) }
    var isSegmenting by remember { mutableStateOf(false) }

    // Undo / Redo history
    val undoStack = remember { mutableStateListOf<PerspectiveTransformer.QuadPoints>() }
    val redoStack = remember { mutableStateListOf<PerspectiveTransformer.QuadPoints>() }

    fun pushHistory(newQuad: PerspectiveTransformer.QuadPoints) {
        undoStack.add(currentQuad)
        redoStack.clear()
        currentQuad = newQuad
    }

    fun handleUndo() {
        if (undoStack.isNotEmpty()) {
            redoStack.add(currentQuad)
            currentQuad = undoStack.removeAt(undoStack.lastIndex)
        }
    }

    fun handleRedo() {
        if (redoStack.isNotEmpty()) {
            undoStack.add(currentQuad)
            currentQuad = redoStack.removeAt(redoStack.lastIndex)
        }
    }

    fun handleReset() {
        undoStack.add(currentQuad)
        redoStack.clear()
        currentQuad = initialQuad
        shadowConfig = RealisticShadowRenderer.ShadowConfig()
        Toast.makeText(context, context.getString(R.string.toast_reset_done), Toast.LENGTH_SHORT).show()
    }

    val exporter = remember { ImageExporter(context) }
    val segmenter = remember { CarpetSegmenter() }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "میز کار چیدمان فرش",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowForward, contentDescription = "بازگشت", tint = TextPrimary)
                    }
                },
                actions = {
                    IconButton(onClick = { handleUndo() }, enabled = undoStack.isNotEmpty()) {
                        Icon(
                            Icons.Default.Undo,
                            contentDescription = stringResource(R.string.action_undo),
                            tint = if (undoStack.isNotEmpty()) TextPrimary else TextMuted
                        )
                    }
                    IconButton(onClick = { handleRedo() }, enabled = redoStack.isNotEmpty()) {
                        Icon(
                            Icons.Default.Redo,
                            contentDescription = stringResource(R.string.action_redo),
                            tint = if (redoStack.isNotEmpty()) TextPrimary else TextMuted
                        )
                    }
                    IconButton(onClick = { handleReset() }) {
                        Icon(
                            Icons.Default.RestartAlt,
                            contentDescription = stringResource(R.string.action_reset),
                            tint = TextPrimary
                        )
                    }
                    IconButton(onClick = { activeSheet = EditorActiveSheet.EXPORT }) {
                        Icon(
                            Icons.Default.Save,
                            contentDescription = stringResource(R.string.action_save),
                            tint = TerracottaPrimary
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = SurfaceDark)
            )
        },
        bottomBar = {
            // Main tool actions bar
            Surface(
                color = SurfaceDark,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 8.dp, vertical = 6.dp)
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    FilterChip(
                        selected = showGuides,
                        onClick = { showGuides = !showGuides },
                        label = { Text("کنترل‌های پرسپکتیو") },
                        leadingIcon = {
                            Icon(
                                Icons.Default.CropFree,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    )

                    FilterChip(
                        selected = activeSheet == EditorActiveSheet.SHADOW,
                        onClick = {
                            activeSheet = if (activeSheet == EditorActiveSheet.SHADOW) EditorActiveSheet.NONE else EditorActiveSheet.SHADOW
                        },
                        label = { Text(stringResource(R.string.action_shadow)) },
                        leadingIcon = {
                            Icon(
                                Icons.Default.WbSunny,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    )

                    FilterChip(
                        selected = activeSheet == EditorActiveSheet.BACKGROUND_REMOVAL,
                        onClick = {
                            activeSheet = if (activeSheet == EditorActiveSheet.BACKGROUND_REMOVAL) EditorActiveSheet.NONE else EditorActiveSheet.BACKGROUND_REMOVAL
                        },
                        label = { Text(stringResource(R.string.action_remove_bg)) },
                        leadingIcon = {
                            Icon(
                                Icons.Default.AutoFixHigh,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(BackgroundDark)
        ) {
            PerspectiveCanvasView(
                roomBitmap = roomBitmap,
                carpetBitmap = carpetBitmap,
                quad = currentQuad,
                shadowConfig = shadowConfig,
                showGuides = showGuides,
                onQuadChange = { newQuad ->
                    pushHistory(newQuad)
                }
            )

            // Bottom Sheets
            when (activeSheet) {
                EditorActiveSheet.SHADOW -> {
                    Box(
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .fillMaxWidth()
                    ) {
                        ShadowControlsSheet(
                            config = shadowConfig,
                            onConfigChange = { shadowConfig = it }
                        )
                    }
                }
                EditorActiveSheet.BACKGROUND_REMOVAL -> {
                    Box(
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .fillMaxWidth()
                    ) {
                        BackgroundRemovalSheet(
                            params = segmentationParams,
                            isProcessing = isSegmenting,
                            onParamsChange = { segmentationParams = it },
                            onApplySegmentation = {
                                coroutineScope.launch {
                                    isSegmenting = true
                                    try {
                                        val processed = segmenter.removeBackground(carpetBitmap, segmentationParams)
                                        carpetBitmap = processed
                                        Toast.makeText(context, "پس‌زمینه فرش با موفقیت حذف شد.", Toast.LENGTH_SHORT).show()
                                    } catch (e: Exception) {
                                        Toast.makeText(context, "خطا در پردازش تصویر: ${e.message}", Toast.LENGTH_SHORT).show()
                                    } finally {
                                        isSegmenting = false
                                    }
                                }
                            },
                            onRestoreOriginal = {
                                carpetBitmap = initialCarpetBitmap
                                Toast.makeText(context, "تصویر اصلی فرش بازیابی شد.", Toast.LENGTH_SHORT).show()
                            }
                        )
                    }
                }
                EditorActiveSheet.EXPORT -> {
                    var selectedFormat by remember { mutableStateOf(ImageExporter.ExportFormat.JPEG) }
                    var exportQuality by remember { mutableFloatStateOf(95f) }
                    var isSaving by remember { mutableStateOf(false) }

                    AlertDialog(
                        onDismissRequest = { activeSheet = EditorActiveSheet.NONE },
                        title = { Text(text = stringResource(R.string.export_title)) },
                        text = {
                            Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                                Text(text = stringResource(R.string.export_format), style = MaterialTheme.typography.bodyMedium)
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    RadioButton(
                                        selected = selectedFormat == ImageExporter.ExportFormat.JPEG,
                                        onClick = { selectedFormat = ImageExporter.ExportFormat.JPEG }
                                    )
                                    Text(text = "JPG (کیفیت بالا)", modifier = Modifier.align(Alignment.CenterVertically))
                                    Spacer(modifier = Modifier.width(12.dp))
                                    RadioButton(
                                        selected = selectedFormat == ImageExporter.ExportFormat.PNG,
                                        onClick = { selectedFormat = ImageExporter.ExportFormat.PNG }
                                    )
                                    Text(text = "PNG", modifier = Modifier.align(Alignment.CenterVertically))
                                }

                                if (selectedFormat == ImageExporter.ExportFormat.JPEG) {
                                    Text(
                                        text = "کیفیت: ${exportQuality.toInt()}%",
                                        style = MaterialTheme.typography.bodyMedium
                                    )
                                    Slider(
                                        value = exportQuality,
                                        valueRange = 50f..100f,
                                        onValueChange = { exportQuality = it }
                                    )
                                }
                            }
                        },
                        confirmButton = {
                            Button(
                                onClick = {
                                    coroutineScope.launch {
                                        isSaving = true
                                        val composite = exporter.compositeFinalImage(
                                            roomBitmap,
                                            carpetBitmap,
                                            currentQuad,
                                            shadowConfig
                                        )
                                        val result = exporter.saveToGallery(
                                            composite,
                                            ImageExporter.ExportOptions(
                                                format = selectedFormat,
                                                quality = exportQuality.toInt()
                                            )
                                        )
                                        isSaving = false
                                        activeSheet = EditorActiveSheet.NONE
                                        if (result.isSuccess) {
                                            Toast.makeText(context, context.getString(R.string.save_success), Toast.LENGTH_LONG).show()
                                        } else {
                                            Toast.makeText(context, context.getString(R.string.save_failed), Toast.LENGTH_LONG).show()
                                        }
                                    }
                                },
                                enabled = !isSaving
                            ) {
                                Text(text = stringResource(R.string.btn_save_gallery))
                            }
                        },
                        dismissButton = {
                            OutlinedButton(
                                onClick = {
                                    coroutineScope.launch {
                                        val composite = exporter.compositeFinalImage(
                                            roomBitmap,
                                            carpetBitmap,
                                            currentQuad,
                                            shadowConfig
                                        )
                                        val shareResult = exporter.createShareIntent(
                                            composite,
                                            ImageExporter.ExportOptions(
                                                format = selectedFormat,
                                                quality = exportQuality.toInt()
                                            )
                                        )
                                        activeSheet = EditorActiveSheet.NONE
                                        shareResult.getOrNull()?.let { intent ->
                                            context.startActivity(intent)
                                        }
                                    }
                                }
                            ) {
                                Text(text = stringResource(R.string.btn_share_image))
                            }
                        }
                    )
                }
                EditorActiveSheet.NONE -> Unit
            }
        }
    }
}
