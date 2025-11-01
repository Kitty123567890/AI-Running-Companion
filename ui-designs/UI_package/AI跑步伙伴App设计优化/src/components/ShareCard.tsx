import { motion } from 'motion/react';
import { Hart } from './hart/Hart';
import { getHartLevelFromEnergy } from './hart/hartUtils';
import { X, Download } from 'lucide-react';
import { useRef, useState } from 'react';

import type { AchievementType } from '../utils/achievementConfig';

interface ShareCardProps {
  stats: {
    distance: number | string;
    duration: string;
    pace: string;
    calories: number;
    route?: { lat: number; lng: number }[];
  };
  energyGained: number;
  energyValue: number;
  achievements?: {
    type: AchievementType;
    title: string;
  }[];
  onClose: () => void;
}

export function ShareCard({ 
  stats, 
  energyGained, 
  energyValue,
  achievements = [],
  onClose 
}: ShareCardProps) {
  const hartLevel = getHartLevelFromEnergy(energyValue);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // 解析距离字符串
  const distance = typeof stats.distance === 'number' 
    ? stats.distance 
    : parseFloat(stats.distance);

  // AI生成的鼓励语（根据跑步数据）
  const getAIQuote = () => {
    if (distance >= 10) {
      return "今天的风也追不上你的脚步！";
    } else if (distance >= 5) {
      return "每一步都在突破自己，继续保持！";
    } else {
      return "完美的开始，下次会更棒！";
    }
  };

  // 下载分享卡片
  const handleDownload = async () => {
    if (!cardRef.current || isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      // 等待所有动画完成
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 动态导入 html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      // 使用 html2canvas 将卡片转换为图片
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0A0A0A',
        scale: 2, // 提高分辨率，确保高质量
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
        onclone: (clonedDoc) => {
          // 确保克隆的文档中的动画被冻结
          const clonedCard = clonedDoc.getElementById('share-card-content');
          if (clonedCard) {
            // 移除所有动画以确保静态截图
            clonedCard.style.animation = 'none';
            const allElements = clonedCard.querySelectorAll('*');
            allElements.forEach((el: Element) => {
              if (el instanceof HTMLElement) {
                el.style.animation = 'none';
                el.style.transition = 'none';
              }
            });
          }
        }
      });
      
      // 将 canvas 转换为 blob
      canvas.toBlob((blob) => {
        if (blob) {
          // 创建下载链接
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          const now = new Date();
          const dateStr = now.toISOString().split('T')[0];
          const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
          link.download = `MovAIQ-跑步记录-${dateStr}-${timeStr}.png`;
          link.href = url;
          
          // 触发下载
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // 清理
          setTimeout(() => URL.revokeObjectURL(url), 100);
        } else {
          throw new Error('无法生成图片');
        }
      }, 'image/png', 1.0); // 最高质量
      
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请稍后重试');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      onClick={onClose}
    >
      {/* 顶部按钮栏 */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4">
        <div className="text-white/80 text-sm">点击卡片外区域关闭</div>
        <div className="flex gap-3">
          {/* 下载按钮 */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            disabled={isDownloading}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isDownloading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Download size={20} className="text-white" />
              </motion.div>
            ) : (
              <Download size={20} className="text-white" />
            )}
          </motion.button>
          
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* 分享卡片内容 - 全屏显示，自适应比例 */}
      <motion.div
        ref={cardRef}
        id="share-card-content"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full h-full max-w-[540px] max-h-[90vh] mx-auto my-auto rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #FF6B8B 0%, #FF8FA3 25%, #4A90E2 60%, #1A1A2E 100%)',
          aspectRatio: '4/5',
        }}
        onClick={(e) => e.stopPropagation()}
      >
          {/* 装饰性背景层 - 静态版本避免动画bug */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white opacity-20 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-gradient-to-tr from-[#FF6B8B] to-[#4A90E2] opacity-30 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-white/10 to-transparent blur-2xl" />
          </div>

          {/* 主要内容区 */}
          <div className="relative z-10 h-full flex flex-col p-8">
            {/* A. 顶部品牌区 */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-white text-lg font-semibold tracking-wide">元气跑伴</h3>
                <p className="text-white/60 text-xs">MovAIQ</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <span className="text-2xl">❤️</span>
              </div>
            </div>

            {/* B. 核心数据展示区 */}
            <div className="flex-1 flex flex-col justify-center items-center mb-8">
              {/* 主数据 - 距离 */}
              <div className="relative mb-6">
                {/* 背景装饰数字 */}
                <div 
                  className="absolute inset-0 flex items-center justify-center opacity-5"
                  style={{ fontSize: '240px', fontWeight: 900, lineHeight: 1 }}
                >
                  {distance.toFixed(2).split('.')[0]}
                </div>
                
                {/* 实际数字 */}
                <div className="relative flex items-baseline gap-2">
                  <span 
                    className="text-white font-black tabular-nums"
                    style={{ 
                      fontSize: '120px',
                      lineHeight: 1,
                      textShadow: '0 4px 30px rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    {distance.toFixed(2)}
                  </span>
                  <span className="text-white/80 text-4xl font-bold mb-4">KM</span>
                </div>
              </div>

              {/* 次级数据 - 时长和配速 */}
              <div className="flex gap-8 mb-8">
                <div className="text-center">
                  <p className="text-white/60 text-sm mb-1">时长</p>
                  <p className="text-white text-3xl font-bold tabular-nums">{stats.duration}</p>
                </div>
                
                <div className="w-px bg-white/20" />
                
                <div className="text-center">
                  <p className="text-white/60 text-sm mb-1">配速</p>
                  <p className="text-white text-3xl font-bold tabular-nums">{stats.pace}</p>
                </div>
              </div>
            </div>

            {/* C. 路线图与哈特整合区 */}
            <div className="relative mb-6">
              {/* 简化的路线图表示 */}
              <div className="relative h-32 rounded-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {/* 装饰性路线 */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 130">
                  <defs>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FF6B8B" stopOpacity="0.9" />
                      <stop offset="50%" stopColor="#4A90E2" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#34C759" stopOpacity="0.9" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  <path
                    d="M 20 100 Q 100 40, 200 65 T 380 50"
                    stroke="url(#routeGradient)"
                    strokeWidth="5"
                    fill="none"
                    strokeLinecap="round"
                    filter="url(#glow)"
                  />
                  
                  {/* 起点标记 */}
                  <g>
                    <circle cx="20" cy="100" r="8" fill="#FF6B8B" opacity="0.3" />
                    <circle cx="20" cy="100" r="5" fill="#FF6B8B" />
                  </g>
                  
                  {/* 终点标记 */}
                  <g>
                    <circle cx="380" cy="50" r="12" fill="#34C759" opacity="0.2" />
                    <circle cx="380" cy="50" r="6" fill="#34C759" />
                  </g>
                </svg>

                {/* 哈特形象 - 放在终点位置 */}
                <div className="absolute top-2 right-2 transform scale-[0.6]">
                  <Hart level={hartLevel} size="small" />
                </div>
              </div>
            </div>

            {/* D. 元气值与成就徽章区 */}
            <div
              className="flex items-center justify-between mb-6 px-5 py-4 rounded-2xl backdrop-blur-md"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 107, 139, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
                border: '1px solid rgba(255, 107, 139, 0.3)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B8B] to-[#FF8FA3] flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">+{energyGained}</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-base">元气值</p>
                  <p className="text-white/70 text-xs">哈特充满了能量！</p>
                </div>
              </div>
              
              {/* 成就徽章（如果有） */}
              {achievements.length > 0 && (
                <div className="flex gap-2">
                  {achievements.slice(0, 2).map((achievement, index) => (
                    <div
                      key={index}
                      className="w-11 h-11 rounded-full bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF8C00] flex items-center justify-center shadow-lg relative"
                      title={achievement.title}
                    >
                      {/* 光晕效果 */}
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%)',
                        }}
                      />
                      <span className="text-white text-base relative z-10">🏆</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* E. AI语录区 */}
            <div className="text-center mb-8">
              <div 
                className="inline-block relative px-8 py-4 rounded-2xl backdrop-blur-md"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                {/* 引号装饰 */}
                <div className="absolute -top-2 -left-2 text-white/30 text-3xl">"</div>
                <div className="absolute -bottom-2 -right-2 text-white/30 text-3xl">"</div>
                
                <p className="text-white font-medium italic relative z-10" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                  {getAIQuote()}
                </p>
              </div>
              <p className="text-white/50 text-xs mt-3 flex items-center justify-center gap-1">
                <span>—</span>
                <span className="font-semibold">哈特</span>
                <span>❤️</span>
              </p>
            </div>

            {/* F. 底部水印与二维码区 */}
            <div className="flex items-center justify-between text-white/50 text-xs border-t border-white/10 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-gradient-to-br from-[#FF6B8B] to-[#FF8FA3] flex items-center justify-center">
                  <span className="text-white text-[10px]">❤️</span>
                </div>
                <p className="font-medium">由「元气跑伴」生成</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-white/90 flex items-center justify-center p-1">
                  {/* 简化的二维码图案 */}
                  <div className="grid grid-cols-3 gap-[1px] w-full h-full">
                    {[...Array(9)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`${
                          [0, 2, 4, 6, 8].includes(i) ? 'bg-black' : 'bg-transparent'
                        } rounded-[1px]`}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-white/60 font-medium">扫码下载</p>
                  <p className="text-white/40 text-[10px]">MovAIQ</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      {/* 底部提示 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-4 left-0 right-0 text-center z-40 pointer-events-none"
      >
        {isDownloading ? (
          <p className="text-white/70 text-sm mb-1 flex items-center justify-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              ⏳
            </motion.span>
            正在生成图片...
          </p>
        ) : (
          <>
            <p className="text-white/70 text-sm mb-1">
              点击下载按钮保存图片，分享你的跑步成就
            </p>
            <p className="text-white/40 text-xs">
              让朋友们看看你和哈特的精彩时刻 ✨
            </p>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
