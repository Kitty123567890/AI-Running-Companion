import { motion } from 'motion/react';
import { HartLevel } from './Hart';
import { Music, Sparkles } from 'lucide-react';

interface HartDecorationsProps {
  level: HartLevel;
}

export function HartDecorations({ level }: HartDecorationsProps) {
  // Lv.5: 内聚式光晕脉冲特效
  if (level === 5) {
    return (
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        {/* 多层光环脉冲 */}
        {[0, 1, 2].map((index) => (
          <motion.div
            key={`ring-${index}`}
            className="absolute rounded-full border-2"
            style={{
              width: `${60 + index * 25}%`,
              height: `${60 + index * 25}%`,
              borderColor: 'rgba(255, 215, 0, 0.3)',
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.4,
              ease: "easeInOut",
            }}
          />
        ))}
        
        {/* 中心闪烁星光 */}
        {[0, 1, 2, 3, 4].map((index) => {
          const angle = (index * 72 * Math.PI) / 180;
          const radius = 15;
          return (
            <motion.div
              key={`star-${index}`}
              className="absolute"
              style={{
                left: '50%',
                top: '50%',
                marginLeft: Math.cos(angle) * radius,
                marginTop: Math.sin(angle) * radius,
              }}
              animate={{
                scale: [0, 1.5, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.3,
                ease: "easeInOut",
              }}
            >
              <Sparkles size={10} className="text-yellow-300" fill="currentColor" />
            </motion.div>
          );
        })}
        
        {/* 内部光点闪烁 */}
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={`dot-${index}`}
            className="absolute w-1.5 h-1.5 bg-yellow-200 rounded-full"
            style={{
              left: `${30 + index * 15}%`,
              top: `${40 + (index % 2) * 20}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: index * 0.4,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  }
  
  // Lv.4: 偶尔闪烁的光点
  if (level === 4) {
    return (
      <div className="absolute inset-0">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{
              left: `${20 + index * 30}%`,
              top: `${30 + index * 15}%`,
            }}
            animate={{
              opacity: [0, 0.8, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 1.5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  }
  
  // Lv.1: 小乌云 + 下雨
  if (level === 1) {
    return (
      <div className="absolute -top-10 left-1/2 -translate-x-1/2">
        {/* 乌云 */}
        <svg width="50" height="30" viewBox="0 0 50 30">
          <path
            d="M 10,20 Q 10,12 18,12 Q 20,8 25,8 Q 30,8 32,12 Q 40,12 40,20 Q 40,25 35,25 L 15,25 Q 10,25 10,20 Z"
            fill="#666666"
            opacity="0.8"
          />
        </svg>
        
        {/* 雨滴 */}
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            className="absolute w-0.5 bg-blue-300 rounded-full"
            style={{
              height: 10,
              left: `${15 + index * 8}px`,
              top: 25,
            }}
            animate={{
              y: [0, 20],
              opacity: [0.6, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: index * 0.25,
              ease: "linear",
            }}
          />
        ))}
      </div>
    );
  }
  
  // Lv.0: 厚重乌云 + 闪电
  if (level === 0) {
    return (
      <div className="absolute -top-16 left-1/2 -translate-x-1/2">
        {/* 厚重乌云 */}
        <svg width="90" height="55" viewBox="0 0 90 55">
          <path
            d="M 15,35 Q 15,20 30,20 Q 33,12 45,12 Q 57,12 60,20 Q 75,20 75,35 Q 75,45 65,45 L 25,45 Q 15,45 15,35 Z"
            fill="#3A3A3A"
            opacity="0.95"
          />
          <ellipse cx="30" cy="35" rx="12" ry="8" fill="#2A2A2A" opacity="0.7" />
          <ellipse cx="60" cy="35" rx="12" ry="8" fill="#2A2A2A" opacity="0.7" />
        </svg>
        
        {/* 闪电 */}
        <motion.svg
          width="20"
          height="30"
          viewBox="0 0 20 30"
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: 45 }}
          animate={{
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.3,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        >
          <path
            d="M 10,0 L 7,12 L 12,12 L 9,25 L 15,10 L 10,10 Z"
            fill="#FF9500"
            stroke="#FFD700"
            strokeWidth="0.5"
          />
        </motion.svg>
        
        {/* 密集雨滴 */}
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <motion.div
            key={index}
            className="absolute w-0.5 bg-blue-400 rounded-full"
            style={{
              height: 12,
              left: `${10 + index * 12}px`,
              top: 50,
            }}
            animate={{
              y: [0, 25],
              opacity: [0.7, 0],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: index * 0.15,
              ease: "linear",
            }}
          />
        ))}
      </div>
    );
  }
  
  return null;
}
