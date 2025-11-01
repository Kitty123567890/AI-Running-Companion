import { motion } from 'motion/react';
import { Hart } from './hart/Hart';
import { getHartLevelFromEnergy } from './hart/hartUtils';

interface InitialPageProps {
  onAwaken: () => void;
  energyValue: number;
}

export function InitialPage({ onAwaken, energyValue }: InitialPageProps) {
  // 根据实际元气值获取哈特等级
  const hartLevel = getHartLevelFromEnergy(energyValue);
  
  return (
    <motion.div
      className="fixed inset-0 bg-black flex items-center justify-center cursor-pointer"
      onClick={onAwaken}
      initial={{ opacity: 1 }}
    >
      {/* 沉睡的哈特 - 根据实际元气值显示对应等级 */}
      <motion.div
        initial={{ opacity: 0.3, scale: 0.9 }}
        animate={{ 
          opacity: [0.3, 0.4, 0.3],
          scale: [0.9, 0.92, 0.9],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Hart level={hartLevel} size="large" isBeating={false} />
      </motion.div>
      
      {/* 提示文字（可选，淡淡的） */}
      <motion.p
        className="absolute bottom-20 text-white text-sm opacity-30"
        animate={{
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        轻触唤醒哈特
      </motion.p>
    </motion.div>
  );
}
