import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, TrendingUp, Award, MapPin, ChevronLeft, Trophy, Target, Map, Ruler, Lock } from 'lucide-react';
import { AchievementBadgeNew } from './AchievementBadgeNew';
import { ACHIEVEMENTS, type AchievementType } from '../utils/achievementConfig';

interface HistoryPageProps {
  onBack: () => void;
}

interface Achievement {
  id: string;
  type: AchievementType;
  title: string;
  description: string;
  isUnlocked: boolean;
  unlockedDate?: string;
  progress?: number;
  total?: number;
}

interface RunRecord {
  id: string;
  date: string;
  distance: number;
  duration: number;
  pace: string;
  energyGained: number;
}

export function HistoryPage({ onBack }: HistoryPageProps) {
  const [activeTab, setActiveTab] = useState<'achievements' | 'records'>('achievements');
  
  // 成就数据 - 使用统一配置
  const achievements: Achievement[] = ACHIEVEMENTS.map((config, index) => {
    // 模拟解锁状态（实际应该从用户数据获取）
    const isUnlocked = index < 3; // 前3个已解锁
    return {
      id: config.id,
      type: config.type,
      title: config.title,
      description: config.description,
      isUnlocked,
      unlockedDate: isUnlocked ? '2025-01-15' : undefined,
      progress: !isUnlocked && config.type === 'explorer' ? 2 : undefined,
      total: !isUnlocked && config.type === 'explorer' ? 5 : undefined,
    };
  });
  
  // 模拟跑步记录
  const records: RunRecord[] = [
    { id: '1', date: '2025-01-20', distance: 5.2, duration: 1800, pace: '5:45', energyGained: 26 },
    { id: '2', date: '2025-01-18', distance: 3.8, duration: 1320, pace: '5:50', energyGained: 19 },
    { id: '3', date: '2025-01-15', distance: 8.1, duration: 2880, pace: '5:56', energyGained: 41 },
    { id: '4', date: '2025-01-12', distance: 4.5, duration: 1500, pace: '5:33', energyGained: 23 },
    { id: '5', date: '2025-01-10', distance: 6.3, duration: 2100, pace: '5:33', energyGained: 32 },
  ];
  
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  
  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-[#0A0A0A] to-[#1A1215] text-white overflow-hidden">
      {/* 顶部导航 */}
      <div className="flex-shrink-0 bg-gradient-to-b from-[#0A0A0A] to-transparent backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-6 py-3">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={18} />
            <span className="text-sm">返回</span>
          </button>
          <h1 className="font-semibold">成就墙</h1>
          <div className="w-16" /> {/* 占位 */}
        </div>
        
        {/* Tab切换 */}
        <div className="flex px-6 pb-3 gap-4">
          <TabButton
            active={activeTab === 'achievements'}
            onClick={() => setActiveTab('achievements')}
            icon={<Award size={16} />}
            label="成就"
          />
          <TabButton
            active={activeTab === 'records'}
            onClick={() => setActiveTab('records')}
            icon={<Calendar size={16} />}
            label="历史记录"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <AnimatePresence mode="wait">
          {activeTab === 'achievements' ? (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* 最近上新区域 */}
              <div className="mt-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm flex items-center gap-2">
                    <span>最近上新</span>
                    <span className="text-[#FF6B8B]">({achievements.filter(a => a.isUnlocked).length})</span>
                  </h2>
                </div>
                
                {/* 横向滚动成就 */}
                <div className="flex gap-4 overflow-x-auto pb-3 -mx-6 px-6 scrollbar-hide">
                  {achievements.filter(a => a.isUnlocked).map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex-shrink-0 flex flex-col items-center gap-1"
                    >
                      <AchievementBadgeNew
                        type={achievement.type}
                        size={60}
                        isUnlocked={true}
                      />
                      <p className="text-[10px] text-center w-16 truncate">{achievement.title}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* 所有成就展示 */}
              <div className="mt-4">
                <div className="grid grid-cols-3 gap-x-3 gap-y-6">
                  {achievements.map((achievement, index) => (
                    <AchievementItem
                      key={achievement.id}
                      achievement={achievement}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="records"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mt-4"
            >
              {/* 统计卡片 */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <StatCard label="总距离" value="28.9" unit="KM" IconComponent={Ruler} />
                <StatCard label="总时长" value="2.5" unit="小时" IconComponent={Calendar} />
              </div>
              
              {/* 记录列表 */}
              <div className="space-y-2">
                {records.map((record, index) => (
                  <RecordCard key={record.id} record={record} index={index} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Tab按钮组件
function TabButton({ 
  active, 
  onClick, 
  icon, 
  label 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
        active
          ? 'bg-white/10 text-white'
          : 'text-gray-400 hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B8B]"
        />
      )}
    </button>
  );
}

// 成就项组件
function AchievementItem({ 
  achievement, 
  index 
}: { 
  achievement: Achievement; 
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex flex-col items-center text-center"
    >
      {/* 成就图标 */}
      <motion.div
        whileHover={achievement.isUnlocked ? { scale: 1.1, y: -5 } : {}}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="mb-3 relative"
      >
        {/* 背景光晕 */}
        {achievement.isUnlocked && (
          <motion.div
            className="absolute inset-0 rounded-full -z-10"
            style={{
              background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
        
        {/* 成就徽章 */}
        <AchievementBadgeNew
          type={achievement.type}
          size={64}
          isUnlocked={achievement.isUnlocked}
        />
      </motion.div>
      
      {/* 标题 */}
      <p 
        className={`text-[10px] mb-0.5 px-1 ${
          achievement.isUnlocked ? 'text-white' : 'text-gray-600'
        }`}
      >
        {achievement.title}
      </p>
      
      {/* 日期或进度 */}
      {achievement.isUnlocked && achievement.unlockedDate && (
        <p className="text-[8px] text-gray-600">
          {achievement.unlockedDate}
        </p>
      )}
      
      {!achievement.isUnlocked && achievement.progress && achievement.total && (
        <div className="w-full px-1 mt-1">
          <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
              transition={{ duration: 0.8, delay: index * 0.05 }}
              className="h-full bg-gradient-to-r from-[#FF6B8B] to-[#FF8FA3]"
            />
          </div>
          <p className="text-[8px] text-gray-600 mt-0.5">
            {achievement.progress}/{achievement.total}
          </p>
        </div>
      )}
    </motion.div>
  );
}

// 统计卡片
function StatCard({ 
  label, 
  value, 
  unit, 
  IconComponent 
}: { 
  label: string; 
  value: string; 
  unit: string; 
  IconComponent: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
      <div className="flex items-center gap-2 mb-2">
        <IconComponent size={18} className="text-[#FF6B8B]" />
        <p className="text-xs text-gray-400">{label}</p>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-xs text-gray-400">{unit}</span>
      </div>
    </div>
  );
}

// 记录卡片
function RecordCard({ 
  record, 
  index 
}: { 
  record: RunRecord; 
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-400">{record.date}</p>
        <div className="flex items-center gap-1 text-[10px] text-[#FF6B8B]">
          <TrendingUp size={10} />
          <span>+{record.energyGained}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-[10px] text-gray-500 mb-0.5">距离</p>
          <p className="text-sm font-semibold">{record.distance} KM</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 mb-0.5">时长</p>
          <p className="text-sm font-semibold">{Math.floor(record.duration / 60)} 分</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 mb-0.5">配速</p>
          <p className="text-sm font-semibold">{record.pace}</p>
        </div>
      </div>
    </motion.div>
  );
}
