import { useEffect, useRef } from 'react';
import { HartLevel } from './Hart';

interface HartParticlesProps {
  level: HartLevel;
}

export function HartParticles({ level }: HartParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const particles: Particle[] = [];
    const particleCount = level === 5 ? 20 : 10;
    
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      color: string;
      size: number;
      
      constructor() {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.5 + 0.2;
        const radius = 60;
        
        this.x = canvas!.width / 2 + Math.cos(angle) * radius;
        this.y = canvas!.height / 2 + Math.sin(angle) * radius;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1.0;
        this.maxLife = 1.0;
        
        // 根据等级选择颜色
        const colors = level === 5 
          ? ['#FFD700', '#FF8FA3', '#FFFFFF'] 
          : ['#FF8FA3', '#FFFFFF'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.size = Math.random() * 3 + 2;
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.01;
        
        // 轻微重力
        this.vy += 0.02;
      }
      
      draw(context: CanvasRenderingContext2D) {
        context.globalAlpha = this.life;
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
      }
      
      isDead() {
        return this.life <= 0;
      }
    }
    
    // 动画循环
    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 定期添加新粒子
      if (particles.length < particleCount && Math.random() < 0.1) {
        particles.push(new Particle());
      }
      
      // 更新和绘制粒子
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.update();
        particle.draw(ctx);
        
        if (particle.isDead()) {
          particles.splice(i, 1);
        }
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [level]);
  
  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      className="absolute -left-10 -top-10 pointer-events-none"
      style={{ width: 200, height: 200 }}
    />
  );
}
