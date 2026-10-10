import React, { useRef, useEffect } from 'react';
import { RisingLines } from './RisingLines';

export interface ConstellationFieldProps {
  variant?: 'particle-drift' | 'fluid-field' | 'rising-lines';
  mode?: 'dark' | 'light';
  speed?: number;
  size?: number;
  length?: number;
  density?: number;
  opacity?: number;
  hue?: number;
  saturation?: number;
  brightness?: number;
}

export const ConstellationField: React.FC<ConstellationFieldProps> = ({
  variant = 'particle-drift',
  mode = 'dark',
  speed = 1.0,
  size = 1.2,
  length = 1.0,
  density = 1.73,
  opacity = 1.0,
  hue = 0,
  saturation = 1.0,
  brightness = 0.79,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (variant === 'rising-lines') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*()'.split('');
    let mouse = { x: -1000, y: -1000 };

    interface Node {
      x: number;
      y: number;
      vy: number;
      char: string;
    }

    interface Beam {
      x: number;
      y: number;
      length: number;
      speed: number;
      opacity: number;
    }

    let nodes: Node[] = [];
    let beams: Beam[] = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const initParticles = () => {
      const nodeCount = Math.max(12, Math.round(90 * density));
      const beamCount = Math.max(4, Math.round(25 * density));

      nodes = Array.from({ length: nodeCount }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vy: (Math.random() * 0.4 + 0.1) * speed,
        char: chars[Math.floor(Math.random() * chars.length)],
      }));

      beams = Array.from({ length: beamCount }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        length: (Math.random() * 100 + 50) * length,
        speed: (Math.random() * 6 + 3) * speed,
        opacity: Math.random() * 0.5 + 0.3,
      }));
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      resize();
      initParticles();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    resize();
    initParticles();

    const linkDistance = Math.round(120 * length);
    const mouseProximity = 180;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Upward Beams (Fast Drift)
      beams.forEach((b) => {
        b.y -= b.speed;
        if (b.y + b.length < 0) {
          b.y = height + 100;
          b.x = Math.random() * width;
        }
        const g = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.length);
        const beamColor = mode === 'light'
          ? `rgba(37, 99, 235, ${b.opacity * opacity})`
          : `rgba(96, 165, 250, ${b.opacity * opacity})`;
        g.addColorStop(0, beamColor);
        g.addColorStop(1, 'transparent');
        ctx.strokeStyle = g;
        ctx.lineWidth = Number((1.5 * size).toFixed(2));
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x, b.y + b.length);
        ctx.stroke();
      });

      // 2. Interactive Nodes (ASCII Symbols)
      ctx.font = `${Math.round(12 * size)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Proximity Lines
      ctx.lineWidth = Number((0.5 * size).toFixed(2));
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const d = Math.hypot(n1.x - n2.x, n1.y - n2.y);
          if (d < linkDistance) {
            const lineAlpha = mode === 'light'
              ? 0.22 * (1 - d / linkDistance) * opacity
              : 0.15 * (1 - d / linkDistance) * opacity;
            const lineColor = mode === 'light'
              ? `rgba(36, 48, 68, ${lineAlpha})`
              : `rgba(156, 163, 175, ${lineAlpha})`;
            ctx.strokeStyle = lineColor;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach((n) => {
        n.y += n.vy;
        if (n.y > height + 20) {
          n.y = -20;
          n.x = Math.random() * width;
        }

        const dist = Math.hypot(mouse.x - n.x, mouse.y - n.y);

        // Dynamic Character Swap on Mouse Hover
        if (dist < mouseProximity || Math.random() > 0.98) {
          n.char = chars[Math.floor(Math.random() * chars.length)];
        }

        // Mouse Connection Line
        if (dist < mouseProximity) {
          const mouseLineAlpha = 0.5 * (1 - dist / mouseProximity) * opacity;
          const mouseLineColor = mode === 'light'
            ? `rgba(37, 99, 235, ${mouseLineAlpha})`
            : `rgba(96, 165, 250, ${mouseLineAlpha})`;
          ctx.strokeStyle = mouseLineColor;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }

        const activeColor = mode === 'light' ? `rgba(37, 99, 235, ${opacity})` : `rgba(96, 165, 250, ${opacity})`;
        const defaultColor = mode === 'light' ? `rgba(36, 48, 68, ${0.55 * opacity})` : `rgba(156, 163, 175, ${0.4 * opacity})`;
        ctx.fillStyle = dist < mouseProximity ? activeColor : defaultColor;
        ctx.fillText(n.char, n.x, n.y);
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, [density, length, mode, opacity, size, speed, variant]);

  if (variant === 'rising-lines') {
    return (
      <RisingLines
        color={mode === 'light' ? '#2563eb' : '#60a5fa'}
        particleColor="#facc15"
        laserColor="#38bdf8"
        lineCount={Math.round(65 * density)}
        particleCount={Math.round(50 * density)}
        speed={speed}
        laserBeam={true}
        className="fixed inset-0 z-0 pointer-events-none w-full h-full"
      />
    );
  }

  const filter = hue === 0 && saturation === 1 && brightness === 0.79
    ? `brightness(${brightness})`
    : `hue-rotate(${hue}deg) saturate(${saturation}) brightness(${brightness})`;

  return (
    <>
      {/* 🌌 Particle Drift Canvas Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none w-full h-full"
        style={{
          background: mode === 'light' ? '#eef1f6' : '#030509',
          filter,
        }}
      />

      {/* 🎨 Matte Noise Texture Overlay */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.15] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </>
  );
};

export default ConstellationField;
