import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hart } from './hart/Hart';
import { getHartLevelFromEnergy } from './hart/hartUtils';
import { 
  Pause, 
  Play, 
  Square, 
  Music, 
  ChevronUp,
  Navigation
} from 'lucide-react';

interface RunningPageProps {
  mode: 'free' | 'destination';
  energyValue: number;
  destination?: string;
  onFinish: (data: RunStats) => void;
  onCancel: () => void;
}

export interface RunStats {
  distance: number;
  duration: number; // 秒
  pace: string; // 分钟/公里
  calories: number;
  energyGained: number;
}

export function RunningPage({ mode, energyValue, destination, onFinish, onCancel }: RunningPageProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0); // 秒
  const [distance, setDistance] = useState(0); // 公里
  const [showStats, setShowStats] = useState(false);
  const [hartMessage, setHartMessage] = useState('');
  const [steps, setSteps] = useState(0);
  
  const hartLevel = getHartLevelFromEnergy(energyValue);
  
  // 计算配速 (分钟/公里)
  const pace = distance > 0 ? formatPace(duration / 60 / distance) : '--:--';
  
  // 计算卡路里 (简化公式)
  const calories = Math.round(distance * 60); // 约60卡/公里
  
  // 格式化时间
  const formattedDuration = formatDuration(duration);
  
  // 定时器
  useEffect(() => {
    if (isRunning && !isPaused) {
      const timer = setInterval(() => {
        setDuration(prev => prev + 1);
        // 模拟距离增长 (实际应该用GPS)
        setDistance(prev => prev + 0.002); // 约7.2km/h
        // 模拟步数增长 (约2步/秒)
        setSteps(prev => prev + 2);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isRunning, isPaused]);
  
  // 哈特鼓励消息
  useEffect(() => {
    const messages = [
      '继续加油！你做得很棒！💪',
      '感觉到你的决心了，太棒了！',
      '保持节奏，我们一起前进！',
      '你的每一步都让我更有活力！✨',
      '坚持下去，胜利就在前方！',
    ];
    
    const interval = setInterval(() => {
      if (isRunning && !isPaused) {
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        setHartMessage(randomMessage);
        setTimeout(() => setHartMessage(''), 3000);
      }
    }, 20000); // 每20秒鼓励一次
    
    return () => clearInterval(interval);
  }, [isRunning, isPaused]);
  
  // 开始跑步
  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };
  
  // 暂停
  const handlePause = () => {
    setIsPaused(!isPaused);
  };
  
  // 结束跑步
  const handleFinish = () => {
    const stats: RunStats = {
      distance: parseFloat(distance.toFixed(2)),
      duration,
      pace,
      calories,
      energyGained: Math.round(distance * 5), // 每公里+5元气值
    };
    onFinish(stats);
  };
  
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* 地图背景区域 (模拟) */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black opacity-50"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(74, 144, 226, 0.1) 0%, transparent 50%)',
        }}
      />
      
      {/* 顶部状态栏 */}
      <div className="relative z-10 pt-6 px-6">
        {mode === 'destination' && destination && (
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md">
              <Navigation size={14} className="text-blue-400" />
              <span className="text-xs text-gray-400">前往 {destination}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* 地图模块 */}
      <div className="relative z-10 flex-shrink-0 px-6 mt-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-36 rounded-3xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10"
        >
          {/* 地图占位 - 实际应该接入地图SDK */}
          <div className="relative w-full h-full">
            {/* 模拟地图网格 */}
            <div className="absolute inset-0 opacity-20">
              {[...Array(8)].map((_, i) => (
                <div key={`h-${i}`} className="absolute left-0 right-0 border-t border-gray-600" style={{ top: `${(i + 1) * 12.5}%` }} />
              ))}
              {[...Array(8)].map((_, i) => (
                <div key={`v-${i}`} className="absolute top-0 bottom-0 border-l border-gray-600" style={{ left: `${(i + 1) * 12.5}%` }} />
              ))}
            </div>
            
            {/* 当前位置标记 */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <div className="w-4 h-4 bg-[#FF6B8B] rounded-full border-2 border-white shadow-lg" />
            </motion.div>
            
            {/* 路径轨迹 */}
            {isRunning && (
              <motion.svg 
                className="absolute inset-0 w-full h-full"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 10, ease: "linear" }}
              >
                <motion.path
                  d="M 30,120 Q 60,80 100,100 T 180,90 Q 220,85 260,110"
                  stroke="#FF6B8B"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(255, 107, 139, 0.6))' }}
                />
              </motion.svg>
            )}
            
            {/* 地图信息 */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-xs text-white">
                {distance > 0 ? `${distance.toFixed(2)} KM` : '等待开始'}
              </div>
              {mode === 'destination' && destination && (
                <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-xs text-blue-400">
                  还有 {(5 - distance).toFixed(1)} KM
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* 中心 - ��特和主要数据 */}
      <div className="relative z-10 flex flex-col items-center justify-center" style={{ height: 'calc(100vh - 480px)', marginTop: '200px' }}>
        {/* 哈特 */}
        <motion.div
          animate={isRunning && !isPaused ? {
            scale: [1, 1.05, 1],
          } : {}}
          transition={{
            duration: 0.6,
            repeat: isRunning && !isPaused ? Infinity : 0,
            ease: "easeInOut"
          }}
          className="mb-4"
        >
          <Hart level={hartLevel} size="medium" isBeating={isRunning && !isPaused} />
        </motion.div>
        
        {/* 哈特消息 */}
        <AnimatePresence>
          {hartMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20"
              style={{ top: '50%', left: '50%', transform: 'translate(-50%, 50px)' }}
            >
              <p className="text-xs text-white whitespace-nowrap">{hartMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* 主要数据 - 距离 */}
        <div className="text-center mb-4">
          <div className="flex items-baseline justify-center gap-2 mb-1">
            <motion.span 
              className="text-5xl font-bold tabular-nums"
              key={distance}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
            >
              {distance.toFixed(2)}
            </motion.span>
            <span className="text-xl text-gray-400">KM</span>
          </div>
          <p className="text-xs text-gray-500">距离</p>
        </div>
        
        {/* 次要数据行 */}
        <div className="flex items-center gap-6">
          {/* 时间 */}
          <div className="text-center">
            <p className="text-lg font-semibold tabular-nums">{formattedDuration}</p>
            <p className="text-[10px] text-gray-500 mt-1">时间</p>
          </div>
          
          {/* 配速 */}
          <div className="text-center">
            <p className="text-lg font-semibold tabular-nums">{pace}</p>
            <p className="text-[10px] text-gray-500 mt-1">配速 (分钟/KM)</p>
          </div>
          
          {/* 卡路里 */}
          <div className="text-center">
            <p className="text-lg font-semibold tabular-nums">{calories}</p>
            <p className="text-[10px] text-gray-500 mt-1">卡路里</p>
          </div>
        </div>
      </div>
      
      {/* 底部控制区 */}
      <div className="relative z-20 flex-shrink-0">
        {/* 展开数据卡片 */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="bg-gradient-to-b from-black/95 to-black backdrop-blur-xl border-t border-white/10 rounded-t-3xl p-6 pb-8"
            >
              <button
                onClick={() => setShowStats(false)}
                className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-600 rounded-full"
              />
              
              <div className="grid grid-cols-2 gap-4 mt-8">
                <StatCard label="步数" value={steps.toString()} unit="步" icon="👣" />
                <StatCard label="步频" value="165" unit="步/分" icon="👟" />
                <StatCard label="海拔上升" value="28" unit="米" icon="⛰️" />
                <StatCard label="元气值" value={`+${Math.round(distance * 5)}`} unit="" icon="⚡" color="#FF6B8B" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* 主控制栏 */}
        <div className="bg-black/80 backdrop-blur-xl border-t border-white/10 px-6 py-4">
          {/* 顶部小按钮 */}
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <ChevronUp size={14} className={showStats ? 'rotate-180' : ''} />
              数据详情
            </button>
            
            <button className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors">
              <Music size={14} />
              音乐
            </button>
          </div>
          
          {/* 主按钮组 */}
          <div className="flex items-center justify-center gap-3">
            {!isRunning ? (
              // 开始按钮
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleStart}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-[#FF6B8B] to-[#FF8FA3] flex items-center justify-center shadow-lg"
              >
                <Play size={28} fill="white" />
              </motion.button>
            ) : (
              <>
                {/* 暂停/继续 */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePause}
                  className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center"
                >
                  {isPaused ? <Play size={20} /> : <Pause size={20} />}
                </motion.button>
                
                {/* 结束 */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFinish}
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-[#FF3B30] to-[#FF6B8B] flex items-center justify-center shadow-lg"
                >
                  <Square size={24} />
                </motion.button>
                
                {/* 取消 */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onCancel}
                  className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center"
                >
                  <span className="text-xs">取消</span>
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 辅助组件 - 数据卡片
function StatCard({ 
  label, 
  value, 
  unit, 
  icon, 
  color = '#fff' 
}: { 
  label: string; 
  value: string; 
  unit: string; 
  icon: string;
  color?: string;
}) {
  return (
    <div 
      className="p-4 rounded-2xl backdrop-blur-md"
      style={{
        background: 'rgba(42, 42, 42, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tabular-nums" style={{ color }}>{value}</span>
        {unit && <span className="text-sm text-gray-400">{unit}</span>}
      </div>
    </div>
  );
}

// 辅助函数
function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatPace(minutesPerKm: number): string {
  if (!isFinite(minutesPerKm) || minutesPerKm <= 0) return '--:--';
  
  const mins = Math.floor(minutesPerKm);
  const secs = Math.floor((minutesPerKm - mins) * 60);
  
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
