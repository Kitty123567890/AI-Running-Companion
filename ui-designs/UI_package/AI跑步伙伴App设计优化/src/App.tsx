import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InitialPage } from './components/InitialPage';
import { HomePage } from './components/HomePage';
import { GoalSheet } from './components/GoalSheet';
import { RunningPage, RunStats } from './components/RunningPage';
import { DestinationInputPage } from './components/DestinationInputPage';
import { SummaryPage } from './components/SummaryPage';
import { HistoryPage } from './components/HistoryPage';
import { Toaster } from './components/ui/sonner';

type Page = 'initial' | 'home' | 'mode-select' | 'destination-input' | 'running' | 'summary' | 'history';
type RunMode = 'free' | 'destination';

interface Goal {
  id: string;
  type: 'distance' | 'duration' | 'frequency' | 'pace';
  description: string;
  progress: number;
  total: number;
  daysLeft: number;
  unit: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('initial'); // 从初始页开始
  const [isAwakening, setIsAwakening] = useState(false);
  const [showGoalSheet, setShowGoalSheet] = useState(false);
  const [selectedRunMode, setSelectedRunMode] = useState<RunMode>('free');
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [lastRunStats, setLastRunStats] = useState<RunStats | null>(null);
  
  // 模拟数据
  const [energyValue, setEnergyValue] = useState(95); // 元气值 - 设为95测试Lv.5效果
  const [weeklyDistance, setWeeklyDistance] = useState(12.5);
  const [weeklyGoal] = useState(20);
  const [streakDays] = useState(5);
  const [currentGoal, setCurrentGoal] = useState<Goal | null>({
    id: '1',
    type: 'distance',
    description: '本周跑步 20 KM',
    progress: 12.5,
    total: 20,
    daysLeft: 3,
    unit: 'KM',
  });
  
  // 苏醒动画
  const handleAwaken = () => {
    setIsAwakening(true);
    
    // 苏醒动画序列
    setTimeout(() => {
      setCurrentPage('home');
      setIsAwakening(false);
    }, 2500);
  };
  
  // 开始跑步
  const handleStartRun = () => {
    setCurrentPage('mode-select');
  };
  
  // 选择跑步模式
  const handleSelectMode = (mode: RunMode) => {
    setSelectedRunMode(mode);
    if (mode === 'free') {
      // 自由跑直接进入跑步界面
      setCurrentPage('running');
    } else {
      // 目的地跑需要先选择目的地
      setCurrentPage('destination-input');
    }
  };
  
  // 确认目的地
  const handleConfirmDestination = (destination: string) => {
    setSelectedDestination(destination);
    setCurrentPage('running');
  };
  
  // 完成跑步
  const handleFinishRun = (stats: RunStats) => {
    console.log('跑步数据:', stats);
    // 保存跑步数据
    setLastRunStats(stats);
    // 更新元气值
    setEnergyValue(prev => Math.min(100, prev + stats.energyGained));
    // 更新里程
    setWeeklyDistance(prev => prev + stats.distance);
    // 跳转到总结页
    setCurrentPage('summary');
  };
  
  // 取消跑步
  const handleCancelRun = () => {
    setCurrentPage('home');
  };
  
  // 处理目标保存
  const handleSaveGoal = (goal: Partial<Goal>) => {
    console.log('保存目标:', goal);
    setShowGoalSheet(false);
  };
  
  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {currentPage === 'initial' && (
          <motion.div
            key="initial"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <InitialPage 
              onAwaken={handleAwaken}
              energyValue={energyValue}
            />
          </motion.div>
        )}
        
