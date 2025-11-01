import { motion } from 'motion/react';

interface AchievementBadgeProps {
  type: 'milestone' | 'location' | 'distance' | 'frequency' | 'special';
  variant?: string;
  size?: number;
  isUnlocked?: boolean;
}

export function AchievementBadge({ 
  type, 
  variant = 'default', 
  size = 64,
  isUnlocked = false 
}: AchievementBadgeProps) {
  // 根据类型和变体返回不同的勋章设计
  const getBadgeDesign = () => {
    switch (type) {
      case 'milestone':
        return <MilestoneBadge variant={variant} size={size} isUnlocked={isUnlocked} />;
      case 'location':
        return <LocationBadge variant={variant} size={size} isUnlocked={isUnlocked} />;
      case 'distance':
        return <DistanceBadge variant={variant} size={size} isUnlocked={isUnlocked} />;
      case 'frequency':
        return <FrequencyBadge variant={variant} size={size} isUnlocked={isUnlocked} />;
      case 'special':
        return <SpecialBadge variant={variant} size={size} isUnlocked={isUnlocked} />;
      default:
        return <MilestoneBadge variant={variant} size={size} isUnlocked={isUnlocked} />;
    }
  };

  return (
    <motion.div
      whileHover={isUnlocked ? { scale: 1.05 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {getBadgeDesign()}
    </motion.div>
  );
}

// 里程碑勋章 - 星形设计
function MilestoneBadge({ variant, size, isUnlocked }: { variant: string; size: number; isUnlocked: boolean }) {
  const colors = isUnlocked ? {
    outer: ['#FFD700', '#FFA500'],
    middle: ['#FF6B6B', '#FF8E53'],
    inner: ['#FFF4E6', '#FFE4B5'],
    accent: '#FFD700',
  } : {
    outer: ['#4A4A4A', '#2A2A2A'],
    middle: ['#3A3A3A', '#2A2A2A'],
    inner: ['#555555', '#3A3A3A'],
    accent: '#666666',
  };

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <radialGradient id={`milestone-outer-${variant}`} cx="50%" cy="50%">
          <stop offset="0%" stopColor={colors.outer[0]} stopOpacity="0.9" />
          <stop offset="100%" stopColor={colors.outer[1]} stopOpacity="0.7" />
        </radialGradient>
        <radialGradient id={`milestone-middle-${variant}`} cx="50%" cy="30%">
          <stop offset="0%" stopColor={colors.middle[0]} />
          <stop offset="100%" stopColor={colors.middle[1]} />
        </radialGradient>
        <radialGradient id={`milestone-inner-${variant}`} cx="50%" cy="50%">
          <stop offset="0%" stopColor={colors.inner[0]} />
          <stop offset="100%" stopColor={colors.inner[1]} />
        </radialGradient>
        <filter id={`milestone-glow-${variant}`}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* 外层光晕 */}
      {isUnlocked && (
        <circle cx="50" cy="50" r="48" fill={colors.accent} opacity="0.1" />
      )}
      
      {/* 外圈 - 星形 */}
      <path
        d="M 50,10 L 57,35 L 82,35 L 62,50 L 70,75 L 50,60 L 30,75 L 38,50 L 18,35 L 43,35 Z"
        fill={`url(#milestone-outer-${variant})`}
        stroke={colors.accent}
        strokeWidth="1"
        filter={isUnlocked ? `url(#milestone-glow-${variant})` : undefined}
      />
      
      {/* 中圈 - 八边形 */}
      <path
        d="M 50,25 L 62,30 L 70,40 L 70,60 L 62,70 L 38,70 L 30,60 L 30,40 L 38,30 Z"
        fill={`url(#milestone-middle-${variant})`}
        opacity="0.9"
      />
      
      {/* 内圈 - 圆形 */}
      <circle
        cx="50"
        cy="50"
        r="15"
        fill={`url(#milestone-inner-${variant})`}
        stroke={colors.accent}
        strokeWidth="1.5"
      />
      
      {/* 中心图标 - 奖杯符号 */}
      <path
        d="M 45,45 L 45,52 L 48,55 L 52,55 L 55,52 L 55,45 M 42,45 L 42,48 L 45,48 M 55,48 L 58,48 L 58,45 M 48,55 L 48,58 L 52,58 L 52,55 M 46,58 L 54,58"
        stroke={colors.accent}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* 装饰点 */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const x = 50 + Math.cos((angle * Math.PI) / 180) * 35;
        const y = 50 + Math.sin((angle * Math.PI) / 180) * 35;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="2"
            fill={colors.accent}
            opacity={isUnlocked ? "0.8" : "0.3"}
          />
        );
      })}
    </svg>
  );
}

