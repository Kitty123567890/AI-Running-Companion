import { motion, AnimatePresence } from 'motion/react';
import { Hart } from './hart/Hart';
import { getHartLevelFromEnergy } from './hart/hartUtils';
import { RunStats } from './RunningPage';
import { Trophy, TrendingUp, Flame, Award, Share2, X } from 'lucide-react';
import { ShareCard } from './ShareCard';
import { AchievementBadgeNew } from './AchievementBadgeNew';
import { useState } from 'react';
import { checkAchievements, getAchievementIcon } from '../utils/achievementConfig';

interface SummaryPageProps {
  stats: RunStats;
  energyValue: number;
  onClose: () => void;
}

export function SummaryPage({ stats, energyValue, onClose }: SummaryPageProps) {
  const hartLevel = getHartLevelFromEnergy(energyValue);
  const [showShareCard, setShowShareCard] = useState(false);
  
  // 检查本次解锁的成就
  const unlockedAchievements = checkAchievements({
    distance: stats.distance,
    duration: stats.duration,
    pace: stats.pace,
    calories: stats.calories,
    energyGained: stats.energyGained,
  }, {
    totalRuns: 1, // 简化逻辑，实际应该从历史数据获取
    totalDistance: stats.distance,
    totalDuration: stats.duration,
  });
  
  // 判断是否破纪录
  const isNewRecord = stats.distance > 5; // 简化逻辑
  
  // 格式化时间
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}小时${mins}分${secs}秒`;
    }
    return `${mins}分${secs}秒`;
  };
  
  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-[#0A0A0A] to-[#1A1215] text-white overflow-hidden">
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors"
      >
        <X size={20} />
      </button>
      
      {/* 哈特展示区 - 更紧凑 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
        className="relative flex-shrink-0 pt-8 pb-4"
      >
        {/* 哈特发光光晕 */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <motion.div
            className="w-[200px] h-[200px] rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(255, 107, 139, 0.4) 0%, rgba(255, 107, 139, 0.1) 40%, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
        
        {/* 哈特形象 */}
        <motion.div
          className="relative z-10 flex justify-center"
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Hart level={hartLevel} size="large" />
        </motion.div>
        
        {/* 标题和描述 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-4"
        >
          <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#FF6B8B] via-[#FF8FA3] to-[#FFD700] bg-clip-text text-transparent">
            🎉 太棒了！
          </h1>
          <p className="text-gray-400 text-sm">
            你完成了一次精彩的跑步
          </p>
          
          {isNewRecord && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: 'spring' }}
              className="mt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 border border-[#FFD700]/40"
            >
              <Trophy size={16} className="text-[#FFD700]" />
              <span className="text-[#FFD700] text-sm">🏆 新纪录！</span>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
      
      {/* 主要数据卡片 - 可滚动区域 */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-3xl mb-4"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 107, 139, 0.15) 0%, rgba(255, 143, 163, 0.05) 100%)',
            border: '1px solid rgba(255, 107, 139, 0.2)',
          }}
        >
          {/* 距离 - 最显眼 */}
          <div className="text-center mb-4">
            <p className="text-xs text-gray-400 mb-1">总距离</p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-4xl font-bold text-[#FF6B8B]">{stats.distance}</span>
              <span className="text-xl text-gray-400">KM</span>
            </div>
          </div>
          
          {/* 其他数据 - 2x2网格 */}
          <div className="grid grid-cols-2 gap-3">
            <DataItem label="时间" value={formatDuration(stats.duration)} />
            <DataItem label="配速" value={stats.pace} subtext="分钟/KM" />
            <DataItem label="卡路里" value={`${stats.calories}`} subtext="千卡" />
            <DataItem label="元气值" value={`+${stats.energyGained}`} isHighlight />
          </div>
        </motion.div>
        
        {/* 成就和里程碑 */}
        {unlockedAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-4"
          >
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Award size={16} className="text-[#FFD700]" />
              本次成就 ({unlockedAchievements.length})
            </h2>
            
            <div className="grid grid-cols-3 gap-3">
              {unlockedAchievements.slice(0, 3).map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    delay: 0.5 + index * 0.1, 
                    type: 'spring',
                    stiffness: 200 
                  }}
                  className="flex flex-col items-center gap-1"
                >
                  <AchievementBadgeNew
                    type={achievement.type}
                    isUnlocked={true}
                    size="small"
                    showTitle={false}
                  />
                  <p className="text-[10px] text-center text-white">
                    {achievement.title}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* 哈特的话 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4"
        >
          <p className="text-xs text-gray-300">
            "太棒了！感受到你满满的活力，我的能量也充盈了起来！继续保持，我们一起变得更强！💪✨"
          </p>
        </motion.div>
        
        {/* 底部按钮 */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowShareCard(true)}
            className="h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-2"
          >
            <Share2 size={16} />
            <span className="text-sm">分享</span>
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="h-12 rounded-full bg-gradient-to-r from-[#FF6B8B] to-[#FF8FA3] flex items-center justify-center gap-2"
          >
            <span className="text-sm">完成</span>
          </motion.button>
        </div>
      </div>
      
      {/* 分享卡片弹出层 */}
      <AnimatePresence>
        {showShareCard && (
          <ShareCard
            stats={{
              distance: stats.distance,
              duration: formatDuration(stats.duration),
              pace: stats.pace,
              calories: stats.calories,
              route: [],
            }}
            energyGained={stats.energyGained}
            energyValue={energyValue}
            achievements={unlockedAchievements.map(a => ({
              type: a.type,
              title: a.title,
            }))}
            onClose={() => setShowShareCard(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// 数据项组件
function DataItem({ 
  label, 
  value, 
  subtext, 
  isHighlight = false 
}: { 
  label: string; 
  value: string; 
  subtext?: string;
  isHighlight?: boolean;
}) {
  return (
    <div className="p-3 rounded-2xl bg-black/30 backdrop-blur-sm">
      <p className="text-[10px] text-gray-500 mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span 
          className={`text-xl font-bold ${isHighlight ? 'text-[#FF6B8B]' : 'text-white'}`}
        >
          {value}
        </span>
        {subtext && <span className="text-[10px] text-gray-500">{subtext}</span>}
      </div>
    </div>
  );
}


