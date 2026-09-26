package com.carpetdecor.persiancarpet.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.carpetdecor.persiancarpet.R
import com.carpetdecor.persiancarpet.processing.CarpetSegmenter
import com.carpetdecor.persiancarpet.ui.theme.SurfaceDark
import com.carpetdecor.persiancarpet.ui.theme.TextPrimary
import com.carpetdecor.persiancarpet.ui.theme.TextSecondary
import kotlin.math.roundToInt

@Composable
fun BackgroundRemovalSheet(
    params: CarpetSegmenter.SegmentationParams,
    isProcessing: Boolean,
    onParamsChange: (CarpetSegmenter.SegmentationParams) -> Unit,
    onApplySegmentation: () -> Unit,
    onRestoreOriginal: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(SurfaceDark)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Text(
            text = stringResource(R.string.bg_removal_title),
            style = MaterialTheme.typography.titleMedium,
            color = TextPrimary
        )
        Text(
            text = stringResource(R.string.bg_removal_desc),
            style = MaterialTheme.typography.bodyMedium,
            color = TextSecondary
        )

        // Sensitivity Slider
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = stringResource(R.string.bg_removal_sensitivity),
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextPrimary
                )
                Text(
                    text = "${(params.sensitivity * 100).roundToInt()}%",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondary
                )
            }
            Slider(
                value = params.sensitivity,
                valueRange = 0.1f..0.6f,
                onValueChange = { onParamsChange(params.copy(sensitivity = it)) },
                colors = SliderDefaults.colors(
                    thumbColor = MaterialTheme.colorScheme.primary,
                    activeTrackColor = MaterialTheme.colorScheme.primary
                )
            )
        }

        // Fringe protection toggle
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = stringResource(R.string.bg_fringe_protect),
                style = MaterialTheme.typography.bodyMedium,
                color = TextPrimary
            )
            Switch(
                checked = params.protectFringes,
                onCheckedChange = { onParamsChange(params.copy(protectFringes = it)) },
                colors = SwitchDefaults.colors(
                    checkedThumbColor = MaterialTheme.colorScheme.primary
                )
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Button(
                onClick = onApplySegmentation,
                enabled = !isProcessing,
                modifier = Modifier.weight(1f),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary
                )
            ) {
                if (isProcessing) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(18.dp),
                        color = MaterialTheme.colorScheme.onPrimary,
                        strokeWidth = 2.dp
                    )
                } else {
                    Text(text = stringResource(R.string.bg_removal_auto))
                }
            }

            OutlinedButton(
                onClick = onRestoreOriginal,
                enabled = !isProcessing,
                modifier = Modifier.weight(1f)
            ) {
                Text(text = stringResource(R.string.bg_restore_original), color = TextPrimary)
            }
        }
    }
}