// 地点勋章 - 六边形设计
function LocationBadge({ variant, size, isUnlocked }: { variant: string; size: number; isUnlocked: boolean }) {
  const colors = isUnlocked ? {
    outer: ['#4ECDC4', '#44A08D'],
    middle: ['#667EEA', '#764BA2'],
    inner: ['#A8EDEA', '#FED6E3'],
    accent: '#4ECDC4',
  } : {
    outer: ['#4A4A4A', '#2A2A2A'],
    middle: ['#3A3A3A', '#2A2A2A'],
    inner: ['#555555', '#3A3A3A'],
    accent: '#666666',
  };

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id={`location-outer-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.outer[0]} />
          <stop offset="100%" stopColor={colors.outer[1]} />
        </linearGradient>
        <linearGradient id={`location-middle-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.middle[0]} />
          <stop offset="100%" stopColor={colors.middle[1]} />
        </linearGradient>
        <radialGradient id={`location-inner-${variant}`}>
          <stop offset="0%" stopColor={colors.inner[0]} />
          <stop offset="100%" stopColor={colors.inner[1]} />
        </radialGradient>
        <filter id={`location-glow-${variant}`}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* 外层六边形 */}
      <path
        d="M 50,8 L 80,25 L 80,60 L 50,77 L 20,60 L 20,25 Z"
        fill={`url(#location-outer-${variant})`}
        stroke={colors.accent}
        strokeWidth="1.5"
        filter={isUnlocked ? `url(#location-glow-${variant})` : undefined}
      />
      
      {/* 中层六边形 */}
      <path
        d="M 50,20 L 70,32 L 70,55 L 50,67 L 30,55 L 30,32 Z"
        fill={`url(#location-middle-${variant})`}
        opacity="0.8"
      />
      
      {/* 内层圆形 */}
      <circle
        cx="50"
        cy="43"
        r="18"
        fill={`url(#location-inner-${variant})`}
        stroke={colors.accent}
        strokeWidth="1.5"
      />
      
      {/* 地图图钉图标 */}
      <path
        d="M 50,35 C 45,35 42,38 42,42 C 42,47 50,54 50,54 C 50,54 58,47 58,42 C 58,38 55,35 50,35 Z"
        fill={colors.accent}
        stroke="white"
        strokeWidth="1"
      />
      <circle cx="50" cy="42" r="3" fill="white" />
      
      {/* 装饰线条 */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const x1 = 50 + Math.cos((angle * Math.PI) / 180) * 38;
        const y1 = 50 + Math.sin((angle * Math.PI) / 180) * 38;
        const x2 = 50 + Math.cos((angle * Math.PI) / 180) * 42;
        const y2 = 50 + Math.sin((angle * Math.PI) / 180) * 42;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={colors.accent}
            strokeWidth="2"
            strokeLinecap="round"
            opacity={isUnlocked ? "0.6" : "0.3"}
          />
        );
      })}
    </svg>
  );
}

