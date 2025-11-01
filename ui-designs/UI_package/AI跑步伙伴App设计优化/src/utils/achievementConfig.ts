// 成就系统配置文件

export type AchievementType = 'speed' | 'explorer' | 'first-step' | 'distance' | 'endurance' | 'consistency';

export interface AchievementConfig {
  id: string;
  type: AchievementType;
  title: string;
  description: string;
  // 解锁条件
  condition: (stats: RunStats, history?: RunHistory) => boolean;
}

export interface RunStats {
  distance: number;
  duration: number;
  pace: string;
  calories: number;
  energyGained: number;
}

export interface RunHistory {
  totalRuns: number;
  totalDistance: number;
  totalDuration: number;
  bestPace?: string;
  uniqueRoutes?: number;
}

// 所有可用的成就配置
export const ACHIEVEMENTS: AchievementConfig[] = [
  {
    id: 'first-step',
    type: 'first-step',
    title: '启程之步',
    description: '完成首次跑步',
    condition: (stats, history) => (history?.totalRuns || 0) >= 1,
  },
  {
    id: 'speed-pioneer',
    type: 'speed',
    title: '速度先锋',
    description: '配速达到 5\'00"/km 以内',
    condition: (stats) => {
      const [min, sec] = stats.pace.replace('"', '').split("'").map(Number);
      return min * 60 + sec <= 300; // 5分钟以内
    },
  },
  {
    id: 'explorer',
    type: 'explorer',
    title: '初探者',
    description: '探索 5 条不同路线',
    condition: (stats, history) => (history?.uniqueRoutes || 0) >= 5,
  },
  {
    id: 'distance-5k',
    type: 'distance',
    title: '5K达人',
    description: '单次跑步达到 5 公里',
    condition: (stats) => stats.distance >= 5,
  },
  {
    id: 'distance-10k',
    type: 'distance',
    title: '10K勇士',
    description: '单次跑步达到 10 公里',
    condition: (stats) => stats.distance >= 10,
  },
  {
    id: 'endurance-30min',
    type: 'endurance',
    title: '持久之星',
    description: '单次跑步坚持 30 分钟以上',
    condition: (stats) => stats.duration >= 1800, // 30分钟
  },
  {
    id: 'endurance-60min',
    type: 'endurance',
    title: '耐力传说',
    description: '单次跑步坚持 60 分钟以上',
    condition: (stats) => stats.duration >= 3600, // 60分钟
  },
  {
    id: 'consistency-3',
    type: 'consistency',
    title: '三日之约',
    description: '连续 3 天跑步',
    condition: (stats, history) => false, // 需要日期数据
  },
];

// 根据跑步数据检查解锁的成就
export function checkAchievements(
  stats: RunStats,
  history?: RunHistory
): AchievementConfig[] {
  return ACHIEVEMENTS.filter(achievement => 
    achievement.condition(stats, history)
  );
}

// 获取成就图标（用于成就墙显示）
export function getAchievementIcon(type: AchievementType): string {
  const icons: Record<AchievementType, string> = {
    'first-step': '🏃',
    'speed': '⚡',
    'explorer': '🗺️',
    'distance': '📏',
    'endurance': '💪',
    'consistency': '🔥',
  };
  return icons[type] || '🏆';
}

// 获取成就颜色
export function getAchievementColor(type: AchievementType): {
  from: string;
  to: string;
} {
  const colors: Record<AchievementType, { from: string; to: string }> = {
    'first-step': { from: '#34C759', to: '#30D158' },
    'speed': { from: '#4A9EFF', to: '#5AC8FA' },
    'explorer': { from: '#FF9500', to: '#FFCC00' },
    'distance': { from: '#FF6B8B', to: '#FF8FA3' },
    'endurance': { from: '#BF5AF2', to: '#DA8FFF' },
    'consistency': { from: '#FF453A', to: '#FF6961' },
  };
  return colors[type] || { from: '#FFD700', to: '#FFA500' };
}
