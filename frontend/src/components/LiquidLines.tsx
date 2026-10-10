import React, { useRef, useEffect } from 'react';

export interface LiquidLinesProps {
  lineCount?: number;
  speed?: number;
  amplitude?: number;
  frequency?: number;
  colorScheme?: 'cyber' | 'sapphire' | 'emerald' | 'sunset' | 'custom';
  colors?: string[];
  opacity?: number;
  contrast?: number;
  lineWidth?: number;
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const PALETTES = {
  cyber: ['#0284c7', '#38bdf8', '#6366f1', '#06b6d4', '#818cf8'],
  sapphire: ['#1d4ed8', '#3b82f6', '#60a5fa', '#93c5fd', '#2563eb'],
  emerald: ['#059669', '#10b981', '#34d399', '#06b6d4', '#047857'],
  sunset: ['#f43f5e', '#fb7185', '#f59e0b', '#fbbf24', '#c084fc'],
};

export const LiquidLines: React.FC<LiquidLinesProps> = ({
  lineCount = 14,
  speed = 0.6,
  amplitude = 65,
  frequency = 0.0025,
  colorScheme = 'cyber',
  colors,
  opacity = 0.55,
  contrast = 1.2,
  lineWidth = 1.8,
  interactive = true,
  className = '',
  style = {}
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let time = 0;

    const activeColors = colors || (colorScheme !== 'custom' ? PALETTES[colorScheme] : PALETTES.cyber);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = -1000;
      mouseRef.current.targetY = -1000;
    };

    window.addEventListener('resize', handleResize);
    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseleave', handleMouseLeave);
    }

    const render = () => {
      time += 0.015 * speed;

      // Smooth mouse follow
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Deep High-Contrast Atmospheric Background Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#060b18');
      bgGrad.addColorStop(0.5, '#0a1226');
      bgGrad.addColorStop(1, '#050914');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.lineWidth = lineWidth;

      const spacing = height / (lineCount + 1);

      for (let i = 0; i < lineCount; i++) {
        const baseY = spacing * (i + 1);
        const color = activeColors[i % activeColors.length];
        
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10 * contrast;

        const step = 8;
        const phase = (i * Math.PI) / lineCount;
        const lineAmp = amplitude * (0.65 + 0.35 * Math.sin(time * 0.5 + i * 0.4));

        for (let x = 0; x <= width; x += step) {
          // Complex layered sine wave equations for silky fluid feel
          const w1 = Math.sin(x * frequency + time + phase) * lineAmp;
          const w2 = Math.cos(x * frequency * 1.6 - time * 0.8 + i * 0.3) * (lineAmp * 0.45);
          const w3 = Math.sin(x * frequency * 0.5 + time * 1.2) * (lineAmp * 0.25);
          
          let y = baseY + w1 + w2 + w3;

          // Interactive mouse wave perturbation
          if (interactive && mouseRef.current.x > 0) {
            const dx = x - mouseRef.current.x;
            const dy = baseY - mouseRef.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const radius = 220;
            if (dist < radius) {
              const force = (1 - dist / radius) * 45 * Math.sin(time * 3 + dist * 0.05);
              y += force;
            }
          }

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [lineCount, speed, amplitude, frequency, colorScheme, colors, opacity, contrast, lineWidth, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{
        width: '100vw',
        height: '100vh',
        ...style
      }}
    />
  );
};

export default LiquidLines;
