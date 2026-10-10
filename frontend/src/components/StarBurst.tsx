import React, { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import './StarBurst.css';

export interface StarBurstProps {
  children?: React.ReactNode;
  particleCount?: number;
  starCount?: number;
  colors?: string[];
  radius?: number;
  speed?: number;
  gravity?: number;
  duration?: number;
  decay?: number;
  minSize?: number;
  maxSize?: number;
  sparkle?: boolean;
  trigger?: 'click' | 'hover' | 'manual';
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onBurst?: () => void;
}

export interface StarBurstRef {
  burst: (x?: number, y?: number) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  rotation: number;
  rotationSpeed: number;
  isStar: boolean;
  points: number;
}

const DEFAULT_COLORS = ['#38bdf8', '#0284c7', '#6366f1', '#facc15', '#10b981', '#ffffff', '#ec4899'];

export const StarBurst = forwardRef<StarBurstRef, StarBurstProps>(({
  children,
  particleCount = 28,
  starCount = 14,
  colors = DEFAULT_COLORS,
  radius = 120,
  speed = 4.5,
  gravity = 0.08,
  duration = 1.0,
  decay = 0.94,
  minSize = 3,
  maxSize = 9,
  sparkle = true,
  trigger = 'click',
  disabled = false,
  className = '',
  style = {},
  onBurst
}, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animIdRef = useRef<number | null>(null);

  // Draw 4-point or 5-point star polygon on 2D context
  const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  };

  // Render loop - ONLY active when particles exist (Zero Idle CPU/GPU overhead)
  const startLoop = useCallback(() => {
    if (animIdRef.current !== null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (particlesRef.current.length > 0) {
        const surviving: Particle[] = [];

        for (let i = 0; i < particlesRef.current.length; i++) {
          const p = particlesRef.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += gravity;
          p.vx *= decay;
          p.vy *= decay;
          p.life -= 1;
          p.rotation += p.rotationSpeed;
          p.alpha = Math.max(0, p.life / p.maxLife);

          if (sparkle && Math.random() > 0.85) {
            p.alpha = Math.min(1, p.alpha * (Math.random() * 0.5 + 0.75));
          }

          if (p.life > 0 && p.alpha > 0.01) {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);

            if (p.isStar) {
              drawStar(ctx, 0, 0, p.points, p.size, p.size * 0.4);
            } else {
              ctx.beginPath();
              ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
              ctx.fill();
            }

            ctx.restore();
            surviving.push(p);
          }
        }

        particlesRef.current = surviving;
        animIdRef.current = requestAnimationFrame(update);
      } else {
        // Complete halt when 0 particles (stops laptop heating completely)
        animIdRef.current = null;
      }
    };

    animIdRef.current = requestAnimationFrame(update);
  }, [gravity, decay, sparkle]);

  const spawnParticles = useCallback((originX: number, originY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const total = particleCount + starCount;
    const newParticles: Particle[] = [];

    for (let i = 0; i < total; i++) {
      const isStar = i < starCount;
      const angle = (Math.random() * Math.PI * 2);
      const velocity = (Math.random() * 0.7 + 0.3) * speed;
      const maxLife = (Math.random() * 0.4 + 0.6) * (duration * 60);
      const size = Math.random() * (maxSize - minSize) + minSize;
      const color = colors[Math.floor(Math.random() * colors.length)];

      newParticles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * velocity * (radius / 50),
        vy: Math.sin(angle) * velocity * (radius / 50),
        size,
        color,
        alpha: 1,
        life: maxLife,
        maxLife,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.25,
        isStar,
        points: Math.random() > 0.4 ? 4 : 5
      });
    }

    particlesRef.current.push(...newParticles);
    startLoop();

    if (onBurst) {
      onBurst();
    }
  }, [particleCount, starCount, colors, radius, speed, duration, minSize, maxSize, onBurst, startLoop]);

  const burst = useCallback((x?: number, y?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const originX = x !== undefined ? x : canvas.width / 2;
    const originY = y !== undefined ? y : canvas.height / 2;
    spawnParticles(originX, originY);
  }, [spawnParticles]);

  useImperativeHandle(ref, () => ({
    burst
  }));

  useEffect(() => {
    return () => {
      if (animIdRef.current !== null) {
        cancelAnimationFrame(animIdRef.current);
        animIdRef.current = null;
      }
    };
  }, []);

  // Adjust canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const size = radius * 3.2;
    canvas.width = size;
    canvas.height = size;
  }, [radius]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || trigger !== 'click') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    burst(x, y);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || trigger !== 'hover') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    burst(x, y);
  };

  return (
    <div
      ref={containerRef}
      className={`star-burst-container ${className}`}
      style={style}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
      <canvas
        ref={canvasRef}
        className="star-burst-canvas"
        style={{
          width: `${radius * 3.2}px`,
          height: `${radius * 3.2}px`
        }}
      />
      {children}
    </div>
  );
});

StarBurst.displayName = 'StarBurst';

export default StarBurst;
