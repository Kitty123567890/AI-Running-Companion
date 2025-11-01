package com.example.ai_running_companion

/**
 * Simplified Energy (元气值) system to mirror the web implementation.
 * Tracks energy 0–100 and updates based on running metrics and time.
 */
class EnergySystem {
  private var energy: Double = 100.0
  private val maxEnergy: Double = 100.0

  data class Status(
    val level: Int,
    val name: String,
    val state: String,
    val percent: Int
  )

  fun reset() { energy = maxEnergy }

  fun getEnergy(): Int = energy.coerceIn(0.0, maxEnergy).toInt()

  fun getStatus(): Status {
    val v = getEnergy()
    val st = when {
      v >= 90 -> Triple(5, "元气爆棚", "excellent")
      v >= 70 -> Triple(4, "活力充沛", "good")
      v >= 40 -> Triple(3, "基础平稳", "normal")
      v >= 20 -> Triple(2, "元气不足", "low")
      v >= 1 -> Triple(1, "垂头丧气", "depressed")
      else -> Triple(0, "病变濒危", "dying")
    }
    return Status(level = st.first, name = st.second, state = st.third, percent = v)
  }

  /**
   * Update energy by a time delta.
   * @param running whether currently running
   * @param instantPaceMinPerKm current pace (min/km), null or inf if unknown
   * @param targetPaceMinPerKm target pace (min/km), default 6.0
   * @param durationSec total elapsed seconds in current run
   * @param heartRate optional HR for adjustments
   * @param justStopped if recently stopped from running
   * @param dtSeconds delta time seconds since last update
   * @return updated energy [0, 100]
   */
  fun update(
    running: Boolean,
    instantPaceMinPerKm: Double?,
    targetPaceMinPerKm: Double = 6.0,
    durationSec: Long,
    heartRate: Int?,
    justStopped: Boolean,
    dtSeconds: Double
  ): Int {
    if (dtSeconds <= 0) return getEnergy()
    val delta = if (!running) {
      if (justStopped) 0.3 * dtSeconds else -0.05 * dtSeconds
    } else {
      val rate = when (evaluatePace(instantPaceMinPerKm, targetPaceMinPerKm)) {
        PaceQuality.EXCELLENT -> 1.0
        PaceQuality.GOOD -> 0.5
        PaceQuality.NORMAL -> 0.1
        PaceQuality.BAD -> -0.8
        PaceQuality.OVER_EXERTION -> -1.5
      }
      var d = rate * dtSeconds
      if (durationSec > 3600) {
        val fatigueMultiplier = ((1 - (durationSec - 3600).toDouble() / 7200).coerceAtLeast(0.5))
        d *= fatigueMultiplier
      }
      heartRate?.let { hr ->
        d *= when {
          hr > 180 -> 0.6
          hr > 160 -> 0.8
          hr in 120..150 -> 1.1
          else -> 1.0
        }
      }
      d
    }
    energy = (energy + delta).coerceIn(0.0, maxEnergy)
    return getEnergy()
  }

  private enum class PaceQuality { EXCELLENT, GOOD, NORMAL, BAD, OVER_EXERTION }

  private fun evaluatePace(current: Double?, target: Double): PaceQuality {
    val p = current ?: return PaceQuality.BAD
    if (!p.isFinite() || p <= 0) return PaceQuality.BAD
    val diff = kotlin.math.abs(p - target)
    if (p < target - 1.5) return PaceQuality.OVER_EXERTION
    return when {
      diff < 0.25 -> PaceQuality.EXCELLENT
      diff < 0.6 -> PaceQuality.GOOD
      diff < 1.2 -> PaceQuality.NORMAL
      else -> PaceQuality.BAD
    }
  }
}
