# MovAIQ 开发指南

本文档提供了 MovAIQ（元气跑伴）项目的开发规范和最佳实践。

## 一、通用开发规范

### 1.1 代码结构
- 优先使用 **flexbox** 和 **grid** 布局，避免不必要的绝对定位
- 保持文件简洁，单个组件文件不超过500行
- 将辅助函数和工具类抽离到独立文件（如 `hartUtils.ts`）
- 复杂组件拆分为子组件（如 Hart 系统拆分为多个子组件）

### 1.2 TypeScript 使用
- 所有组件必须定义 Props 接口
- 使用类型而非 any
- 导出共享的类型定义（如 `AchievementType`）

### 1.3 代码风格
- 使用有意义的变量名和函数名（中文注释辅助说明）
- 保持代码简洁，避免过度嵌套
- 使用现代 React 特性（Hooks、函数组件）

---

## 二、设计系统规范

### 2.1 颜色使用

**主色调**
- 元气粉 `#FF6B8B` - 用于主要操作、高亮、哈特高能状态
- 科技蓝 `#4A90E2` - 用于地图、导航、冷静提示

**哈特等级颜色**（严格遵守）
```typescript
Lv.5: #FF2D55 → #FF6B8B  // 鲜红渐变
Lv.4: #FF3B30 → #FF6B8B  // 健康红
Lv.3: #C7233A             // 暗红
Lv.2: #8B1A1A             // 暗紫红
Lv.1: #4A2424             // 灰暗
Lv.0: #2C2C2C             // 深灰黑
```

**背景体系**
- 主背景：`#000000` 或 `#0A0A0A`（极深炭黑）
- 卡片背景：使用毛玻璃效果
  ```css
  background: rgba(42, 42, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  ```

**文字颜色**
- 一级信息：`#FFFFFF`（纯白）
- 二级信息：`#CCCCCC`
- 三级信息：`#999999`
- 禁用状态：`#4D4D4D`

### 2.2 字体系统

**禁止使用的 Tailwind 类**
- ❌ 不要使用字号类：`text-xl`, `text-2xl`, `text-lg` 等
- ❌ 不要使用字重类：`font-bold`, `font-semibold` 等
- ❌ 不要使用行高类：`leading-tight`, `leading-none` 等

**原因**：项目在 `globals.css` 中已定义完整的 typography 系统

**正确做法**
```tsx
// ✅ 正确：使用HTML语义标签
<h1>页面标题</h1>
<h2>区块标题</h2>
<p>正文内容</p>
<button>按钮文字</button>

// ✅ 需要特殊字体时，使用内联样式
<span style={{ fontSize: '120px', fontWeight: 900 }}>5.0</span>

// ✅ 数字使用等宽字体
<span className="tabular-nums">12:34</span>
```

### 2.3 间距系统

使用 Tailwind 标准间距
- `p-2` (8px), `p-3` (12px), `p-4` (16px), `p-6` (24px), `p-8` (32px)
- `gap-2`, `gap-3`, `gap-4` 用于 flex/grid 间距
- 避免使用自定义间距值，除非有特殊设计需求

### 2.4 圆角系统

- 小圆角：`rounded-lg` (8px) - 用于按钮、小卡片
- 中圆角：`rounded-xl` (12px) - 用于中等卡片
- 大圆角：`rounded-2xl` (16px) - 用于大卡片
- 超大圆角：`rounded-3xl` (24px) - 用于弹窗、分享卡片
- 圆形：`rounded-full` - 用于头像、图标按钮

---

## 三、布局规范

### 3.1 屏幕适配

**强制要求**：所有主要页面必须使用 `h-screen` 布局
- ✅ 确保内容在一屏内显示，无需整页滚动
- ✅ 需要滚动的区域限制在特定内容区（如历史记录列表）
- ✅ 使用 `overflow-hidden` 防止意外滚动