        {currentPage === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <HomePage
              energyValue={energyValue}
              weeklyDistance={weeklyDistance}
              weeklyGoal={weeklyGoal}
              streakDays={streakDays}
              currentGoal={currentGoal}
              onStartRun={handleStartRun}
              onGoalClick={() => setShowGoalSheet(true)}
              onHistoryClick={() => setCurrentPage('history')}
              onHartClick={() => {
                // 弹出元气值详情
                console.log('显示元气值详情');
              }}
            />
          </motion.div>
        )}
        
        {currentPage === 'mode-select' && (
          <motion.div
            key="mode-select"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#1A1215] text-white p-6"
          >
            <div className="flex flex-col items-center pt-12">
              <button 
                onClick={() => setCurrentPage('home')}
                className="absolute top-6 left-6 text-gray-400 hover:text-white"
              >
                ← 返回
              </button>
              
              <h1 className="text-2xl font-semibold mb-12">选择跑步模式</h1>
              
              <div className="grid grid-cols-1 gap-6 w-full max-w-md">
                {/* 自由跑卡片 */}
                <motion.div
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelectMode('free')}
                  className="relative h-64 p-6 rounded-3xl overflow-hidden cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 107, 139, 0.2) 0%, rgba(255, 143, 163, 0.1) 100%)',
                    border: '1px solid rgba(255, 107, 139, 0.3)',
                  }}
                >
                  {/* 粒子背景动画 */}
                  <div className="absolute inset-0 opacity-30">
                    {[...Array(30)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-[#FF6B8B] rounded-full"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          y: [0, -20, 0],
                          opacity: [0.2, 0.6, 0.2],
                        }}
                        transition={{
                          duration: 3 + Math.random() * 2,
                          repeat: Infinity,
                          delay: Math.random() * 2,
                        }}
                      />
                    ))}
                  </div>
                  
                  <div className="relative z-10">
                    <div className="text-6xl mb-4">∞</div>
                    <h2 className="text-2xl font-semibold mb-2">自由跑</h2>
                    <p className="text-gray-400">随心所欲，随时结束</p>
                  </div>
                </motion.div>
                
                {/* 目的地跑卡片 */}
                <motion.div
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelectMode('destination')}
                  className="relative h-64 p-6 rounded-3xl overflow-hidden cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.2) 0%, rgba(91, 163, 245, 0.1) 100%)',
                    border: '1px solid rgba(74, 144, 226, 0.3)',
                  }}
                >
                  {/* 地图线条流动背景 */}
                  <svg className="absolute inset-0 w-full h-full opacity-20">
                    <motion.path
                      d="M 0,100 Q 100,50 200,100 T 400,100"
                      stroke="#4A90E2"
                      strokeWidth="2"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  </svg>
                  
                  <div className="relative z-10">
                    <div className="text-6xl mb-4">🚩</div>
                    <h2 className="text-2xl font-semibold mb-2">目的地跑</h2>
                    <p className="text-gray-400">设定目的地，AI导航陪跑</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
        
        {currentPage === 'destination-input' && (
          <motion.div
            key="destination-input"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <DestinationInputPage
              onConfirm={handleConfirmDestination}
              onBack={() => setCurrentPage('mode-select')}
            />
          </motion.div>
        )}
        
        {currentPage === 'running' && (
          <motion.div
            key="running"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <RunningPage
              mode={selectedRunMode}
              energyValue={energyValue}
              destination={selectedRunMode === 'destination' ? selectedDestination : undefined}
              onFinish={handleFinishRun}
              onCancel={handleCancelRun}
            />
          </motion.div>
        )}
        
        {currentPage === 'summary' && lastRunStats && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <SummaryPage
              stats={lastRunStats}
              energyValue={energyValue}
              onClose={() => setCurrentPage('home')}
            />
          </motion.div>
        )}
        
        {currentPage === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <HistoryPage
              onBack={() => setCurrentPage('home')}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 目标管理浮层 */}
      <GoalSheet
        isOpen={showGoalSheet}
        onClose={() => setShowGoalSheet(false)}
        currentGoal={currentGoal}
        energyValue={energyValue}
        onSaveGoal={handleSaveGoal}
      />
      
      {/* Toast通知 */}
      <Toaster />
    </div>
  );
}
