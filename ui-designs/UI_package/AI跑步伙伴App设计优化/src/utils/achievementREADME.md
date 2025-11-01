# 成就系统使用指南

## 概述
统一的成就系统配置，用于跑步结束页和成就墙的成就展示。

## 核心文件
- `/utils/achievementConfig.ts` - 成就系统配置和工具函数
- `/components/AchievementBadgeNew.tsx` - 成就徽章UI组件

## 使用方法

### 1. 在跑步结束页检查解锁成就

```typescript
import { checkAchievements } from '../utils/achievementConfig';

// 在SummaryPage中
const unlockedAchievements = checkAchievements({
  distance: stats.distance,
  duration: stats.duration,
  pace: stats.pace,
  calories: stats.calories,
  energyGained: stats.energyGained,
}, {
  totalRuns: 1,
  totalDistance: stats.distance,
  totalDuration: stats.duration,
});

// 显示解锁的成就
{unlockedAchievements.map(achievement => (
  <AchievementBadgeNew
    type={achievement.type}
    title={achievement.title}
    isUnlocked={true}
  />
))}
```

### 2. 在成就墙显示所有成就

```typescript
import { ACHIEVEMENTS } from '../utils/achievementConfig';

// 在HistoryPage中
const achievements = ACHIEVEMENTS.map(config => ({
  id: config.id,
  type: config.type,
  title: config.title,
  description: config.description,
  isUnlocked: /* 从用户数据获取 */,
}));
```

### 3. 自定义成就徽章显示

```typescript
<AchievementBadgeNew
  type="speed"           // 成就类型
  title="速度先锋"       // 可选，覆盖默认标题
  size="small"           // 'small' | 'medium' | 'large' | number
  isUnlocked={true}      // 是否已解锁
  showTitle={true}       // 是否显示标题
/>
```

## 成就类型

- `speed` - 速度先锋（蓝色箭头）
- `explorer` - 初探者（橙色指南针）
- `first-step` - 启程之步（绿色脚印）
- `distance` - 距离达人（粉色星星）
- `endurance` - 持久之星（紫色星星）
- `consistency` - 坚持不懈（红色星星）

## 添加新成就

在 `/utils/achievementConfig.ts` 的 `ACHIEVEMENTS` 数组中添加：

```typescript
{
  id: 'unique-id',
  type: 'speed',  // 或其他类型
  title: '成就名称',
  description: '成就描述',
  condition: (stats, history) => {
    // 返回true表示解锁
    return stats.distance >= 10;
  },
}
```

## 颜色定制

在 `getAchievementColor()` 函数中修改颜色：

```typescript
'new-type': { from: '#开始颜色', to: '#结束颜色' }
```