```tsx
// ✅ 正确示例
<div className="h-screen flex flex-col bg-black overflow-hidden">
  {/* 固定高度的头部 */}
  <header className="flex-shrink-0">...</header>
  
  {/* 可滚动的内容区 */}
  <main className="flex-1 overflow-y-auto">...</main>
  
  {/* 固定高度的底部 */}
  <footer className="flex-shrink-0">...</footer>
</div>
```

### 3.2 响应式设计

虽然 MovAIQ 主要面向移动端，但应保持基本的响应式：
- 使用 `max-w-[540px]` 限制最大宽度
- 在桌面端居中显示
- 使用相对单位而非绝对像素（除了特殊设计需求）

---

## 四、动画规范

### 4.1 使用 Motion (Framer Motion)

**导入方式**
```typescript
import { motion } from 'motion/react';
```

**基本原则**
- 所有页面切换使用淡入淡出动画
- 元素入场使用 `initial`, `animate`, `exit`
- 保持动画时长在 0.2s-0.6s 之间
- 使用 `type: 'spring'` 实现弹性效果

**示例**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  内容
</motion.div>
```

### 4.2 性能优化

- 避免同时运行过多动画
- 使用 `will-change` 优化动画性能
- 无限循环动画谨慎使用（如哈特心跳）
- 在下载分享卡片时冻结动画

---

## 五、组件开发规范

### 5.1 哈特系统

**等级判断**
```typescript
import { getHartLevelFromEnergy } from './components/hart/hartUtils';

const hartLevel = getHartLevelFromEnergy(energyValue);
// 返回 0-5
```

**使用哈特组件**
```tsx
<Hart 
  level={hartLevel}           // 0-5
  size="large"                // 'small' | 'medium' | 'large'
  isBeating={true}            // 是否显示心跳动画
  isSleeping={false}          // 是否沉睡状态
/>
```

### 5.2 成就系统

**统一使用配置文件**
```typescript
import { ACHIEVEMENTS, checkAchievements } from '../utils/achievementConfig';

// 检查解锁的成就
const unlocked = checkAchievements(runStats, userHistory);

// 显示成就徽章
<AchievementBadgeNew
  type={achievement.type}
  title={achievement.title}
  isUnlocked={true}
  size="medium"
/>
```

**不要**创建独立的成就配置，统一在 `achievementConfig.ts` 管理

### 5.3 全屏组件规范

MovAIQ 中有三个核心功能采用全屏展示：
- 元气值计分规则 (`EnergyRulesDialog`)
- 目标管理 (`GoalSheet`)
- 社交分享卡片 (`ShareCard`)

**全屏组件结构**
```tsx
<motion.div
  className="fixed inset-0 z-50 bg-black flex flex-col"
  onClick={onClose}  // 点击背景关闭
>
  {/* 顶部标题栏 - flex-shrink-0 */}
  <div className="flex-shrink-0">...</div>
  
  {/* 内容区 - flex-1 overflow-y-auto */}
  <div 
    className="flex-1 overflow-y-auto"
    onClick={(e) => e.stopPropagation()}  // 防止点击内容关闭
  >
    ...
  </div>
  
  {/* 底部按钮/提示 - flex-shrink-0 */}
  <div className="flex-shrink-0">...</div>
</motion.div>
```

**关键要点**
- 使用 `fixed inset-0` 占据全屏
- 使用 `flex flex-col` 布局，分为头部、内容区、底部
- 点击背景区域关闭，点击内容区使用 `stopPropagation()` 防止关闭
- 内容区使用 `flex-1 overflow-y-auto` 允许滚动
- 头部和底部使用 `flex-shrink-0` 固定高度
- 遵循字体规范：使用内联样式，不使用 Tailwind 字体类

### 5.4 数据卡片

**元气值卡片**必须根据等级动态调整样式：
```tsx
// 根据等级计算样式
const getEnergyCardStyle = (level: number) => {
  if (level >= 4) {
    return {
      background: 'linear-gradient(...)',
      border: '2px solid #FF6B8B',
      boxShadow: '0 4px 30px rgba(255, 107, 139, 0.4)',
    };
  }
  // ... 其他等级
};
```

---

## 六、数据管理规范

### 6.1 状态管理

- 使用 React `useState` 和 `useEffect` 管理本地状态
- 跨组件共享的状态通过 props 传递
- 复杂状态考虑使用 `useReducer`

### 6.2 数据格式

**跑步数据**
```typescript
interface RunStats {
  distance: number;      // 距离（km）
  duration: number;      // 时长（秒）
  pace: string;          // 配速（如 "5'30\""）
  calories: number;      // 卡路里
  energyGained: number;  // 获得的元气值
}
```

**元气值计算**
```typescript
// 每公里 +5 元气值
energyGained = Math.floor(distance * 5);
```

---

## 七、图标使用规范

### 7.1 统一使用 Lucide React

```typescript
import { Play, Pause, Square, MapPin, Navigation } from 'lucide-react';

