import { HartLevel } from './Hart';

export interface HartConfig {
  colors: {
    primary: string;
    secondary?: string;
  };
  glow: {
    visible: boolean;
    layers: Array<{
      color: string;
      opacity: number;
      maxScale: number;
    }>;
  };
  opacity: number;
  animation: {
    interval: number; // 心跳间隔（秒）
    firstBeat: number; // 第一跳幅度
    secondBeat: number; // 第二跳幅度
  };
  cracks?: string[]; // SVG路径
  decorations: {
    type: 'none' | 'notes' | 'sparkles' | 'rain' | 'storm';
  };
  face: {
    eyeType: 'open' | 'happy' | 'tired' | 'dead' | 'spiral';
    mouthType: 'smile' | 'normal' | 'sad' | 'pain';
  };
}

export function getHartConfig(level: HartLevel): HartConfig {
  switch (level) {
    case 5: // 元气爆棚
      return {
        colors: {
          primary: '#FF2D55',
          secondary: '#FF6B8B',
        },
        glow: {
          visible: true,
          layers: [
            { color: 'rgba(255, 215, 0, 0.4)', opacity: 0.4, maxScale: 1.8 },
            { color: 'rgba(255, 143, 163, 0.25)', opacity: 0.25, maxScale: 2.0 },
          ],
        },
        opacity: 1,
        animation: {
          interval: 0.8,
          firstBeat: 1.18,
          secondBeat: 1.12,
        },
        decorations: {
          type: 'notes',
        },
        face: {
          eyeType: 'happy',
          mouthType: 'smile',
        },
      };
      
    case 4: // 活力充沛
      return {
        colors: {
          primary: '#FF3B30',
          secondary: '#FF6B8B',
        },
        glow: {
          visible: true,
          layers: [
            { color: 'rgba(255, 143, 163, 0.3)', opacity: 0.3, maxScale: 1.6 },
          ],
        },
        opacity: 1,
        animation: {
          interval: 1.2,
          firstBeat: 1.15,
          secondBeat: 1.10,
        },
        decorations: {
          type: 'sparkles',
        },
        face: {
          eyeType: 'open',
          mouthType: 'smile',
        },
      };
      
    case 3: // 基础平稳
      return {
        colors: {
          primary: '#C7233A',
        },
        glow: {
          visible: true,
          layers: [
            { color: 'rgba(255, 107, 139, 0.15)', opacity: 0.15, maxScale: 1.3 },
          ],
        },
        opacity: 1,
        animation: {
          interval: 1.8,
          firstBeat: 1.12,
          secondBeat: 1.08,
        },
        decorations: {
          type: 'none',
        },
        face: {
          eyeType: 'open',
          mouthType: 'normal',
        },
      };
      
    case 2: // 元气不足
      return {
        colors: {
          primary: '#8B1A1A',
        },
        glow: {
          visible: false,
          layers: [],
        },
        opacity: 0.85,
        animation: {
          interval: 2.5,
          firstBeat: 1.08,
          secondBeat: 1.05,
        },
        cracks: [
          'M 55,30 Q 58,45 60,60', // 裂纹1
        ],
        decorations: {
          type: 'none',
        },
        face: {
          eyeType: 'tired',
          mouthType: 'sad',
        },
      };
      
    case 1: // 垂头丧气
      return {
        colors: {
          primary: '#4A2424',
        },
        glow: {
          visible: false,
          layers: [],
        },
        opacity: 0.7,
        animation: {
          interval: 5.0,
          firstBeat: 1.04,
          secondBeat: 1.02,
        },
        cracks: [
          'M 55,30 Q 58,45 60,60',
          'M 65,35 Q 68,50 70,65',
          'M 50,50 Q 55,60 60,70',
        ],
        decorations: {
          type: 'rain',
        },
        face: {
          eyeType: 'spiral',
          mouthType: 'pain',
        },
      };
      
    case 0: // 病变濒危
    default:
      return {
        colors: {
          primary: '#2C2C2C',
        },
        glow: {
          visible: false,
          layers: [],
        },
        opacity: 0.6,
        animation: {
          interval: 10.0,
          firstBeat: 1.02,
          secondBeat: 1.01,
        },
        cracks: [
          'M 50,25 Q 55,40 60,55',
          'M 60,30 Q 65,45 70,60',
          'M 45,45 Q 50,55 55,65',
          'M 65,50 Q 70,60 75,70',
          'M 55,35 L 58,50',
        ],
        decorations: {
          type: 'storm',
        },
        face: {
          eyeType: 'dead',
          mouthType: 'pain',
        },
      };
  }
}

export function getHartLevelFromEnergy(energy: number): HartLevel {
  if (energy >= 90) return 5;
  if (energy >= 70) return 4;
  if (energy >= 40) return 3;
  if (energy >= 20) return 2;
  if (energy >= 1) return 1;
  return 0;
}
