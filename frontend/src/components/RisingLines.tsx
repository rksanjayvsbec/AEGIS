import React, { useRef, useEffect } from 'react';

export interface RisingLinesProps {
  color?: string;
  particleColor?: string;
  laserColor?: string;
  lineCount?: number;
  particleCount?: number;
  speed?: number;
  laserBeam?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const RisingLines: React.FC<RisingLinesProps> = ({
  color = '#60a5fa',
  particleColor = '#facc15',
  laserColor = '#38bdf8',
  lineCount = 65,
  particleCount = 50,
  speed = 1.0,
  laserBeam = true,
  className = '',
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let mouse = { x: -1000, y: -1000 };

    interface AscendingLine {
      x: number;
      y: number;
      length: number;
      speed: number;
      width: number;
      opacity: number;
      laserHead: boolean;
    }

    interface RisingParticle {
      x: number;
      y: number;
      size: number;
      vy: number;
      opacity: number;
      pulseSpeed: number;
    }

    let lines: AscendingLine[] = [];
    let particles: RisingParticle[] = [];
    let laserY = height * 0.5;
    let laserDir = 1;

    const resize = () => {
      width = canvas.clientWidth || window.innerWidth;
      height = canvas.clientHeight || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const init = () => {
      lines = Array.from({ length: lineCount }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 120 + 40,
        speed: (Math.random() * 4 + 2) * speed,
        width: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
        laserHead: Math.random() > 0.6,
      }));

      particles = Array.from({ length: particleCount }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        vy: (Math.random() * 1.5 + 0.5) * speed,
        opacity: Math.random() * 0.7 + 0.3,
        pulseSpeed: Math.random() * 0.05 + 0.02,
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

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    resize();
    init();

    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      frame += 0.02;

      // 1. Render Ascending Lines with Laser Heads
      lines.forEach((l) => {
        l.y -= l.speed;
        if (l.y + l.length < 0) {
          l.y = height + 50;
          l.x = Math.random() * width;
        }

        // Mouse Proximity Lift & Glow
        const distToMouse = Math.hypot(l.x - mouse.x, l.y - mouse.y);
        const mouseGlow = distToMouse < 150 ? (1 - distToMouse / 150) * 0.5 : 0;

        const grad = ctx.createLinearGradient(l.x, l.y, l.x, l.y + l.length);
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'transparent');

        ctx.strokeStyle = grad;
        ctx.lineWidth = l.width + mouseGlow * 2;
        ctx.globalAlpha = Math.min(1, l.opacity + mouseGlow);

        ctx.beginPath();
        ctx.moveTo(l.x, l.y);
        ctx.lineTo(l.x, l.y + l.length);
        ctx.stroke();

        // Glowing Laser Beam Tip / Head
        if (l.laserHead) {
          ctx.fillStyle = laserColor;
          ctx.beginPath();
          ctx.arc(l.x, l.y, l.width * 1.5 + mouseGlow * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 2. Render Ascending Dust Particles
      particles.forEach((p) => {
        p.y -= p.vy;
        if (p.y < 0) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }

        const pulse = Math.sin(frame * p.pulseSpeed * 10) * 0.2 + 0.8;
        ctx.fillStyle = particleColor;
        ctx.globalAlpha = p.opacity * pulse;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Horizontal Sweeping Laser Beam Effect
      if (laserBeam) {
        laserY += laserDir * 1.2 * speed;
        if (laserY > height * 0.9) laserDir = -1;
        if (laserY < height * 0.1) laserDir = 1;

        ctx.globalAlpha = 0.4;
        const laserGrad = ctx.createLinearGradient(0, laserY, width, laserY);
        laserGrad.addColorStop(0, 'transparent');
        laserGrad.addColorStop(0.3, laserColor);
        laserGrad.addColorStop(0.5, '#ffffff');
        laserGrad.addColorStop(0.7, laserColor);
        laserGrad.addColorStop(1, 'transparent');

        ctx.strokeStyle = laserGrad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, laserY);
        ctx.lineTo(width, laserY);
        ctx.stroke();

        // Laser Beam Glow Blur Line
        ctx.lineWidth = 6;
        ctx.globalAlpha = 0.15;
        ctx.stroke();
      }

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, [color, particleColor, laserColor, lineCount, particleCount, speed, laserBeam]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`} style={style}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
};

export default RisingLines;
