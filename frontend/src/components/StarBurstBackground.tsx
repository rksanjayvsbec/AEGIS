import React, { useRef, useEffect } from 'react';

export interface StarBurstBackgroundProps {
  streakCount?: number;
  speed?: number;
  colorScheme?: 'purple' | 'cyan' | 'cyber' | 'custom';
  colors?: string[];
  glowIntensity?: number;
  interactive?: boolean;
  blur?: number;
  className?: string;
  style?: React.CSSProperties;
}

interface StarStreak {
  angle: number;       // Angle in radians radiating from bottom center (0 to PI)
  distance: number;    // Current distance from origin
  speed: number;       // Radial velocity
  length: number;      // Tail length of the streak
  size: number;        // Width / thickness
  alpha: number;       // Current opacity
  color: string;       // Color of the streak
  twinkle: number;     // Flicker factor
}

const PURPLE_PALETTE = [
  '#d8b4fe', // light violet
  '#c084fc', // bright purple
  '#a855f7', // vivid purple
  '#8b5cf6', // deep violet
  '#e879f9', // neon fuchsia
  '#6366f1', // electric indigo
  '#f3e8ff', // white-lavender
];

export const StarBurstBackground: React.FC<StarBurstBackgroundProps> = ({
  streakCount = 130,
  speed = 0.7,
  colors = PURPLE_PALETTE,
  glowIntensity = 1.15,
  interactive = true,
  blur = 2.0,
  className = '',
  style = {}
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streaksRef = useRef<StarStreak[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId = 0;
    let isPageVisible = !document.hidden;
    let lastRenderTime = 0;
    const targetInterval = 1000 / 50; // Smooth 50 FPS cap saves massive power/thermal overhead

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStreaks();
    };

    // Calculate max radial distance across the canvas from bottom-center
    const getMaxDistance = () => Math.hypot(width / 2, height) * 1.05;

    const createStreak = (randomDistance = false): StarStreak => {
      const maxDist = getMaxDistance();
      const angleVariance = (Math.random() - 0.5) * 0.15;
      const baseAngle = Math.PI * (0.05 + Math.random() * 0.9) + angleVariance;
      const streakSpeed = (Math.random() * 1.8 + 0.9) * speed;
      const initialDist = randomDistance ? Math.random() * maxDist : Math.random() * 15;

      return {
        angle: baseAngle,
        distance: initialDist,
        speed: streakSpeed,
        length: Math.random() * 26 + 12,
        size: Math.random() * 1.7 + 0.6,
        alpha: Math.random() * 0.6 + 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        twinkle: Math.random() * Math.PI * 2
      };
    };

    const initStreaks = () => {
      const streaks: StarStreak[] = [];
      for (let i = 0; i < streakCount; i++) {
        streaks.push(createStreak(true));
      }
      streaksRef.current = streaks;
    };

    initStreaks();

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const nx = (e.clientX - width / 2) / (width / 2);
      const ny = (e.clientY - height) / height;
      mouseRef.current.targetX = nx * 30; // gentle tilt offset
      mouseRef.current.targetY = ny * 12;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
      mouseRef.current.active = false;
    };

    window.addEventListener('resize', handleResize);
    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseleave', handleMouseLeave);
    }

    let time = 0;

    const render = (currentTime: number) => {
      if (!isPageVisible) {
        animId = 0;
        return;
      }

      animId = requestAnimationFrame(render);

      const delta = currentTime - lastRenderTime;
      if (delta < targetInterval) return;
      lastRenderTime = currentTime - (delta % targetInterval);

      time += 0.015;
      const maxDist = getMaxDistance();

      // Smooth mouse tilt interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const originX = width / 2 + mouseRef.current.x;
      const originY = height + 10 + mouseRef.current.y;

      // 1. Deep Space Black Canvas with Soft Vignette
      ctx.fillStyle = '#050308';
      ctx.fillRect(0, 0, width, height);

      // 2. Luminous Bottom-Center Horizon Glow Dome
      const horizonRadius = Math.max(width, height) * 0.6;
      const horizonGlow = ctx.createRadialGradient(
        originX, originY, 0,
        originX, originY, horizonRadius
      );
      horizonGlow.addColorStop(0, `rgba(168, 85, 247, ${0.45 * glowIntensity})`);
      horizonGlow.addColorStop(0.12, `rgba(139, 92, 246, ${0.28 * glowIntensity})`);
      horizonGlow.addColorStop(0.3, `rgba(99, 102, 241, ${0.12 * glowIntensity})`);
      horizonGlow.addColorStop(0.65, `rgba(30, 10, 45, ${0.04 * glowIntensity})`);
      horizonGlow.addColorStop(1, 'rgba(5, 3, 8, 0)');

      ctx.fillStyle = horizonGlow;
      ctx.fillRect(0, 0, width, height);

      // 3. Dense Radial Starburst Beams & Streaks (Zero shadowBlur = No CPU Heat)
      ctx.save();
      ctx.lineCap = 'round';

      streaksRef.current.forEach((streak, idx) => {
        const distFactor = Math.min(2.0, 1 + (streak.distance / maxDist) * 0.9);
        streak.distance += streak.speed * distFactor;

        if (streak.distance > maxDist) {
          streaksRef.current[idx] = createStreak(false);
          return;
        }

        const cosA = Math.cos(streak.angle);
        const sinA = Math.sin(streak.angle);

        const headX = originX + cosA * streak.distance;
        const headY = originY - sinA * streak.distance;

        const tailLength = streak.length * (0.8 + (streak.distance / maxDist) * 1.8);
        const tailX = originX + cosA * Math.max(0, streak.distance - tailLength);
        const tailY = originY - sinA * Math.max(0, streak.distance - tailLength);

        const fadeProgress = streak.distance / maxDist;
        const distanceAlpha = fadeProgress < 0.85 ? 1 : 1 - (fadeProgress - 0.85) / 0.15;
        const twinkleAlpha = 0.8 + 0.2 * Math.sin(time * 3 + streak.twinkle);
        const finalAlpha = Math.max(0, Math.min(1, streak.alpha * distanceAlpha * twinkleAlpha));

        const streakGrad = ctx.createLinearGradient(tailX, tailY, headX, headY);
        streakGrad.addColorStop(0, 'rgba(168, 85, 247, 0)');
        streakGrad.addColorStop(0.6, streak.color.replace(')', `, ${finalAlpha * 0.6})`));
        streakGrad.addColorStop(1, `#ffffff`);

        ctx.strokeStyle = streakGrad;
        ctx.lineWidth = streak.size * (0.7 + (streak.distance / maxDist) * 0.6);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(headX, headY);
        ctx.stroke();

        // Sparkle head
        if (streak.speed > 2.2) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(headX, headY, streak.size * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      ctx.restore();

      // 4. Subtle Ambient Starfield Dust
      ctx.save();
      for (let i = 0; i < 15; i++) {
        const seedX = (Math.sin(i * 99 + time * 0.05) * 0.5 + 0.5) * width;
        const seedY = (Math.cos(i * 33 + time * 0.05) * 0.4 + 0.1) * height;
        const pulse = Math.sin(time * 2 + i) * 0.5 + 0.5;

        ctx.fillStyle = i % 2 === 0 ? 'rgba(216, 180, 254, ' : 'rgba(255, 255, 255, ';
        ctx.fillStyle += `${0.2 + pulse * 0.4})`;
        ctx.beginPath();
        ctx.arc(seedX, seedY, 1 + pulse * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const startRender = () => {
      if (isPageVisible && animId === 0) {
        lastRenderTime = performance.now();
        animId = requestAnimationFrame(render);
      }
    };

    const stopRender = () => {
      if (animId !== 0) {
        cancelAnimationFrame(animId);
        animId = 0;
      }
    };

    const onVisibility = () => {
      isPageVisible = !document.hidden;
      isPageVisible ? startRender() : stopRender();
    };
    document.addEventListener('visibilitychange', onVisibility);

    startRender();

    return () => {
      stopRender();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [streakCount, speed, colors, glowIntensity, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{
        width: '100vw',
        height: '100vh',
        filter: blur > 0 ? `blur(${blur}px)` : 'none',
        transform: blur > 0 ? 'scale(1.025)' : 'none',
        ...style
      }}
    />
  );
};

export default StarBurstBackground;