<Play size={24} className="text-white" />
```

### 7.2 常用图标

- 跑步：`Activity`
- 播放：`Play`
- 暂停：`Pause`
- 停止：`Square`
- 地图：`Map`, `MapPin`
- 导航：`Navigation`
- 数据：`BarChart2`, `TrendingUp`
- 成就：`Trophy`, `Award`
- 分享：`Share2`
- 关闭：`X`
- 下载：`Download`

---

## 八、特殊交互规范

### 8.1 按钮反馈

所有可点击元素必须有视觉反馈：
```tsx
<motion.button
  whileTap={{ scale: 0.95 }}
  className="..."
>
  按钮文字
</motion.button>
```

### 8.2 滚动区域

需要滚动的区域必须：
- 明确设置高度或使用 flex 布局
- 添加 `overflow-y-auto` 或 `overflow-y-scroll`
- 使用自定义滚动条样式（`custom-scrollbar` 类）

```tsx
<div className="flex-1 overflow-y-auto custom-scrollbar">
  {/* 可滚动内容 */}
</div>
```

---

## 九、调试和测试

### 9.1 调试面板

在开发模式下可使用调试面板：
- 首页右侧有元气值调试滑块
- 可快速测试不同等级的哈特状态

### 9.2 控制台输出

- 使用 `console.log` 输出关键信息
- 生产环境前删除调试代码
- 错误使用 `console.error`

---

## 十、文件命名规范

### 10.1 组件文件
- 使用 PascalCase：`HomePage.tsx`, `ShareCard.tsx`
- 子组件放在同名文件夹：`/hart/Hart.tsx`

### 10.2 工具文件
- 使用 camelCase：`hartUtils.ts`, `achievementConfig.ts`

### 10.3 文档文件
- 使用 PascalCase + README：`ShareCardREADME.md`
- 设计文档：`MovAIQ_Design_Brief_Optimized.md`
- 开发规范：`guidelines/Guidelines.md`（当前文件）

---

## 十一、Git 提交规范

### 11.1 提交信息格式
```
类型: 简短描述

详细描述（可选）
```

### 11.2 类型
- `feat`: 新功能
- `fix`: 修复bug
- `style`: 样式调整
- `refactor`: 重构
- `docs`: 文档更新
- `perf`: 性能优化

**示例**
```
feat: 添加全屏分享卡片功能

- 修改ShareCard组件支持全屏显示
- 优化下载功能，冻结动画
- 更新相关文档
```

---

## 十二、注意事项

### ❌ 禁止操作
1. 不要修改 `globals.css` 中的 typography 系统（除非有充分理由）
2. 不要创建重复的成就配置
3. 不要使用 Tailwind 字体相关类（text-xl、font-bold等）
4. 不要在没有 `h-screen` 的页面上实现全屏滚动
5. 不要在全屏组件的内容区忘记使用 `stopPropagation()`

### ✅ 推荐做法
1. 复用现有组件和工具函数
2. 保持设计一致性
3. 添加适当的注释
4. 测试不同元气值等级下的效果
5. 确保动画流畅（60fps）
6. 全屏组件使用统一的布局结构（flex-col + 三分区）
7. 使用内联样式设置字号和字重

---

**持续更新中...**

有任何疑问或建议，请参考设计文档或联系项目维护者。
