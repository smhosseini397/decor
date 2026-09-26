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
import com.carpetdecor.persiancarpet.processing.RealisticShadowRenderer
import com.carpetdecor.persiancarpet.ui.theme.SurfaceDark
import com.carpetdecor.persiancarpet.ui.theme.TextPrimary
import com.carpetdecor.persiancarpet.ui.theme.TextSecondary
import kotlin.math.roundToInt

@Composable
fun ShadowControlsSheet(
    config: RealisticShadowRenderer.ShadowConfig,
    onConfigChange: (RealisticShadowRenderer.ShadowConfig) -> Unit,
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
            text = stringResource(R.string.shadow_title),
            style = MaterialTheme.typography.titleMedium,
            color = TextPrimary
        )

        // 1. Opacity Slider
        ShadowSliderItem(
            title = stringResource(R.string.shadow_opacity),
            valueText = "${(config.opacity * 100).roundToInt()}%",
            value = config.opacity,
            valueRange = 0f..1f,
            onValueChange = { onConfigChange(config.copy(opacity = it)) }
        )

        // 2. Blur Radius Slider
        ShadowSliderItem(
            title = stringResource(R.string.shadow_blur),
            valueText = "${config.blurRadius.roundToInt()} px",
            value = config.blurRadius,
            valueRange = 2f..60f,
            onValueChange = { onConfigChange(config.copy(blurRadius = it)) }
        )

        // 3. Elevation Slider
        ShadowSliderItem(
            title = stringResource(R.string.shadow_elevation),
            valueText = "${config.elevation.roundToInt()} px",
            value = config.elevation,
            valueRange = 0f..50f,
            onValueChange = { onConfigChange(config.copy(elevation = it)) }
        )

        // 4. Direction Slider
        ShadowSliderItem(
            title = stringResource(R.string.shadow_direction),
            valueText = "${config.lightAngleDeg.roundToInt()}°",
            value = config.lightAngleDeg,
            valueRange = 0f..360f,
            onValueChange = { onConfigChange(config.copy(lightAngleDeg = it)) }
        )
    }
}

@Composable
private fun ShadowSliderItem(
    title: String,
    valueText: String,
    value: Float,
    valueRange: ClosedFloatingPointRange<Float>,
    onValueChange: (Float) -> Unit
) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(text = title, style = MaterialTheme.typography.bodyMedium, color = TextPrimary)
            Text(text = valueText, style = MaterialTheme.typography.bodyMedium, color = TextSecondary)
        }
        Slider(
            value = value,
            valueRange = valueRange,
            onValueChange = onValueChange,
            colors = SliderDefaults.colors(
                thumbColor = MaterialTheme.colorScheme.primary,
                activeTrackColor = MaterialTheme.colorScheme.primary
            )
        )
    }
}
