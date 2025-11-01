import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Target, Edit2, Trash2 } from 'lucide-react';
import { Hart } from './hart/Hart';
import { getHartLevelFromEnergy } from './hart/hartUtils';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';

interface Goal {
  id: string;
  type: 'distance' | 'duration' | 'frequency' | 'pace';
  description: string;
  progress: number;
  total: number;
  daysLeft: number;
  unit: string;
}

interface GoalSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoal: Goal | null;
  energyValue: number;
  onSaveGoal: (goal: Partial<Goal>) => void;
}

export function GoalSheet({ 
  isOpen, 
  onClose, 
  currentGoal,
  energyValue,
  onSaveGoal 
}: GoalSheetProps) {
  const [selectedTab, setSelectedTab] = useState<Goal['type']>('distance');
  const [showAIAssist, setShowAIAssist] = useState(false);
  const [aiStep, setAiStep] = useState<'select' | 'analyzing' | 'recommend'>('select');
  
  const hartLevel = getHartLevelFromEnergy(energyValue);
  const progressPercentage = currentGoal 
    ? (currentGoal.progress / currentGoal.total) * 100 
    : 0;
  
  // 获取进度圆环颜色
  const getProgressColor = () => {
    if (progressPercentage < 50) return 'url(#gradient-low)';
    if (progressPercentage < 80) return 'url(#gradient-mid)';
    return 'url(#gradient-high)';
  };
  
  // AI推荐的示例目标
  const aiRecommendations = [
    {
      type: 'distance' as const,
      description: '本周跑步 15 KM',
      total: 15,
      difficulty: '轻松达成',
      reward: '+12',
      gradient: 'from-[#FF6B8B] to-[#FF8FA3]',
    },
    {
      type: 'frequency' as const,
      description: '连续打卡 7 天',
      total: 7,
      difficulty: '有挑战',
      reward: '+18',
      gradient: 'from-[#34C759] to-[#5FD77E]',
    },
    {
      type: 'pace' as const,
      description: '5KM配速突破 5\'30"',
      total: 5,
      difficulty: '需努力',
      reward: '+25',
      gradient: 'from-[#4A90E2] to-[#5BA3F5]',
    },
  ];
  
  const handleAIAssist = () => {
    setShowAIAssist(true);
    setAiStep('select');
  };
  
  const handleAISelect = (focus: string) => {
    setAiStep('analyzing');
    setTimeout(() => {
      setAiStep('recommend');
    }, 2000);
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-gradient-to-b from-[#0A0A0A] to-[#1A1215] flex flex-col overflow-hidden"
          onClick={onClose}
        >
          {/* 顶部标题栏 */}
          <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-0">
              <Hart level={hartLevel} size="small" />
              <h2 className="text-white ml-3" style={{ fontSize: '20px', fontWeight: 600 }}>我的目标</h2>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X size={24} className="text-white" />
            </button>
          </div>
          
          {/* 内容区 - 可滚动 */}
          <div 
            className="flex-1 overflow-y-auto px-6 py-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 当前目标卡片 */}
            {currentGoal && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
              >
                <div 
                  className="p-6 rounded-3xl"
                  style={{
                    background: '#2A2A2A',
                    border: `1px solid ${progressPercentage > 80 ? 'rgba(52, 199, 89, 0.8)' : 'rgba(74, 144, 226, 0.4)'}`,
                  }}
                >
                  {/* 进度圆环 */}
                  <div className="flex justify-center mb-4">
                    <div className="relative w-36 h-36">
                      <svg className="transform -rotate-90" width="144" height="144">
                        <defs>
                          <linearGradient id="gradient-low" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FF6B8B" />
                            <stop offset="100%" stopColor="#FF8FA3" />
                          </linearGradient>
                          <linearGradient id="gradient-mid" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FF8FA3" />
                            <stop offset="100%" stopColor="#FFD700" />
                          </linearGradient>
                          <linearGradient id="gradient-high" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFD700" />
                            <stop offset="100%" stopColor="#34C759" />
                          </linearGradient>
                        </defs>
                        <circle
                          cx="72"
                          cy="72"
                          r="60"
                          stroke="rgba(255, 255, 255, 0.1)"
                          strokeWidth="8"
                          fill="none"
                        />
                        <motion.circle
                          cx="72"
                          cy="72"
                          r="60"
                          stroke={getProgressColor()}
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 60}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 60 * (1 - progressPercentage / 100) }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="tabular-nums" style={{ fontSize: '48px', fontWeight: 700 }}>{Math.round(progressPercentage)}</span>
                        <span className="text-gray-400" style={{ fontSize: '12px' }}>已完成</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 详细数据 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400" style={{ fontSize: '14px' }}>当前：</span>
                      <span className="text-white ml-2" style={{ fontSize: '14px', fontWeight: 600 }}>{currentGoal.progress} {currentGoal.unit}</span>
                    </div>
                    <div>
                      <span className="text-gray-400" style={{ fontSize: '14px' }}>目标：</span>
                      <span className="text-white ml-2" style={{ fontSize: '14px', fontWeight: 600 }}>{currentGoal.total} {currentGoal.unit}</span>
                    </div>
                    <div>
                      <span className="text-gray-400" style={{ fontSize: '14px' }}>剩余：</span>
                      <span className="text-white ml-2" style={{ fontSize: '14px', fontWeight: 600 }}>{currentGoal.total - currentGoal.progress} {currentGoal.unit}</span>
                    </div>
                    <div>
                      <span className="text-gray-400" style={{ fontSize: '14px' }}>距截止：</span>
                      <span className="text-white ml-2" style={{ fontSize: '14px', fontWeight: 600 }}>{currentGoal.daysLeft} 天</span>
                    </div>
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="flex gap-0 mt-4 justify-end">
                    <button className="text-blue-400 hover:text-blue-300 flex items-center gap-0 mr-4" style={{ fontSize: '14px' }}>
                      <Edit2 size={14} />
                      <span className="ml-1">编辑</span>
                    </button>
                    <button className="text-red-400 hover:text-red-300 flex items-center gap-0" style={{ fontSize: '14px' }}>
                      <Trash2 size={14} />
                      <span className="ml-1">删除</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* AI智能推荐区 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div className="flex items-center gap-0 mb-4">
                <Sparkles size={18} className="text-[#4A90E2]" />
                <h3 className="text-white ml-2" style={{ fontSize: '18px', fontWeight: 600 }}>AI为你推荐</h3>
              </div>
              
              <div 
                className="p-4 rounded-2xl mb-4"
                style={{ background: 'rgba(74, 144, 226, 0.15)' }}
              >
                <p className="text-gray-300" style={{ fontSize: '14px' }}>
                  根据你过去两周的表现，每周跑步15KM对你来说很合适！
                </p>
              </div>
              
              {/* 推荐卡片垂直列表 */}
              <div className="space-y-3">
                {aiRecommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-5 rounded-2xl bg-gradient-to-br ${rec.gradient} cursor-pointer`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Target size={24} className="text-white" />
                      <span className="px-2 py-1 rounded-full bg-white/20 text-white" style={{ fontSize: '12px' }}>
                        {rec.difficulty}
                      </span>
                    </div>
                    <h4 className="text-white mb-2" style={{ fontSize: '20px', fontWeight: 600 }}>
                      {rec.description}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80" style={{ fontSize: '14px' }}>
                        预估奖励：{rec.reward} 元气值
                      </span>
                      <Button 
                        size="sm" 
                        className="bg-white/20 hover:bg-white/30 text-white border-none"
                      >
                        选择
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            {/* 快速创建区 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-24"
            >
              <h3 className="text-white mb-4" style={{ fontSize: '18px', fontWeight: 600 }}>创建新目标</h3>
              
              <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as Goal['type'])}>
                <TabsList className="grid w-full grid-cols-4 bg-white/10">
                  <TabsTrigger value="distance">距离</TabsTrigger>
                  <TabsTrigger value="duration">时长</TabsTrigger>
                  <TabsTrigger value="frequency">频次</TabsTrigger>
                  <TabsTrigger value="pace">配速</TabsTrigger>
                </TabsList>
                
                <div className="mt-6">
                  <TabsContent value="distance" className="space-y-4">
                    <div className="text-center">
                      <input
                        type="number"
                        placeholder="0"
                        className="w-32 h-20 text-center bg-white/5 border border-white/15 rounded-xl focus:border-[#FF6B8B] focus:outline-none text-white tabular-nums"
                        style={{ fontSize: '48px' }}
                      />
                      <p className="text-gray-400 mt-2" style={{ fontSize: '14px' }}>公里</p>
                    </div>
                    
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" size="sm">本周</Button>
                      <Button variant="outline" size="sm">本月</Button>
                      <Button variant="outline" size="sm">自定义</Button>
                    </div>
                    
                    <div 
                      className="p-4 rounded-xl"
                      style={{ background: 'rgba(52, 199, 89, 0.15)' }}
                    >
                      <p className="text-center text-gray-300" style={{ fontSize: '14px' }}>
                        根据你的历史数据，这个目标对你来说<span className="text-[#34C759]" style={{ fontWeight: 600 }}>【合适】</span>
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="duration">
                    <p className="text-center text-gray-400" style={{ fontSize: '14px' }}>时长目标表单</p>
                  </TabsContent>
                  
                  <TabsContent value="frequency">
                    <p className="text-center text-gray-400" style={{ fontSize: '14px' }}>频次目标表单</p>
                  </TabsContent>
                  
                  <TabsContent value="pace">
                    <p className="text-center text-gray-400" style={{ fontSize: '14px' }}>配速目标表单</p>
                  </TabsContent>
                </div>
              </Tabs>
            </motion.div>
          </div>
          
          {/* 底部按钮 - 固定在底部 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex-shrink-0 p-6 border-t border-white/10"
            style={{ background: 'rgba(10, 10, 10, 0.95)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12 bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={handleAIAssist}
              >
                <Sparkles size={16} className="mr-2" />
                让AI帮我设定
              </Button>
              <Button
                className="flex-1 h-12 bg-gradient-to-r from-[#FF6B8B] to-[#FF8FA3] hover:opacity-90"
              >
                保存目标
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
