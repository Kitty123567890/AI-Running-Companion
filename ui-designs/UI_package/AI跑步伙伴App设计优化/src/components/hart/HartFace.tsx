import { motion } from 'motion/react';
import { HartLevel } from './Hart';
import { getHartConfig } from './hartUtils';

interface HartFaceProps {
  level: HartLevel;
}

export function HartFace({ level }: HartFaceProps) {
  const config = getHartConfig(level);
  const { eyeType, mouthType } = config.face;
  
  // 眨眼动画
  const blinkAnimation = {
    scaleY: [1, 0.1, 1],
  };
  
  const blinkTransition = {
    duration: 0.2,
    repeat: Infinity,
    repeatDelay: 4,
    ease: "easeInOut"
  };
  
  return (
    <g>
      {/* 眼睛 */}
      {eyeType === 'open' && (
        <>
          <motion.circle 
            cx="45" 
            cy="35" 
            r="3" 
            fill="#000000"
            animate={blinkAnimation}
            transition={blinkTransition}
          />
          <motion.circle 
            cx="75" 
            cy="35" 
            r="3" 
            fill="#000000"
            animate={blinkAnimation}
            transition={blinkTransition}
          />
        </>
      )}
      
      {eyeType === 'happy' && (
        <>
          {/* 开心的月牙眼 */}
          <path d="M 42,35 Q 45,38 48,35" stroke="#000000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 72,35 Q 75,38 78,35" stroke="#000000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* 闪光 */}
          <circle cx="46" cy="33" r="1.5" fill="#FFFFFF" opacity="0.8" />
          <circle cx="76" cy="33" r="1.5" fill="#FFFFFF" opacity="0.8" />
        </>
      )}
      
      {eyeType === 'tired' && (
        <>
          {/* 疲惫的半睁眼 */}
          <ellipse cx="45" cy="35" rx="3" ry="1.5" fill="#000000" />
          <ellipse cx="75" cy="35" rx="3" ry="1.5" fill="#000000" />
        </>
      )}
      
      {eyeType === 'spiral' && (
        <>
          {/* 螺旋眼（晕眩） */}
          <path 
            d="M 45,35 Q 46,33 47,35 Q 46,37 45,35" 
            stroke="#000000" 
            strokeWidth="1.5" 
            fill="none"
          />
          <path 
            d="M 75,35 Q 76,33 77,35 Q 76,37 75,35" 
            stroke="#000000" 
            strokeWidth="1.5" 
            fill="none"
          />
        </>
      )}
      
      {eyeType === 'dead' && (
        <>
          {/* X形眼睛 */}
          <g>
            <path d="M 42,32 L 48,38" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
            <path d="M 48,32 L 42,38" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
          </g>
          <g>
            <path d="M 72,32 L 78,38" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
            <path d="M 78,32 L 72,38" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
          </g>
        </>
      )}
      
      {/* 嘴巴 */}
      {mouthType === 'smile' && (
        <path 
          d="M 45,50 Q 60,58 75,50" 
          stroke="#000000" 
          strokeWidth="2.5" 
          fill="none" 
          strokeLinecap="round"
        />
      )}
      
      {mouthType === 'normal' && (
        <line 
          x1="48" 
          y1="52" 
          x2="72" 
          y2="52" 
          stroke="#000000" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
      )}
      
      {mouthType === 'sad' && (
        <path 
          d="M 45,55 Q 60,50 75,55" 
          stroke="#000000" 
          strokeWidth="2.5" 
          fill="none" 
          strokeLinecap="round"
        />
      )}
      
      {mouthType === 'pain' && (
        <path 
          d="M 45,52 Q 50,54 55,52 Q 60,50 65,52 Q 70,54 75,52" 
          stroke="#000000" 
          strokeWidth="2" 
          fill="none" 
          strokeLinecap="round"
        />
      )}
      
      {/* 泪珠（悲伤时） */}
      {(level === 1 || level === 0) && (
        <>
          <motion.ellipse
            cx="42"
            cy="40"
            rx="1.5"
            ry="2"
            fill="#4A90E2"
            opacity="0.6"
            animate={{
              cy: [40, 45],
              opacity: [0.6, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeIn"
            }}
          />
        </>
      )}
    </g>
  );
}
