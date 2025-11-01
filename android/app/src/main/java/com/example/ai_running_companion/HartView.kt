package com.example.ai_running_companion

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Fill
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.math.cos
import kotlin.math.sin

/**
 * 哈特形象组件
 * 根据元气值等级显示不同形态的心形哈特
 */
@Composable
fun HartView(
    hartForm: VitalitySystem.HartForm,
    modifier: Modifier = Modifier,
    showLabel: Boolean = true,
    animate: Boolean = true
) {
    val color = parseColor(hartForm.colorHex)

    // 心跳动画
    val infiniteTransition = rememberInfiniteTransition(label = "heartbeat")
    val scale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = if (animate) 1.05f else 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(800, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "scale"
    )

    // 浮动动画
    val floatOffset by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = if (animate) -10f else 0f,
        animationSpec = infiniteRepeatable(
            animation = tween(3000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "float"
    )

    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // 哈特图形
        Canvas(
            modifier = Modifier
                .size(120.dp)
                .offset(y = floatOffset.dp)
        ) {
            drawHeart(
                color = color,
                level = hartForm.level,
                scale = scale
            )
        }

        if (showLabel) {
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = hartForm.name,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = color
            )
            Text(
                text = hartForm.description,
                fontSize = 12.sp,
                color = Color.Gray
            )
        }
    }
}

/**
 * 绘制心形哈特
 */
private fun DrawScope.drawHeart(
    color: Color,
    level: Int,
    scale: Float = 1f
) {
    val width = size.width
    val height = size.height
    val centerX = width / 2
    val centerY = height / 2

    // 缩放中心点
    val scaledWidth = width * scale
    val scaledHeight = height * scale
    val offsetX = (scaledWidth - width) / 2
    val offsetY = (scaledHeight - height) / 2

    // 创建心形路径
    val heartPath = Path().apply {
        val baseSize = width * 0.35f * scale

        // 心形的数学路径
        moveTo(centerX - offsetX, centerY + baseSize * 0.3f - offsetY)

        // 左半边
        cubicTo(
            centerX - baseSize * 1.5f - offsetX, centerY - baseSize * 0.5f - offsetY,
            centerX - baseSize * 1.5f - offsetX, centerY + baseSize * 0.8f - offsetY,
            centerX - offsetX, centerY + baseSize * 1.8f - offsetY
        )

        // 右半边
        cubicTo(
            centerX + baseSize * 1.5f - offsetX, centerY + baseSize * 0.8f - offsetY,
            centerX + baseSize * 1.5f - offsetX, centerY - baseSize * 0.5f - offsetY,
            centerX - offsetX, centerY + baseSize * 0.3f - offsetY
        )

        close()
    }

    // 绘制主体
    drawPath(
        path = heartPath,
        color = color,
        style = Fill
    )

    // 绘制眼睛
    val eyeRadius = width * 0.025f * scale
    val eyeY = centerY - height * 0.1f - offsetY
    val eyeOffsetX = width * 0.15f * scale

    // 左眼
    drawCircle(
        color = Color.White,
        radius = eyeRadius,
        center = androidx.compose.ui.geometry.Offset(
            centerX - eyeOffsetX - offsetX,
            eyeY
        )
    )

    // 右眼
    drawCircle(
        color = Color.White,
        radius = eyeRadius,
        center = androidx.compose.ui.geometry.Offset(
            centerX + eyeOffsetX - offsetX,
            eyeY
        )
    )

    // 根据等级添加装饰元素
    when {
        level >= 3 -> {
            // Lv.3+ 添加微笑
            val smileY = centerY + height * 0.05f - offsetY
            val smileRadius = width * 0.15f * scale

            drawArc(
                color = Color.White,
                startAngle = 0f,
                sweepAngle = 180f,
                useCenter = false,
                topLeft = androidx.compose.ui.geometry.Offset(
                    centerX - smileRadius - offsetX,
                    smileY - smileRadius / 2
                ),
                size = androidx.compose.ui.geometry.Size(smileRadius * 2, smileRadius)
            )

            // 添加腮红
            val blushRadius = width * 0.04f * scale
            val blushY = centerY + height * 0.05f - offsetY
            val blushOffsetX = width * 0.25f * scale

            drawCircle(
                color = Color.White.copy(alpha = 0.5f),
                radius = blushRadius,
                center = androidx.compose.ui.geometry.Offset(
                    centerX - blushOffsetX - offsetX,
                    blushY
                )
            )

            drawCircle(
                color = Color.White.copy(alpha = 0.5f),
                radius = blushRadius,
                center = androidx.compose.ui.geometry.Offset(
                    centerX + blushOffsetX - offsetX,
                    blushY
                )
            )
        }
    }

    // 根据等级添加光芒装饰
    when {
        level >= 5 -> {
            // Lv.5+ 添加周围光点
            val sparkleCount = if (level == 6) 6 else 4
            val sparkleRadius = width * 0.03f * scale
            val orbitRadius = width * 0.5f * scale

            for (i in 0 until sparkleCount) {
                val angle = (360f / sparkleCount) * i
                val rad = Math.toRadians(angle.toDouble())
                val x = centerX + orbitRadius * cos(rad).toFloat() - offsetX
                val y = centerY + orbitRadius * sin(rad).toFloat() - offsetY

                drawCircle(
                    color = Color.White.copy(alpha = 0.7f),
                    radius = sparkleRadius,
                    center = androidx.compose.ui.geometry.Offset(x, y)
                )
            }
        }
        level == 4 -> {
            // Lv.4 添加顶部小光点
            val sparkleRadius = width * 0.025f * scale
            val sparkleY = centerY - height * 0.3f - offsetY
            val sparkleOffsetX = width * 0.2f * scale

            drawCircle(
                color = Color.White.copy(alpha = 0.7f),
                radius = sparkleRadius,
                center = androidx.compose.ui.geometry.Offset(
                    centerX - sparkleOffsetX - offsetX,
                    sparkleY
                )
            )

            drawCircle(
                color = Color.White.copy(alpha = 0.7f),
                radius = sparkleRadius,
                center = androidx.compose.ui.geometry.Offset(
                    centerX + sparkleOffsetX - offsetX,
                    sparkleY
                )
            )
        }
    }
}

/**
 * 解析颜色字符串
 */
private fun parseColor(colorHex: String): Color {
    return try {
        Color(android.graphics.Color.parseColor(colorHex))
    } catch (e: Exception) {
        Color.Gray
    }
}
