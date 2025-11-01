import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, Navigation, ChevronRight, Clock, TrendingUp } from 'lucide-react';

interface DestinationInputPageProps {
  onConfirm: (destination: string) => void;
  onBack: () => void;
}

interface Suggestion {
  name: string;
  distance: string;
  time: string;
  type: 'nearby' | 'history' | 'recommended';
}

export function DestinationInputPage({ onConfirm, onBack }: DestinationInputPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  
  // 模拟推荐目的地
  const suggestions: Suggestion[] = [
    { name: '世纪公园', distance: '2.3 KM', time: '15 分钟', type: 'nearby' },
    { name: '滨江森林公园', distance: '5.8 KM', time: '35 分钟', type: 'recommended' },
    { name: '外滩', distance: '3.1 KM', time: '20 分钟', type: 'history' },
    { name: '人民广场', distance: '4.5 KM', time: '28 分钟', type: 'nearby' },
    { name: '陆家嘴环形绿地', distance: '6.2 KM', time: '38 分钟', type: 'recommended' },
  ];
  
  const filteredSuggestions = searchQuery
    ? suggestions.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : suggestions;
  
  const handleSelectDestination = (destination: string) => {
    setSelectedDestination(destination);
  };
  
  const handleConfirm = () => {
    if (selectedDestination) {
      onConfirm(selectedDestination);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#1A1215] text-white p-6">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-8 pt-6">
        <button 
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← 返回
        </button>
        <h1 className="text-xl font-semibold">选择目的地</h1>
        <div className="w-12" /> {/* 占位 */}
      </div>
      
      {/* 搜索框 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索地点或输入地址"
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#4A90E2] transition-colors"
          />
        </div>
      </motion.div>
      
      {/* AI 智能推荐提示 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 mb-6 px-4 py-3 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.15) 0%, rgba(91, 163, 245, 0.05) 100%)',
          border: '1px solid rgba(74, 144, 226, 0.2)',
        }}
      >
        <TrendingUp size={18} className="text-[#4A90E2]" />
        <p className="text-sm text-gray-300">
          AI 根据你的运动习惯推荐了以下目的地
        </p>
      </motion.div>
      
      {/* 目的地列表 */}
      <div className="space-y-3">
        {filteredSuggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            onClick={() => handleSelectDestination(suggestion.name)}
            className={`p-5 rounded-2xl cursor-pointer transition-all ${
              selectedDestination === suggestion.name
                ? 'bg-[#4A90E2]/20 border-[#4A90E2]'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
            style={{
              border: `1px solid ${selectedDestination === suggestion.name ? '#4A90E2' : 'rgba(255, 255, 255, 0.1)'}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* 图标 */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  suggestion.type === 'recommended' 
                    ? 'bg-[#4A90E2]/20' 
                    : suggestion.type === 'history'
                    ? 'bg-[#FF6B8B]/20'
                    : 'bg-white/10'
                }`}>
                  {suggestion.type === 'recommended' ? (
                    <TrendingUp size={20} className="text-[#4A90E2]" />
                  ) : suggestion.type === 'history' ? (
                    <Clock size={20} className="text-[#FF6B8B]" />
                  ) : (
                    <MapPin size={20} className="text-gray-400" />
                  )}
                </div>
                
                {/* 信息 */}
                <div>
                  <h3 className="font-semibold mb-1">{suggestion.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Navigation size={12} />
                      {suggestion.distance}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {suggestion.time}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* 选中标记 */}
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                selectedDestination === suggestion.name
                  ? 'border-[#4A90E2] bg-[#4A90E2]'
                  : 'border-gray-600'
              }`}>
                {selectedDestination === suggestion.name && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-white"
                  />
                )}
              </div>
            </div>
            
            {/* 标签 */}
            {suggestion.type === 'recommended' && (
              <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#4A90E2]/20 text-xs text-[#4A90E2]">
                ✨ AI 推荐
              </div>
            )}
            {suggestion.type === 'history' && (
              <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#FF6B8B]/20 text-xs text-[#FF6B8B]">
                🕐 最近去过
              </div>
            )}
          </motion.div>
        ))}
      </div>
      
      {/* 底部确认按钮 */}
      <div className="flex-shrink-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleConfirm}
          disabled={!selectedDestination}
          className={`w-full h-12 rounded-full flex items-center justify-center gap-2 transition-all ${
            selectedDestination
              ? 'bg-gradient-to-r from-[#4A90E2] to-[#5BA3F5] text-white shadow-lg'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          {selectedDestination ? (
            <>
              开始导航
              <ChevronRight size={18} />
            </>
          ) : (
            '请选择目的地'
          )}
        </motion.button>
      </div>
    </div>
  );
}
