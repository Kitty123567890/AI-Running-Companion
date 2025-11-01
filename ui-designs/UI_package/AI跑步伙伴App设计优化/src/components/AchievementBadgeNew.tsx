import { motion } from 'motion/react';
import { getAchievementColor } from '../utils/achievementConfig';

interface AchievementBadgeNewProps {
  type: 'speed' | 'explorer' | 'first-step' | 'distance' | 'endurance' | 'consistency';
  title?: string;
  size?: 'small' | 'medium' | 'large' | number;
  isUnlocked?: boolean;
  showTitle?: boolean;
}

// 获取默认标题
function getTitleForType(type: string): string {
  const titles: Record<string, string> = {
    'speed': '速度先锋',
    'explorer': '初探者',
    'first-step': '启程之步',
    'distance': '距离达人',
    'endurance': '持久之星',
    'consistency': '坚持不懈',
  };
  return titles[type] || '成就';
}

export function AchievementBadgeNew({ 
  type, 
  title,
  size = 'medium', 
  isUnlocked = false,
  showTitle = true 
}: AchievementBadgeNewProps) {
  // 尺寸映射
  const sizeMap = {
    small: 70,
    medium: 90,
    large: 110,
  };
  
  const svgSize = typeof size === 'number' ? size : sizeMap[size];
  const opacity = isUnlocked ? 1 : 0.4;
  const grayscale = isUnlocked ? 0 : 1;
  const colors = getAchievementColor(type);
  
  // 获取标题
  const badgeTitle = title || getTitleForType(type);
  
  // small尺寸默认不显示标题
  const shouldShowTitle = showTitle && size !== 'small';

  // 渲染SVG徽章
  const renderBadge = () => {
    if (type === 'speed') {
      return (
        <svg width={svgSize} height={svgSize} viewBox="0 0 120 120" style={{ opacity, filter: `grayscale(${grayscale})` }}>
          <defs>
            <radialGradient id={`silverGradient-${type}`} cx="50%" cy="50%">
              <stop offset="0%" stopColor="#E8E8E8" />
              <stop offset="50%" stopColor="#C0C0C0" />
              <stop offset="100%" stopColor="#A8A8A8" />
            </radialGradient>
            <linearGradient id={`accent-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.from} />
              <stop offset="100%" stopColor={colors.to} />
            </linearGradient>
          </defs>
          
          <circle cx="60" cy="60" r="58" fill={`url(#silverGradient-${type})`} stroke="#8C8C8C" strokeWidth="2"/>
          <circle cx="60" cy="60" r="52" fill="none" stroke={`url(#accent-${type})`} strokeWidth="1" opacity="0.6"/>
          
          <g transform="translate(60, 60)">
            <path d="M -25 0 L 15 -15 L 8 0 L 15 15 Z" fill={`url(#accent-${type})`} opacity="0.9"/>
            <path d="M -18 0 L 10 -10 L 5 0 L 10 10 Z" fill="white" opacity="0.3"/>
            
            <g opacity="0.7">
              <path d="M -32 -8 L -20 -8" stroke={`url(#accent-${type})`} strokeWidth="3" strokeLinecap="round"/>
              <circle cx="-19" cy="-8" r="1.5" fill={`url(#accent-${type})`}/>
            </g>
            <g opacity="0.6">
              <path d="M -35 0 L -20 0" stroke={`url(#accent-${type})`} strokeWidth="3.5" strokeLinecap="round"/>
              <circle cx="-19" cy="0" r="2" fill={`url(#accent-${type})`}/>
            </g>
            <g opacity="0.7">
              <path d="M -32 8 L -20 8" stroke={`url(#accent-${type})`} strokeWidth="3" strokeLinecap="round"/>
              <circle cx="-19" cy="8" r="1.5" fill={`url(#accent-${type})`}/>
            </g>
          </g>
        </svg>
      );
    }

    if (type === 'explorer') {
      return (
        <svg width={svgSize} height={svgSize} viewBox="0 0 120 120" style={{ opacity, filter: `grayscale(${grayscale})` }}>
          <defs>
            <radialGradient id={`silverGradient-${type}`} cx="50%" cy="50%">
              <stop offset="0%" stopColor="#E8E8E8" />
              <stop offset="50%" stopColor="#C0C0C0" />
              <stop offset="100%" stopColor="#A8A8A8" />
            </radialGradient>
            <linearGradient id={`accent-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.from} />
              <stop offset="100%" stopColor={colors.to} />
            </linearGradient>
          </defs>
          
          <circle cx="60" cy="60" r="58" fill={`url(#silverGradient-${type})`} stroke="#8C8C8C" strokeWidth="2"/>
          <circle cx="60" cy="60" r="52" fill="none" stroke={`url(#accent-${type})`} strokeWidth="1" opacity="0.6"/>
          
          <g transform="translate(60, 60)">
            <circle cx="0" cy="0" r="22" fill="none" stroke={`url(#accent-${type})`} strokeWidth="2.5" opacity="0.8"/>
            
            <path d="M 0 -22 L 0 -15" stroke={`url(#accent-${type})`} strokeWidth="2" strokeLinecap="round"/>
            <path d="M 0 22 L 0 15" stroke={`url(#accent-${type})`} strokeWidth="2" strokeLinecap="round"/>
            <path d="M -22 0 L -15 0" stroke={`url(#accent-${type})`} strokeWidth="2" strokeLinecap="round"/>
            <path d="M 22 0 L 15 0" stroke={`url(#accent-${type})`} strokeWidth="2" strokeLinecap="round"/>
            
            <path d="M 0 -22 L 3 -10 L 15 -7 L 5 0 L 8 12 L 0 5 L -8 12 L -5 0 L -15 -7 L -3 -10 Z" 
                  fill={`url(#accent-${type})`} opacity="0.9"/>
            
            <circle cx="0" cy="0" r="4" fill="white" opacity="0.9"/>
            <path d="M 0 -15 L 0 15" stroke="white" strokeWidth="1.5" opacity="0.6"/>
          </g>
        </svg>
      );
    }

    if (type === 'first-step') {
      return (
        <svg width={svgSize} height={svgSize} viewBox="0 0 120 120" style={{ opacity, filter: `grayscale(${grayscale})` }}>
          <defs>
            <radialGradient id={`silverGradient-${type}`} cx="50%" cy="50%">
              <stop offset="0%" stopColor="#E8E8E8" />
              <stop offset="50%" stopColor="#C0C0C0" />
              <stop offset="100%" stopColor="#A8A8A8" />
            </radialGradient>
            <linearGradient id={`accent-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.from} />
              <stop offset="100%" stopColor={colors.to} />
            </linearGradient>
          </defs>
          
          <circle cx="60" cy="60" r="58" fill={`url(#silverGradient-${type})`} stroke="#8C8C8C" strokeWidth="2"/>
          <circle cx="60" cy="60" r="52" fill="none" stroke={`url(#accent-${type})`} strokeWidth="1" opacity="0.6"/>
          
          <g transform="translate(60, 60)">
            <g transform="translate(-20, 0)">
              <ellipse cx="0" cy="0" rx="8" ry="12" fill="white" opacity="0.9"/>
              <circle cx="-3" cy="-10" r="2.5" fill="white" opacity="0.9"/>
              <circle cx="0" cy="-11" r="2.5" fill="white" opacity="0.9"/>
              <circle cx="3" cy="-10" r="2.5" fill="white" opacity="0.9"/>
            </g>
            
            <g transform="translate(20, -8)">
              <ellipse cx="0" cy="0" rx="8" ry="12" fill="white" opacity="0.9"/>
              <circle cx="-3" cy="-10" r="2.5" fill="white" opacity="0.9"/>
              <circle cx="0" cy="-11" r="2.5" fill="white" opacity="0.9"/>
              <circle cx="3" cy="-10" r="2.5" fill="white" opacity="0.9"/>
            </g>
          </g>
          
          <g transform="translate(25, 30)">
            <path d="M 0 -3 L 0.9 -0.9 L 3 0 L 0.9 0.9 L 0 3 L -0.9 0.9 L -3 0 L -0.9 -0.9 Z" fill="white" opacity="0.6"/>
          </g>
          <g transform="translate(85, 45)">
            <path d="M 0 -2.5 L 0.7 -0.7 L 2.5 0 L 0.7 0.7 L 0 2.5 L -0.7 0.7 L -2.5 0 L -0.7 -0.7 Z" fill="white" opacity="0.6"/>
          </g>
        </svg>
      );
    }

    // 默认通用徽章（用于distance, endurance, consistency）
    return (
      <svg width={svgSize} height={svgSize} viewBox="0 0 120 120" style={{ opacity, filter: `grayscale(${grayscale})` }}>
        <defs>
          <radialGradient id={`silverGradient-${type}`} cx="50%" cy="50%">
            <stop offset="0%" stopColor="#E8E8E8" />
            <stop offset="50%" stopColor="#C0C0C0" />
            <stop offset="100%" stopColor="#A8A8A8" />
          </radialGradient>
          <linearGradient id={`accent-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.from} />
            <stop offset="100%" stopColor={colors.to} />
          </linearGradient>
        </defs>
        
        <circle cx="60" cy="60" r="58" fill={`url(#silverGradient-${type})`} stroke="#8C8C8C" strokeWidth="2"/>
        <circle cx="60" cy="60" r="52" fill="none" stroke={`url(#accent-${type})`} strokeWidth="1" opacity="0.6"/>
        
        <g transform="translate(60, 60)">
          {/* 星形装饰 */}
          <path d="M 0 -25 L 7 -8 L 25 -5 L 10 8 L 15 25 L 0 15 L -15 25 L -10 8 L -25 -5 L -7 -8 Z" 
                fill={`url(#accent-${type})`} opacity="0.9"/>
          <circle cx="0" cy="0" r="8" fill="white" opacity="0.8"/>
        </g>
      </svg>
    );
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {renderBadge()}
      </motion.div>
      {shouldShowTitle && (
        <p className={`text-xs text-center font-medium ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
          {badgeTitle}
        </p>
      )}
    </div>
  );
}
