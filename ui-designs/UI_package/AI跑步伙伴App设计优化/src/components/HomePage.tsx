import { useState } from 'react';
import { motion } from 'motion/react';
import { Hart } from './hart/Hart';
import { Settings, Trophy, Target, Play, HelpCircle } from 'lucide-react';
import { getHartLevelFromEnergy } from './hart/hartUtils';
import { EnergyRulesDialog } from './EnergyRulesDialog';

interface HomePageProps {
  energyValue: number;
  weeklyDistance: number;
  weeklyGoal: number;
  streakDays: number;
  currentGoal: {
    description: string;
    progress: number;
    total: number;
    daysLeft: number;
  } | null;
  onStartRun: () => void;
  onGoalClick: () => void;
  onHartClick: () => void;
  onHistoryClick: () => void;
}

export function HomePage({
  energyValue,
  weeklyDistance,
  weeklyGoal,
  streakDays,
  currentGoal,
  onStartRun,
  onHistoryClick,
  onGoalClick,
  onHartClick,
}: HomePageProps) {
  const hartLevel = getHartLevelFromEnergy(energyValue);
  const [showEnergyRules, setShowEnergyRules] = useState(false);
  const weekProgress = (weeklyDistance / weeklyGoal) * 100;
  
  // 根据时段调整背景
  const hour = new Date().getHours();
  let bgGradient = 'from-[#0A0A0A] to-[#1A1215]'; // 默认夜晚
  if (hour >= 5 && hour < 12) {
    bgGradient = 'from-[#0A0A0A] to-[#1A1520]'; // 晨跑
  } else if (hour >= 12 && hour < 18) {
    bgGradient = 'from-[#0A0A0A] to-[#151A1A]'; // 日间
  } else if (hour >= 18 && hour < 22) {
    bgGradient = 'from-[#0A0A0A] to-[#1A1215]'; // 夜跑
  }
  
  const greeting = hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';
  
  return (
    <div className={`h-screen flex flex-col bg-gradient-to-b ${bgGradient} text-white overflow-hidden`}>
      {/* 顶部状态栏区域 */}
      <div className="flex-shrink-0 pt-8 px-6 flex justify-between items-center">
        <div className="text-xs opacity-60">
          {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onHistoryClick}
            className="w-8 h-8 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
          >
            <Trophy size={20} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
            <Settings size={20} />
          </button>
        </div>
      </div>
      
      {/* 中心区域 - 哈特 */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center mt-6">
        <Hart 
          level={hartLevel} 
          size="xlarge"
          onClick={onHartClick}
        />
        
        {/* 问候语气泡 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 px-4 py-2 rounded-xl backdrop-blur-md"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          <p className="text-sm text-center">
            {greeting}！{getGreetingMessage(hartLevel)}
          </p>
        </motion.div>
      </div>
      
      {/* 数据卡片区 - 网格布局 */}
      <div className="flex-1 px-6 mt-6 overflow-y-auto scrollbar-hide">
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* 本周里程卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-5 rounded-2xl backdrop-blur-md"
            style={{
              background: 'rgba(42, 42, 42, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <p className="text-xs text-gray-400 mb-2">本周累计</p>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-3xl font-bold tabular-nums">{weeklyDistance.toFixed(1)}</p>
                <p className="text-sm text-gray-400">KM</p>
              </div>
              <div className="relative w-12 h-12">
                <svg className="transform -rotate-90" width="48" height="48">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#FF6B8B"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - weekProgress / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs">
                  {Math.round(weekProgress)}%
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500">目标 {weeklyGoal} KM</p>
          </motion.div>
          
          {/* 连续打卡卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-5 rounded-2xl backdrop-blur-md"
            style={{
              background: 'rgba(42, 42, 42, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <p className="text-xs text-gray-400 mb-2">连续打卡</p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">🔥</span>
              <span className="text-3xl font-bold tabular-nums">{streakDays}</span>
            </div>
            <p className="text-sm text-gray-400">天</p>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {/* 元气值卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="relative p-5 rounded-2xl backdrop-blur-md overflow-hidden"
            style={{
              background: getEnergyCardBackground(hartLevel),
              border: `1px solid ${getEnergyCardBorder(hartLevel)}`,
              boxShadow: getEnergyCardShadow(hartLevel),
            }}
          >
            {/* 微光效果 */}
            {hartLevel >= 4 && (
              <motion.div
                className="absolute inset-0 opacity-30"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${getLevelColor(hartLevel)}40 0%, transparent 70%)`,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
            
            {/* 头部 - 元气值标签和问号 */}
            <div className="relative flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400">元气值</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEnergyRules(true);
                }}
                className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110"
                title="查看计分规则"
              >
                <HelpCircle size={12} className="text-gray-400" />
              </button>
            </div>
            
            {/* 数值显示 */}
            <div className="relative mb-2">
              <motion.span 
                className="text-4xl font-bold tabular-nums"
                style={{ 
                  color: getLevelColor(hartLevel),
                  textShadow: hartLevel >= 4 ? `0 0 20px ${getLevelColor(hartLevel)}40` : 'none',
                }}
                animate={hartLevel >= 4 ? {
                  textShadow: [
                    `0 0 20px ${getLevelColor(hartLevel)}40`,
                    `0 0 30px ${getLevelColor(hartLevel)}60`,
                    `0 0 20px ${getLevelColor(hartLevel)}40`,
                  ],
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {energyValue}
              </motion.span>
            </div>
            
            {/* 状态文本 */}
            <p 
              className="relative text-sm font-medium"
              style={{ color: getLevelColor(hartLevel) }}
            >
              {getLevelText(hartLevel)}
            </p>
          </motion.div>
          
          {/* 当前目标卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileTap={{ scale: 0.97 }}
            onClick={onGoalClick}
            className="p-5 rounded-2xl backdrop-blur-md cursor-pointer"
            style={{
              background: currentGoal 
                ? 'rgba(42, 42, 42, 0.7)' 
                : 'rgba(42, 42, 42, 0.4)',
              border: currentGoal 
                ? '1px solid rgba(255, 107, 139, 0.3)' 
                : '1px dashed rgba(255, 255, 255, 0.2)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Target size={14} className="text-gray-400" />
              <p className="text-xs text-gray-400">当前目标</p>
            </div>
            
            {currentGoal ? (
              <>
                <p className="text-sm mb-3">{currentGoal.description}</p>
                <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentGoal.progress / currentGoal.total) * 100}%` }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#FF6B8B] to-[#FF8FA3] rounded-full"
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">
                    {currentGoal.progress}/{currentGoal.total} KM
                  </span>
                  <span className="text-gray-500">还剩 {currentGoal.daysLeft} 天</span>
                </div>
              </>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm text-gray-400 mb-2">设定目标，让哈特陪你一起进步！</p>
                <div className="flex items-center justify-center gap-1 text-xs text-[#4A90E2]">
                  <span>✨</span>
                  <span>让AI帮我设定</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      
      {/* 底部CTA按钮 */}
      <div className="flex-shrink-0 p-6 pb-6">
        <motion.button
          whileTap={{ scale: 0.95 }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          onClick={onStartRun}
          className="w-full h-12 rounded-full bg-gradient-to-r from-[#FF6B8B] to-[#FF8FA3] flex items-center justify-center gap-2 shadow-lg"
        >
          <Play size={18} fill="white" />
          <span>开始奔跑</span>
        </motion.button>
        
        {/* 次级入口 */}
        <div className="flex gap-4 mt-3 justify-center">
          <button 
            onClick={onGoalClick}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <Target size={16} />
            目标管理
          </button>
        </div>
      </div>
      
      {/* 元气值规则弹窗 */}
      <EnergyRulesDialog 
        isOpen={showEnergyRules}
        onClose={() => setShowEnergyRules(false)}
      />
    </div>
  );
}

function getGreetingMessage(level: number): string {
  const messages = [
    '我...我需要你...', // Lv.0
    '我快要撑不住了...救救我😢', // Lv.1
    '好久没运动了...我有点担心你呢', // Lv.2
    '让我们一起跑起来吧～', // Lv.3
    '感觉状态不错哦！让我们继续保持！💪', // Lv.4
    '你简直太棒了！我感觉自己要爆炸啦！🌟', // Lv.5
  ];
  return messages[level] || messages[3];
}

function getLevelColor(level: number): string {
  const colors = ['#666666', '#8B1A1A', '#C7233A', '#C7233A', '#FF3B30', '#FF2D55'];
  return colors[level] || colors[3];
}

function getLevelText(level: number): string {
  const texts = ['濒危', '垂头丧气', '元气不足', '基础平稳', '活力充沛', '元气爆棚'];
  return texts[level] || texts[3];
}

// 根据等级获取卡片背景
function getEnergyCardBackground(level: number): string {
  const backgrounds = [
    'rgba(42, 42, 42, 0.6)', // Lv.0 - 更暗
    'rgba(42, 42, 42, 0.65)', // Lv.1
    'rgba(42, 42, 42, 0.7)', // Lv.2
    'rgba(42, 42, 42, 0.7)', // Lv.3 - 标准
    'linear-gradient(135deg, rgba(255, 59, 48, 0.12) 0%, rgba(42, 42, 42, 0.75) 100%)', // Lv.4 - 微红渐变
    'linear-gradient(135deg, rgba(255, 45, 85, 0.18) 0%, rgba(255, 107, 139, 0.1) 50%, rgba(42, 42, 42, 0.8) 100%)', // Lv.5 - 鲜艳渐变
  ];
  return backgrounds[level] || backgrounds[3];
}

// 根据等级获取卡片边框
function getEnergyCardBorder(level: number): string {
  const borders = [
    'rgba(102, 102, 102, 0.3)', // Lv.0 - 灰色边框
    'rgba(139, 26, 26, 0.4)', // Lv.1 - 暗紫红边框
    'rgba(199, 35, 58, 0.35)', // Lv.2
    'rgba(199, 35, 58, 0.4)', // Lv.3
    'rgba(255, 59, 48, 0.5)', // Lv.4 - 明显红边框
    'rgba(255, 45, 85, 0.6)', // Lv.5 - 鲜艳红边框
  ];
  return borders[level] || borders[3];
}

// 根据等级获取卡片阴影
function getEnergyCardShadow(level: number): string {
  const shadows = [
    'none', // Lv.0
    'none', // Lv.1
    'none', // Lv.2
    'none', // Lv.3
    '0 4px 20px rgba(255, 59, 48, 0.15)', // Lv.4 - 微光晕
    '0 4px 30px rgba(255, 45, 85, 0.25), 0 0 40px rgba(255, 215, 0, 0.1)', // Lv.5 - 明显光晕
  ];
  return shadows[level] || shadows[3];
}