// 距离勋章 - 圆环设计
function DistanceBadge({ variant, size, isUnlocked }: { variant: string; size: number; isUnlocked: boolean }) {
  const colors = isUnlocked ? {
    outer: ['#FF6B6B', '#EE5A6F'],
    middle: ['#F06292', '#EC407A'],
    inner: ['#FFB6C1', '#FFC0CB'],
    accent: '#FF6B6B',
  } : {
    outer: ['#4A4A4A', '#2A2A2A'],
    middle: ['#3A3A3A', '#2A2A2A'],
    inner: ['#555555', '#3A3A3A'],
    accent: '#666666',
  };

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id={`distance-outer-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.outer[0]} />
          <stop offset="100%" stopColor={colors.outer[1]} />
        </linearGradient>
        <linearGradient id={`distance-middle-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.middle[0]} />
          <stop offset="100%" stopColor={colors.middle[1]} />
        </linearGradient>
        <radialGradient id={`distance-inner-${variant}`}>
          <stop offset="0%" stopColor={colors.inner[0]} />
          <stop offset="100%" stopColor={colors.inner[1]} />
        </radialGradient>
      </defs>
      
      {/* 外圆环 */}
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke={`url(#distance-outer-${variant})`}
        strokeWidth="8"
        opacity={isUnlocked ? "1" : "0.3"}
      />
      
      {/* 中圆环 */}
      <circle
        cx="50"
        cy="50"
        r="30"
        fill="none"
        stroke={`url(#distance-middle-${variant})`}
        strokeWidth="4"
        opacity={isUnlocked ? "0.8" : "0.3"}
      />
      
      {/* 内圆 */}
      <circle
        cx="50"
        cy="50"
        r="20"
        fill={`url(#distance-inner-${variant})`}
        stroke={colors.accent}
        strokeWidth="2"
      />
      
      {/* 跑步人形图标 */}
      <g transform="translate(50, 50)">
        {/* 头 */}
        <circle cx="0" cy="-8" r="3" fill={colors.accent} />
        {/* 身体和腿 */}
        <path
          d="M 0,-5 L 0,2 M -3,0 L 3,2 M 0,2 L -2,8 M 0,2 L 3,7"
          stroke={colors.accent}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
      
      {/* 装饰弧线 */}
      {[0, 90, 180, 270].map((angle, i) => (
        <path
          key={i}
          d={`M ${50 + Math.cos((angle * Math.PI) / 180) * 42} ${50 + Math.sin((angle * Math.PI) / 180) * 42} 
              A 3 3 0 0 1 ${50 + Math.cos(((angle + 30) * Math.PI) / 180) * 42} ${50 + Math.sin(((angle + 30) * Math.PI) / 180) * 42}`}
          stroke={colors.accent}
          strokeWidth="2"
          fill="none"
          opacity={isUnlocked ? "0.6" : "0.2"}
        />
      ))}
    </svg>
  );
}

