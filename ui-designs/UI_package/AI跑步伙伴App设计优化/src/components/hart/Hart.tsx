import { motion } from 'motion/react';
import { HartFace } from './HartFace';
import { HartDecorations } from './HartDecorations';
import { HartParticles } from './HartParticles';
import { getHartConfig } from './hartUtils';

export type HartLevel = 0 | 1 | 2 | 3 | 4 | 5;

interface HartProps {
  level: HartLevel;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  onClick?: () => void;
  animationType?: 'idle' | 'awakening' | 'celebrate' | 'encourage' | 'thinking' | 'hurt';
  isBeating?: boolean; // 控制是否执行心跳动画
}

const sizeMap = {
  small: { width: 60, height: 54 },
  medium: { width: 80, height: 72 },
  large: { width: 120, height: 108 },
  xlarge: { width: 140, height: 126 },
};

export function Hart({ 
  level, 
  size = 'large', 
  onClick,
  animationType = 'idle',
  isBeating = true
}: HartProps) {
  const config = getHartConfig(level);
  const dimensions = sizeMap[size];
  
  // 心跳动画配置
  const heartbeatAnimation = isBeating ? {
    scale: [1, config.animation.firstBeat, 1, config.animation.secondBeat, 1],
  } : {};
  
  const heartbeatTransition = isBeating ? {
    duration: 0.4,
    times: [0, 0.15, 0.20, 0.32, 0.40],
    repeat: Infinity,
    repeatDelay: config.animation.interval,
    ease: "easeInOut"
  } : {};
  
  // 浮动动画（仅高等级）
  const floatAnimation = level >= 4 ? {
    y: [0, -6, 0],
  } : {};
  
  const floatTransition = level >= 4 ? {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  } : {};

  return (
    <motion.div
      className="relative flex items-center justify-center cursor-pointer"
      style={{ width: dimensions.width, height: dimensions.height }}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      animate={{
        ...heartbeatAnimation,
        ...floatAnimation,
      }}
      transition={{
        scale: heartbeatTransition,
        y: floatTransition,
      }}
    >
      {/* 光晕效果 */}
      {config.glow.visible && (
        <>
          {config.glow.layers.map((layer, index) => (
            <motion.div
              key={index}
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${layer.color} 0%, transparent 70%)`,
                filter: 'blur(20px)',
                transform: 'scale(1.5)',
              }}
              animate={{
                scale: [1.5, layer.maxScale, 1.5],
                opacity: [layer.opacity, layer.opacity * 0.8, layer.opacity],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </>
      )}
      
      {/* 装饰元素（乌云、闪电等） */}
      <HartDecorations level={level} />
      
      {/* 心形主体 */}
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 120 108"
        className="relative z-10"
      >
        <defs>
          <linearGradient id={`heartGradient-${level}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={config.colors.primary} />
            <stop offset="100%" stopColor={config.colors.secondary || config.colors.primary} />
          </linearGradient>
          
          <filter id={`glow-${level}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* 心形路径 */}
        <path
          d="M60,25 C60,15 50,8 40,8 C25,8 15,20 15,32 C15,50 35,68 60,95 C85,68 105,50 105,32 C105,20 95,8 80,8 C70,8 60,15 60,25 Z"
          fill={`url(#heartGradient-${level})`}
          filter={level >= 4 ? `url(#glow-${level})` : undefined}
          opacity={config.opacity}
        />
        
        {/* 裂纹 (Lv.0-2) */}
        {config.cracks && config.cracks.map((crack, index) => (
          <path
            key={index}
            d={crack}
            stroke="#1A0A0A"
            strokeWidth="1.5"
            fill="none"
            opacity="0.6"
          />
        ))}
        
        {/* 绷带 (Lv.0) */}
        {level === 0 && (
          <g opacity="0.9">
            <rect x="40" y="40" width="40" height="8" fill="#F5F5F5" rx="2" transform="rotate(-20 60 44)" />
            <rect x="40" y="60" width="40" height="8" fill="#F5F5F5" rx="2" transform="rotate(15 60 64)" />
            <ellipse cx="50" cy="45" rx="3" ry="4" fill="#8B0000" opacity="0.4" />
            <ellipse cx="70" cy="65" rx="3" ry="4" fill="#8B0000" opacity="0.4" />
          </g>
        )}
        
        {/* 面部表情 */}
        <HartFace level={level} />
      </svg>
      
      {/* 粒子效果（高等级）*/}
      {level >= 4 && <HartParticles level={level} />}
    </motion.div>
  );
}
