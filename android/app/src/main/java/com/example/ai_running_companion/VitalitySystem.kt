package com.example.ai_running_companion

import android.content.Context
import android.content.SharedPreferences
import kotlin.math.min

/**
 * 元气值系统
 * 管理用户的元气值积累、等级计算和哈特形态
 */
class VitalitySystem(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences("vitality_prefs", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_VITALITY_SCORE = "vitality_score"
        private const val KEY_LAST_UPDATE = "last_update"
        private const val KEY_CONSECUTIVE_DAYS = "consecutive_days"
        private const val KEY_DAYS_ABOVE_100 = "days_above_100"

        // 元气值等级阈值
        private val LEVEL_THRESHOLDS = mapOf(
            1 to 0.0,     // Lv.1: 0-9分
            2 to 10.0,    // Lv.2: 10-39分
            3 to 40.0,    // Lv.3: 40-69分
            4 to 70.0,    // Lv.4: 70-89分
            5 to 90.0,    // Lv.5: 90-100分
            6 to 100.0    // Lv.6: 100+分 (需要连续30天保持100分以上)
        )
    }

    /**
     * 哈特形态数据类
     */
    data class HartForm(
        val level: Int,
        val name: String,
        val description: String,
        val color: String,
        val colorHex: String,
        val scoreRange: String,
        val unlocked: Boolean = true
    )

    /**
     * 获取当前元气值
     */
    fun getCurrentVitality(): Double {
        return prefs.getFloat(KEY_VITALITY_SCORE, 0f).toDouble()
    }

    /**
     * 获取当前等级
     */
    fun getCurrentLevel(): Int {
        val vitality = getCurrentVitality()
        val daysAbove100 = prefs.getInt(KEY_DAYS_ABOVE_100, 0)

        return when {
            vitality >= 100.0 && daysAbove100 >= 30 -> 6  // Lv.6需要连续30天100分以上
            vitality >= 90.0 -> 5
            vitality >= 70.0 -> 4
            vitality >= 40.0 -> 3
            vitality >= 10.0 -> 2
            else -> 1
        }
    }

    /**
     * 获取当前哈特形态
     */
    fun getCurrentHartForm(): HartForm {
        val level = getCurrentLevel()
        return getHartFormByLevel(level)
    }

    /**
     * 根据等级获取哈特形态
     */
    fun getHartFormByLevel(level: Int): HartForm {
        val daysAbove100 = prefs.getInt(KEY_DAYS_ABOVE_100, 0)

        return when(level) {
            1 -> HartForm(1, "沉睡状态", "未激活，需要唤醒", "灰色", "#8A8A8A", "0-9分")
            2 -> HartForm(2, "苏醒初期", "刚唤醒，活力不足", "橙色", "#FFB74D", "10-39分")
            3 -> HartForm(3, "基础平稳", "一般状态，需要运动", "粉色", "#FF6B8B", "40-69分")
            4 -> HartForm(4, "活力充沛", "健康状态，活力满满", "蓝色", "#4A90E2", "70-89分")
            5 -> HartForm(5, "元气爆棚", "充满活力，光芒四射", "紫色", "#9C27B0", "90-100分")
            6 -> HartForm(6, "传说形态", "终极形态，神圣光辉", "绿色", "#00C853", "100+分",
                unlocked = daysAbove100 >= 30)
            else -> HartForm(1, "沉睡状态", "未激活，需要唤醒", "灰色", "#8A8A8A", "0-9分")
        }
    }

    /**
     * 获取所有哈特形态
     */
    fun getAllHartForms(): List<HartForm> {
        return (1..6).map { getHartFormByLevel(it) }
    }

    /**
     * 计算跑步后的元气值增量
     * @param distanceKm 跑步距离（公里）
     * @param durationMin 跑步时长（分钟）
     * @param avgPaceMinPerKm 平均配速（分钟/公里）
     * @return 元气值增量
     */
    fun calculateVitalityGain(
        distanceKm: Double,
        durationMin: Double,
        avgPaceMinPerKm: Double? = null
    ): Double {
        // 基础元气值计算：距离 + 时长因子
        var vitalityGain = 0.0

        // 距离贡献（每公里2-5分）
        vitalityGain += distanceKm * 3.0

        // 时长贡献（每10分钟1-2分）
        vitalityGain += (durationMin / 10.0) * 1.5

        // 配速奖励（配速在4-7分钟/公里之间有额外奖励）
        avgPaceMinPerKm?.let { pace ->
            when {
                pace in 4.0..5.0 -> vitalityGain *= 1.3  // 优秀配速，30%加成
                pace in 5.0..6.0 -> vitalityGain *= 1.2  // 良好配速，20%加成
                pace in 6.0..7.0 -> vitalityGain *= 1.1  // 一般配速，10%加成
            }
        }

        // 时长奖励（超过30分钟有额外奖励）
        if (durationMin >= 30.0) {
            vitalityGain += 5.0
        }
        if (durationMin >= 60.0) {
            vitalityGain += 10.0
        }

        return vitalityGain
    }

    /**
     * 添加元气值
     * @param gain 元气值增量
     * @return 新的元气值总分
     */
    fun addVitality(gain: Double): Double {
        val current = getCurrentVitality()
        val newVitality = min(current + gain, 150.0)  // 上限150分

        prefs.edit().apply {
            putFloat(KEY_VITALITY_SCORE, newVitality.toFloat())
            putLong(KEY_LAST_UPDATE, System.currentTimeMillis())
            apply()
        }

        // 检查是否需要更新连续100分以上天数
        checkAndUpdateDaysAbove100(newVitality)

        return newVitality
    }

    /**
     * 自然衰减元气值
     * 每天未跑步会自然衰减一定元气值
     */
    fun applyDailyDecay(): Double {
        val lastUpdate = prefs.getLong(KEY_LAST_UPDATE, System.currentTimeMillis())
        val currentTime = System.currentTimeMillis()
        val daysPassed = (currentTime - lastUpdate) / (1000 * 60 * 60 * 24)

        if (daysPassed >= 1) {
            val current = getCurrentVitality()
            // 每天衰减3-5分
            val decay = daysPassed * 4.0
            val newVitality = (current - decay).coerceAtLeast(0.0)

            prefs.edit().apply {
                putFloat(KEY_VITALITY_SCORE, newVitality.toFloat())
                putLong(KEY_LAST_UPDATE, currentTime)
                putInt(KEY_CONSECUTIVE_DAYS, 0)  // 重置连续打卡
                apply()
            }

            return newVitality
        }

        return getCurrentVitality()
    }

    /**
     * 更新连续打卡天数
     */
    fun updateConsecutiveDays() {
        val current = prefs.getInt(KEY_CONSECUTIVE_DAYS, 0)
        prefs.edit().putInt(KEY_CONSECUTIVE_DAYS, current + 1).apply()
    }

    /**
     * 获取连续打卡天数
     */
    fun getConsecutiveDays(): Int {
        return prefs.getInt(KEY_CONSECUTIVE_DAYS, 0)
    }

    /**
     * 检查并更新连续100分以上天数
     */
    private fun checkAndUpdateDaysAbove100(currentVitality: Double) {
        if (currentVitality >= 100.0) {
            val current = prefs.getInt(KEY_DAYS_ABOVE_100, 0)
            prefs.edit().putInt(KEY_DAYS_ABOVE_100, current + 1).apply()
        } else {
            // 低于100分则重置
            prefs.edit().putInt(KEY_DAYS_ABOVE_100, 0).apply()
        }
    }

    /**
     * 获取距离下一等级所需的元气值
     */
    fun getPointsToNextLevel(): Double? {
        val currentVitality = getCurrentVitality()
        val currentLevel = getCurrentLevel()

        return when {
            currentLevel >= 6 -> null  // 已经是最高等级
            currentLevel == 5 -> 100.0 - currentVitality  // 到达100分
            else -> LEVEL_THRESHOLDS[currentLevel + 1]?.minus(currentVitality)
        }
    }

    /**
     * 重置元气值（用于测试）
     */
    fun resetVitality() {
        prefs.edit().clear().apply()
    }
}
