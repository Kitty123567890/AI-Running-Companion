/**
 * Energy (元气值) System for AI Running Companion
 * 基于Figma设计的元气值机制和哈特心脏形象系统
 */

class EnergySystem {
  constructor() {
    this.energy = 100; // 当前元气值 (0-100)
    this.maxEnergy = 100;
    this.lastUpdateTime = Date.now();

    // 元气值变化速率
    this.rates = {
      goodPace: 0.5,        // 配速良好时每秒获得的元气
      excellentPace: 1.0,   // 配速优秀时的奖励
      badPace: -0.8,        // 配速不佳时的元气消耗
      idle: -0.05,          // 未运动时的缓慢流失
      resting: 0.3,         // 休息时的恢复速率
      overExertion: -1.5    // 过度运动时的惩罚
    };

    // 哈特心脏状态（基于Figma设计）
    this.heartStates = [
      {
        min: 0, max: 20,
        state: 'critical',
        color: '#8B0000',      // 深红色 - 危险
        gradient: 'linear-gradient(135deg, #8B0000, #DC143C)',
        scale: 0.7,
        beatSpeed: 2.5,
        message: '需要休息！'
      },
      {
        min: 21, max: 40,
        state: 'low',
        color: '#FF6347',      // 番茄红 - 疲劳
        gradient: 'linear-gradient(135deg, #FF6347, #FF7F50)',
        scale: 0.85,
        beatSpeed: 2.0,
        message: '有点累了'
      },
      {
        min: 41, max: 60,
        state: 'normal',
        color: '#FFA500',      // 橙色 - 普通
        gradient: 'linear-gradient(135deg, #FFA500, #FFB347)',
        scale: 1.0,
        beatSpeed: 1.5,
        message: '继续加油'
      },
      {
        min: 61, max: 80,
        state: 'good',
        color: '#FF7A59',      // Figma设计主色 - 良好
        gradient: 'linear-gradient(135deg, #FF7A59, #FF5D6C)',
        scale: 1.1,
        beatSpeed: 1.2,
        message: '状态不错！'
      },
      {
        min: 81, max: 100,
        state: 'excellent',
        color: '#FF4500',      // 橙红色 - 极佳
        gradient: 'linear-gradient(135deg, #FF6B35, #F7931E)',
        scale: 1.25,
        beatSpeed: 0.9,
        message: '元气满满！'
      }
    ];
  }

  /**
   * 更新元气值（基于运动数据）
   */
  updateEnergy(metrics) {
    const now = Date.now();
    const deltaTime = (now - this.lastUpdateTime) / 1000; // 转换为秒
    this.lastUpdateTime = now;

    if (!metrics.running) {
      // 未在跑步
      if (metrics.justStopped) {
        this.energy += this.rates.resting * deltaTime;
      } else {
        this.energy += this.rates.idle * deltaTime;
      }
    } else {
      // 正在跑步 - 根据配速质量计算元气变化
      const paceQuality = this.evaluatePace(
        metrics.instantPace,
        metrics.targetPace || 6.0
      );

      let energyChange = 0;

      switch (paceQuality) {
        case 'excellent':
          energyChange = this.rates.excellentPace * deltaTime;
          break;
        case 'good':
          energyChange = this.rates.goodPace * deltaTime;
          break;
        case 'bad':
          energyChange = this.rates.badPace * deltaTime;
          break;
        case 'overExertion':
          energyChange = this.rates.overExertion * deltaTime;
          break;
      }

      // 配速稳定性奖励
      if (metrics.paceConsistency && metrics.paceConsistency > 0.85) {
        energyChange *= 1.3;
      }

      // 长时间运动的疲劳惩罚
      if (metrics.duration > 3600) { // 超过1小时
        const fatigueMultiplier = Math.max(0.5, 1 - (metrics.duration - 3600) / 7200);
        energyChange *= fatigueMultiplier;
      }

      // 心率区间调整
      if (metrics.heartRate) {
        if (metrics.heartRate > 180) {
          energyChange *= 0.6; // 心率过高惩罚
        } else if (metrics.heartRate > 160) {
          energyChange *= 0.8;
        } else if (metrics.heartRate >= 120 && metrics.heartRate <= 150) {
          energyChange *= 1.1; // 理想心率区间奖励
        }
      }

      this.energy += energyChange;
    }

    // 限制在0-100范围内
    this.energy = Math.max(0, Math.min(this.maxEnergy, this.energy));

    return this.energy;
  }

  /**
   * 评估配速质量
   */
  evaluatePace(currentPace, targetPace = 6.0) {
    if (!currentPace || currentPace === Infinity || currentPace <= 0) {
      return 'bad';
    }

    const difference = Math.abs(currentPace - targetPace);

    // 配速过快可能是过度运动
    if (currentPace < targetPace - 1.5) {
      return 'overExertion';
    }

    if (difference < 0.25) return 'excellent'; // 15秒以内
    if (difference < 0.6) return 'good';       // 36秒以内
    if (difference < 1.2) return 'normal';     // 72秒以内

    return 'bad';
  }

  /**
   * 获取当前哈特心脏状态
   */
  getHeartState() {
    for (const state of this.heartStates) {
      if (this.energy >= state.min && this.energy <= state.max) {
        return { ...state, energy: this.getEnergy() };
      }
    }
    return { ...this.heartStates[2], energy: this.getEnergy() };
  }

  /**
   * 获取元气值
   */
  getEnergy() {
    return Math.round(this.energy);
  }

  /**
   * 获取元气百分比
   */
  getEnergyPercent() {
    return `${this.getEnergy()}%`;
  }

  /**
   * 添加元气奖励（如完成里程碑）
   */
  addBoost(amount, reason) {
    this.energy += amount;
    this.energy = Math.min(this.maxEnergy, this.energy);

    console.log(`元气值提升 +${amount} (${reason})`);
    return this.energy;
  }

  /**
   * 重置元气值
   */
  reset() {
    this.energy = this.maxEnergy;
    this.lastUpdateTime = Date.now();
  }

  /**
   * 获取激励语
   */
  getMotivationalMessage() {
    const state = this.getHeartState();
    return state.message;
  }

  /**
   * 获取详细状态
   */
  getDetailedStatus() {
    const state = this.getHeartState();
    return {
      energy: this.getEnergy(),
      percent: this.getEnergyPercent(),
      state: state.state,
      color: state.color,
      gradient: state.gradient,
      scale: state.scale,
      beatSpeed: state.beatSpeed,
      message: state.message
    };
  }
}

// 导出供使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnergySystem;
}
