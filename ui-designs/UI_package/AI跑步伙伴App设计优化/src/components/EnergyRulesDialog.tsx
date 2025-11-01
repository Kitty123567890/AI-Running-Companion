import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, TrendingUp, TrendingDown } from 'lucide-react';

interface EnergyRulesDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EnergyRulesDialog({ isOpen, onClose }: EnergyRulesDialogProps) {
  const gainRules = [
    { action: '完成一次跑步', value: '+5~20', condition: '根据距离和配速' },
    { action: '连续打卡3天', value: '+8', condition: '完成奖励' },
    { action: '连续打卡7天', value: '+15', condition: '周奖励' },
    { action: '达成目标', value: '+10~30', condition: '根据目标难度' },
    { action: '突破个人最佳', value: '+25', condition: 'PB奖励' },
  ];
  
  const loseRules = [
    { action: '1天未跑步', value: '-2', condition: '每天衰减' },
    { action: '3天未跑步', value: '-5', condition: '累计衰减' },
    { action: '7天未跑步', value: '-15', condition: '严重衰减' },
    { action: '目标失败', value: '-10', condition: '惩罚' },
  ];
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black flex flex-col"
          onClick={onClose}
        >
          {/* 顶部标题栏 */}
          <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B8B] to-[#FF8FA3] flex items-center justify-center">
                <span style={{ fontSize: '24px' }}>💪</span>
              </div>
              <h2 className="text-white ml-3" style={{ fontSize: '20px', fontWeight: 600 }}>元气值计分规则</h2>
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
            {/* 元气值说明 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 rounded-2xl mb-6"
              style={{ background: 'rgba(74, 144, 226, 0.15)' }}
            >
              <p className="text-gray-300" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                元气值代表你和哈特的健康状态，范围0-100分。通过跑步获取元气值，长期不运动会导致衰减。元气值越高，哈特越健康活泼！
              </p>
            </motion.div>
            
            {/* 获取元气值 */}
            <div className="mb-8">
              <div className="flex items-center gap-0 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <TrendingUp size={18} className="text-green-400" />
                </div>
                <h3 className="text-white ml-2" style={{ fontSize: '18px', fontWeight: 600 }}>获取元气值</h3>
              </div>
              
              <div className="space-y-3">
                {gainRules.map((rule, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl"
                    style={{ background: 'rgba(52, 199, 89, 0.1)' }}
                  >
                    <div className="flex items-center gap-0">
                      <div className="w-8 h-8 rounded-full bg-green-500/30 flex items-center justify-center flex-shrink-0">
                        <Plus size={16} className="text-green-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-white" style={{ fontSize: '14px' }}>{rule.action}</p>
                        <p className="text-gray-500" style={{ fontSize: '12px' }}>{rule.condition}</p>
                      </div>
                    </div>
                    <span className="text-green-400 tabular-nums flex-shrink-0 ml-4" style={{ fontSize: '14px', fontWeight: 600 }}>
                      {rule.value}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* 消耗元气值 */}
            <div className="mb-6">
              <div className="flex items-center gap-0 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <TrendingDown size={18} className="text-red-400" />
                </div>
                <h3 className="text-white ml-2" style={{ fontSize: '18px', fontWeight: 600 }}>消耗元气值</h3>
              </div>
              
              <div className="space-y-3">
                {loseRules.map((rule, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl"
                    style={{ background: 'rgba(255, 59, 48, 0.1)' }}
                  >
                    <div className="flex items-center gap-0">
                      <div className="w-8 h-8 rounded-full bg-red-500/30 flex items-center justify-center flex-shrink-0">
                        <Minus size={16} className="text-red-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-white" style={{ fontSize: '14px' }}>{rule.action}</p>
                        <p className="text-gray-500" style={{ fontSize: '12px' }}>{rule.condition}</p>
                      </div>
                    </div>
                    <span className="text-red-400 tabular-nums flex-shrink-0 ml-4" style={{ fontSize: '14px', fontWeight: 600 }}>
                      {rule.value}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          
          {/* 底部提示 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex-shrink-0 px-6 py-4 border-t border-white/10"
            style={{ background: 'rgba(0, 0, 0, 0.3)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-gray-400 text-center" style={{ fontSize: '12px' }}>
              💡 提示：保持规律运动，让哈特始终充满元气！
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
