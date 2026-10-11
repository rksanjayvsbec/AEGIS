import React, { useRef, useEffect } from 'react';

export interface PremiumAegisVoidProps {
  speed?: number;
  glowIntensity?: number;
  standingStill?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface AmbientAura {
  baseX: number;
  baseY: number;
  radiusRatio: number;
  colorRgb: string;
  speedX: number;
  speedY: number;
  phase: number;
  pulseSpeed: number;
}

interface StardustMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  twinklePhase: number;
  twinkleSpeed: number;
  color: string;
}

export const PremiumAegisVoidBackground: React.FC<PremiumAegisVoidProps> = ({
  speed = 0.4,
  glowIntensity = 1.0,
  standingStill = false,
  className = '',
  style = {}
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // 🌌 3 Curated Harmonious Ambient Auras (Deep Celestial Sapphire, Royal Indigo, Subtle Cyan)
    // Soft, diffused, elegant ambient lighting that never clutters or distracts
    const auras: AmbientAura[] = [
      {
        baseX: 0.5,
        baseY: 0.08,
        radiusRatio: 0.72,
        colorRgb: '30, 64, 175',     // Deep Sapphire Blue Horizon
        speedX: 0.0002 * speed,
        speedY: 0.00015 * speed,
        phase: 0,
        pulseSpeed: 0.00035 * speed
      },
      {
        baseX: 0.22,
        baseY: 0.48,
        radiusRatio: 0.65,
        colorRgb: '79, 70, 229',     // Soft Royal Indigo
        speedX: -0.00018 * speed,
        speedY: 0.00022 * speed,
        phase: 1.8,
        pulseSpeed: 0.0004 * speed
      },
      {
        baseX: 0.78,
        baseY: 0.42,
        radiusRatio: 0.68,
        colorRgb: '14, 116, 144',    // Ethereal Deep Cyan
        speedX: 0.00016 * speed,
        speedY: -0.0002 * speed,
        phase: 3.4,
        pulseSpeed: 0.0003 * speed
      }
    ];

    // ✨ 22 Microscopic, Ultra-Clean Stardust Motes (Serene, Slow, ZERO Cursor Tracking)
    const particleCount = 22;
    const particles: StardustMote[] = [];
    const colors = ['#38bdf8', '#818cf8', '#a5b4fc', '#ffffff'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.08 * speed,
        vy: -(0.08 + Math.random() * 0.16) * speed,
        size: 0.6 + Math.random() * 0.9,
        baseAlpha: 0.15 + Math.random() * 0.35,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.01 + Math.random() * 0.02,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    let lastTime = 0;
    let elapsed = 0;

    const render = (time: number) => {
      const dt = lastTime === 0 ? 16 : Math.min(time - lastTime, 100);
      lastTime = time;

      if (!standingStill) {
        elapsed += dt;
      }

      // 1. Pristine Midnight Obsidian Base (Smooth Linear Falloff)
      const baseGrad = ctx.createLinearGradient(0, 0, 0, height);
      baseGrad.addColorStop(0, '#02050e');
      baseGrad.addColorStop(0.5, '#040816');
      baseGrad.addColorStop(1, '#02040a');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Soft, Seamless Ambient Auras (Screen Composite)
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      const minDim = Math.min(width, height);

      auras.forEach((aura) => {
        const t = elapsed * 0.001;
        const wanderX = Math.sin(t * aura.speedX * 1000 + aura.phase) * (width * 0.08);
        const wanderY = Math.cos(t * aura.speedY * 1000 + aura.phase * 1.1) * (height * 0.06);
        const pulse = Math.sin(t * aura.pulseSpeed * 1000 + aura.phase) * 0.08;

        const cx = aura.baseX * width + wanderX;
        const cy = aura.baseY * height + wanderY;
        const r = minDim * aura.radiusRatio * (1 + pulse);

        const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        const peak = Math.min(0.28, 0.22 * glowIntensity);
        const mid = Math.min(0.12, 0.09 * glowIntensity);

        radGrad.addColorStop(0, `rgba(${aura.colorRgb}, ${peak.toFixed(3)})`);
        radGrad.addColorStop(0.4, `rgba(${aura.colorRgb}, ${mid.toFixed(3)})`);
        radGrad.addColorStop(0.8, `rgba(${aura.colorRgb}, ${(mid * 0.25).toFixed(3)})`);
        radGrad.addColorStop(1, `rgba(${aura.colorRgb}, 0)`);

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Elegant Top Horizon Specular Aura (Subtle Sunrise Bloom)
      const topAura = ctx.createRadialGradient(
        width * 0.5,
        0,
        0,
        width * 0.5,
        0,
        Math.max(width * 0.6, 500)
      );
      topAura.addColorStop(0, 'rgba(56, 189, 248, 0.07)');
      topAura.addColorStop(0.4, 'rgba(99, 102, 241, 0.035)');
      topAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = topAura;
      ctx.fillRect(0, 0, width, height * 0.5);

      ctx.restore();

      // 4. Ultra-Subtle Ambient Stardust Motes (Clean, Serene, Minimal)
      ctx.save();
      particles.forEach((p) => {
        if (!standingStill) {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }

          p.twinklePhase += p.twinkleSpeed;
        }

        const twinkle = 0.7 + 0.3 * Math.sin(p.twinklePhase);
        const currentAlpha = Math.min(0.65, p.baseAlpha * twinkle * glowIntensity);

        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // 5. Clean Optical Edge Vignette for Crystal Clarity on Dashboard
      const vigGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        Math.min(width, height) * 0.45,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.8
      );
      vigGrad.addColorStop(0, 'rgba(2, 4, 10, 0)');
      vigGrad.addColorStop(0.75, 'rgba(2, 4, 10, 0.25)');
      vigGrad.addColorStop(1, 'rgba(2, 4, 10, 0.75)');

      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, width, height);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [speed, glowIntensity, standingStill]);

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
      style={{
        width: '100vw',
        height: '100vh',
        ...style
      }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

export default PremiumAegisVoidBackground;