// 频率勋章 - 钻石设计
function FrequencyBadge({ variant, size, isUnlocked }: { variant: string; size: number; isUnlocked: boolean }) {
  const colors = isUnlocked ? {
    outer: ['#667EEA', '#764BA2'],
    middle: ['#A8EDEA', '#FED6E3'],
    inner: ['#FBD786', '#F7797D'],
    accent: '#667EEA',
  } : {
    outer: ['#4A4A4A', '#2A2A2A'],
    middle: ['#3A3A3A', '#2A2A2A'],
    inner: ['#555555', '#3A3A3A'],
    accent: '#666666',
  };

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id={`frequency-outer-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.outer[0]} />
          <stop offset="100%" stopColor={colors.outer[1]} />
        </linearGradient>
        <linearGradient id={`frequency-middle-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.middle[0]} />
          <stop offset="100%" stopColor={colors.middle[1]} />
        </linearGradient>
        <linearGradient id={`frequency-inner-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.inner[0]} />
          <stop offset="100%" stopColor={colors.inner[1]} />
        </linearGradient>
      </defs>
      
      {/* 外层钻石形状 */}
      <path
        d="M 50,10 L 75,35 L 65,70 L 35,70 L 25,35 Z"
        fill={`url(#frequency-outer-${variant})`}
        stroke={colors.accent}
        strokeWidth="1.5"
        opacity={isUnlocked ? "1" : "0.3"}
      />
      
      {/* 钻石切面 */}
      <path d="M 50,10 L 50,45" stroke={colors.accent} strokeWidth="1" opacity="0.3" />
      <path d="M 25,35 L 50,45" stroke={colors.accent} strokeWidth="1" opacity="0.3" />
      <path d="M 75,35 L 50,45" stroke={colors.accent} strokeWidth="1" opacity="0.3" />
      <path d="M 50,45 L 35,70" stroke={colors.accent} strokeWidth="1" opacity="0.3" />
      <path d="M 50,45 L 65,70" stroke={colors.accent} strokeWidth="1" opacity="0.3" />
      
      {/* 中层菱形 */}
      <path
        d="M 50,25 L 60,42 L 50,58 L 40,42 Z"
        fill={`url(#frequency-middle-${variant})`}
        stroke={colors.accent}
        strokeWidth="1"
        opacity={isUnlocked ? "0.9" : "0.4"}
      />
      
      {/* 内圈 */}
      <circle
        cx="50"
        cy="42"
        r="10"
        fill={`url(#frequency-inner-${variant})`}
        stroke={colors.accent}
        strokeWidth="1.5"
      />
      
      {/* 闪电图标 */}
      <path
        d="M 52,36 L 48,42 L 51,42 L 48,48 L 54,41 L 50,41 Z"
        fill={colors.accent}
        stroke="white"
        strokeWidth="0.5"
      />
    </svg>
  );
}

// 特殊勋章 - 星芒设计
function SpecialBadge({ variant, size, isUnlocked }: { variant: string; size: number; isUnlocked: boolean }) {
  const colors = isUnlocked ? {
    outer: ['#FFD700', '#FFA500'],
    middle: ['#FF6B35', '#F7931E'],
    inner: ['#FFF9E6', '#FFECB3'],
    accent: '#FFD700',
  } : {
    outer: ['#4A4A4A', '#2A2A2A'],
    middle: ['#3A3A3A', '#2A2A2A'],
    inner: ['#555555', '#3A3A3A'],
    accent: '#666666',
  };

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <radialGradient id={`special-outer-${variant}`}>
          <stop offset="0%" stopColor={colors.outer[0]} />
          <stop offset="100%" stopColor={colors.outer[1]} />
        </radialGradient>
        <radialGradient id={`special-middle-${variant}`}>
          <stop offset="0%" stopColor={colors.middle[0]} />
          <stop offset="100%" stopColor={colors.middle[1]} />
        </radialGradient>
        <radialGradient id={`special-inner-${variant}`}>
          <stop offset="0%" stopColor={colors.inner[0]} />
          <stop offset="100%" stopColor={colors.inner[1]} />
        </radialGradient>
        <filter id={`special-glow-${variant}`}>
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* 外层光晕 */}
      {isUnlocked && (
        <circle cx="50" cy="50" r="45" fill={colors.accent} opacity="0.15" />
      )}
      
      {/* 12角星芒 */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
        const x = 50 + Math.cos((angle * Math.PI) / 180) * 38;
        const y = 50 + Math.sin((angle * Math.PI) / 180) * 38;
        return (
          <line
            key={i}
            x1="50"
            y1="50"
            x2={x}
            y2={y}
            stroke={`url(#special-outer-${variant})`}
            strokeWidth={i % 2 === 0 ? "3" : "2"}
            strokeLinecap="round"
            opacity={isUnlocked ? (i % 2 === 0 ? "0.8" : "0.5") : "0.3"}
            filter={isUnlocked ? `url(#special-glow-${variant})` : undefined}
          />
        );
      })}
      
      {/* 外圆环 */}
      <circle
        cx="50"
        cy="50"
        r="32"
        fill="none"
        stroke={`url(#special-middle-${variant})`}
        strokeWidth="3"
        opacity={isUnlocked ? "0.9" : "0.4"}
      />
      
      {/* 内圆 */}
      <circle
        cx="50"
        cy="50"
        r="22"
        fill={`url(#special-inner-${variant})`}
        stroke={colors.accent}
        strokeWidth="2"
      />
      
      {/* 皇冠图标 */}
      <g transform="translate(50, 50)">
        <path
          d="M -8,-5 L -8,2 L 8,2 L 8,-5 M -8,-5 L -4,0 L 0,-6 L 4,0 L 8,-5"
          fill={colors.accent}
          stroke="white"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <circle cx="-6" cy="-5" r="1.5" fill={colors.accent} stroke="white" strokeWidth="0.5" />
        <circle cx="0" cy="-6" r="1.5" fill={colors.accent} stroke="white" strokeWidth="0.5" />
        <circle cx="6" cy="-5" r="1.5" fill={colors.accent} stroke="white" strokeWidth="0.5" />
      </g>
      
      {/* 装饰点 */}
      {[45, 135, 225, 315].map((angle, i) => {
        const x = 50 + Math.cos((angle * Math.PI) / 180) * 26;
        const y = 50 + Math.sin((angle * Math.PI) / 180) * 26;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="2"
            fill={colors.accent}
            opacity={isUnlocked ? "0.9" : "0.3"}
          />
        );
      })}
    </svg>
  );
}
