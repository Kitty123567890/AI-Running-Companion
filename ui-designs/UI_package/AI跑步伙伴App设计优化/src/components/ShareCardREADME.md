# 社交分享卡片 - 使用说明

## 功能概述

ShareCard 组件提供了一个精美的全屏社交分享卡片，用于展示和分享跑步成就。点击分享按钮后，卡片会以全屏沉浸式方式展示，提供最佳的预览和下载体验。

## 核心功能

### 1. 全屏沉浸式展示
- 点击分享按钮后，卡片直接全屏显示
- 纯黑背景，完全沉浸式体验
- 卡片最大化显示（最高90vh），保持4:5社交媒体比例
- 点击卡片外部区域或关闭按钮退出

### 2. 高清图片下载
- 点击顶部右侧的下载按钮，自动将卡片保存为 PNG 图片
- 文件名格式：`MovAIQ-跑步记录-2025-01-30-14-30-25.png`（自动添加时间戳）
- 高分辨率输出（2x scale）确保图片清晰
- 下载时冻结所有动画，确保静态截图质量
- 显示加载状态和进度提示

### 3. 精美的视觉设计
- **1080x1350 竖版比例（4:5）**，完美适配社交媒体分享
- **强烈渐变背景**：粉红 → 蓝色 → 深蓝渐变，视觉冲击力强
- **多层次光晕效果**：顶部、底部、中间多层光晕营造氛围
- **动态路线图**：SVG路线动画展示跑步轨迹
- **哈特形象整合**：显示当前等级的哈特形象
- **元气值系统展示**：突出显示获得的元气值
- **AI 鼓励语录**：根据跑步数据动态生成的鼓励语

### 4. 完整数据展示

**A. 顶部品牌区**
- 品牌名称：元气跑伴 / MovAIQ
- 品牌图标

**B. 核心数据展示区**
- **主数据 - 距离**：超大号字体（120px），带装饰性背景数字
- **次级数据**：时长、配速，分栏显示

**C. 路线图与哈特整合区**
- 简化的路线图可视化（SVG动画）
- 起点和终点标记
- 哈特形象放置在终点位置

**D. 元气值与成就徽章区**
- 元气值增益显示（带脉动效果）
- 最多显示2个解锁的成就徽章

**E. AI语录区**
- 根据跑步距离动态生成：
  - ≥10km: "今天的风也追不上你的脚步！"
  - ≥5km: "每一步都在突破自己，继续保持！"
  - <5km: "完美的开始，下次会更棒！"
- 带引号装饰和哈特署名

**F. 底部水印与二维码区**
- "由「元气跑伴」生成" 水印
- 简化的二维码图案
- "扫码下载 MovAIQ" 提示

## 技术实现

### 依赖库
- `html2canvas` - 动态导入，将 HTML 元素转换为图片
- `motion/react` - 入场和退出动画效果
- `lucide-react` - 图标（X, Download）

### 下载流程
1. 用户点击下载按钮
2. 设置下载状态，显示加载提示
3. 等待300ms确保所有动画完成
4. 动态导入 `html2canvas` 库
5. 使用 `html2canvas` 渲染卡片为 Canvas
   - 设置黑色背景色
   - 2倍分辨率（scale: 2）
   - 使用 `onclone` 回调冻结所有动画
6. 将 Canvas 转换为 PNG Blob（最高质量1.0）
7. 创建下载链接并触发下载
8. 清理临时 URL
9. 重置下载状态

### 配置选项
```typescript
html2canvas(element, {
  backgroundColor: '#0A0A0A',  // 深色背景
  scale: 2,                     // 2倍分辨率
  useCORS: true,                // 允许跨域资源
  allowTaint: true,             // 允许污染的 canvas
  logging: false,               // 关闭日志
  onclone: (clonedDoc) => {
    // 冻结所有动画，确保静态截图
    // 移除动画和过渡效果
  }
})
```

## 界面布局

### 顶部按钮栏（绝对定位）
- 左侧：提示文字"点击卡片外区域关闭"
- 右侧：下载按钮 + 关闭按钮

### 中央卡片区
- 最大宽度：540px
- 最大高度：90vh
- 宽高比：4:5
- 圆角：24px
- 阴影：大阴影效果

### 底部提示区（绝对定位）
- 显示下载提示或加载状态
- 半透明白色文字

## 浏览器兼容性

- ✅ Chrome/Edge（推荐，最佳效果）
- ✅ Firefox
- ✅ Safari
- ✅ 移动端浏览器

## 备用方案

如果自动下载失败，用户可以：
- 查看错误提示
- 使用系统截屏功能
- 移动端：可能需要长按保存（取决于浏览器）

## 使用示例

```tsx
import { ShareCard } from './ShareCard';
import { useState } from 'react';

function SummaryPage() {
  const [showShareCard, setShowShareCard] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowShareCard(true)}>
        分享
      </button>
      
      <AnimatePresence>
        {showShareCard && (
          <ShareCard
            stats={{
              distance: 5.2,
              duration: "30:00",
              pace: "5'45\"",
              calories: 260,
              route: [], // 可选的路线数据
            }}
            energyGained={26}
            energyValue={85}
            achievements={[
              { type: 'first-step', title: '启程之步' },
              { type: 'speed', title: '速度先锋' },
            ]}
            onClose={() => setShowShareCard(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
```

## Props 说明

```typescript
interface ShareCardProps {
  stats: {
    distance: number | string;  // 距离（km）
    duration: string;            // 时长（格式化字符串）
    pace: string;                // 配速（格式化字符串）
    calories: number;            // 卡路里
    route?: { lat: number; lng: number }[];  // 可选的路线数据
  };
  energyGained: number;          // 本次获得的元气值
  energyValue: number;           // 当前总元气值（用于显示哈特等级）
  achievements?: {
    type: AchievementType;       // 成就类型
    title: string;               // 成就标题
  }[];
  onClose: () => void;           // 关闭回调
}
```

## 优化建议

### 性能优化
- ✅ 动态导入 `html2canvas`，减少初始加载体积
- ✅ 使用静态装饰效果替代无限循环动画，减少GPU负担
- ✅ 下载时冻结动画，确保截图质量

### 用户体验优化
- ✅ 全屏沉浸式展示，更好的预览效果
- ✅ 清晰的操作提示（顶部和底部）
- ✅ 加载状态指示器
- ✅ 点击卡片外部退出，符合用户习惯
- ✅ 自动时间戳文件名，避免冲突

### 视觉优化
- ✅ 图片质量设置为最高（1.0）
- ✅ 分辨率 2x 确保在高分屏上清晰
- ✅ 渐变背景和多层光晕，增强视觉吸引力
- ✅ 统一的设计语言和MovAIQ品牌风格

## 已知限制

1. **动画效果**：为了确保下载图片质量，下载时会冻结所有动画
2. **浏览器支持**：某些移动浏览器可能对 `html2canvas` 支持有限
3. **文件大小**：高分辨率图片可能较大（约200-500KB）

## 未来改进方向

- [ ] 支持多种分享比例（1:1方形、16:9横版等）
- [ ] 支持自定义配色主题
- [ ] 添加更多装饰元素和样式选项
- [ ] 支持直接分享到社交平台（需要平台API支持）
- [ ] 添加二维码实际生成功能（当前为装饰性图案）
