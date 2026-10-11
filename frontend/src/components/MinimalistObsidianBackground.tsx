import React, { useRef, useEffect } from 'react';

export interface MinimalistObsidianBackgroundProps {
  className?: string;
  dotSpacing?: number;
  dotRadius?: number;
  interactiveSpotlight?: boolean;
  spotlightRadius?: number;
  glowIntensity?: number;
  showRadarSweep?: boolean;
  showCrosshairs?: boolean;
}

export const MinimalistObsidianBackground: React.FC<MinimalistObsidianBackgroundProps> = ({
  className = '',
  dotSpacing = 36,
  dotRadius = 1.0,
  interactiveSpotlight = true,
  spotlightRadius = 260,
  glowIntensity = 1.0,
  showRadarSweep = true,
  showCrosshairs = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({
    x: -1000,
    y: -1000,
    targetX: -1000,
    targetY: -1000,
    active: false
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId = 0;
    let isVisible = !document.hidden;
    let width = 0;
    let height = 0;
    let sweepY = 0;
    let lastTime = 0;

    const resize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.targetX = -1000;
      mouseRef.current.targetY = -1000;
    };

    if (interactiveSpotlight) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseleave', handleMouseLeave);
    }

    const onVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible && animId === 0) {
        lastTime = performance.now();
        animId = requestAnimationFrame(render);
      } else if (!isVisible && animId !== 0) {
        cancelAnimationFrame(animId);
        animId = 0;
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    const render = (time: number) => {
      if (!isVisible) return;
      animId = requestAnimationFrame(render);

      const dt = lastTime > 0 ? (time - lastTime) / 1000 : 0.016;
      lastTime = time;

      // Smooth mouse interpolation
      if (mouseRef.current.active) {
        mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.12;
        mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.12;
      } else {
        mouseRef.current.x += (-1000 - mouseRef.current.x) * 0.05;
        mouseRef.current.y += (-1000 - mouseRef.current.y) * 0.05;
      }

      // Sweep progress (slow subtle telemetry cycle ~14 seconds)
      if (showRadarSweep) {
        sweepY += dt * (height / 14);
        if (sweepY > height + 80) {
          sweepY = -80;
        }
      }

      // 1. BASE: Deep Obsidian / Dark Slate Slate Surface
      ctx.fillStyle = '#020611';
      ctx.fillRect(0, 0, width, height);

      // 2. FOCAL AMBIENT ILLUMINATION: Refined Sapphire / Navy Top Aura
      const topAuraRadius = Math.max(width, height) * 0.65;
      const topAura = ctx.createRadialGradient(
        width * 0.5,
        0,
        0,
        width * 0.5,
        0,
        topAuraRadius
      );
      // Clean, elegant monochromatic sapphire glow (no clashing rainbow colors)
      topAura.addColorStop(0, `rgba(30, 64, 175, ${0.14 * glowIntensity})`);   // Deep Navy / Sapphire
      topAura.addColorStop(0.35, `rgba(14, 116, 144, ${0.06 * glowIntensity})`); // Cyan hint
      topAura.addColorStop(0.7, `rgba(15, 23, 42, ${0.02 * glowIntensity})`);
      topAura.addColorStop(1, 'rgba(2, 6, 17, 0)');

      ctx.fillStyle = topAura;
      ctx.fillRect(0, 0, width, height);

      // 3. SECONDARY AMBIENT: Subtle Lower Counter-Glow (Indigo whisper)
      const bottomAura = ctx.createRadialGradient(
        width * 0.85,
        height * 0.95,
        0,
        width * 0.85,
        height * 0.95,
        Math.max(width, height) * 0.45
      );
      bottomAura.addColorStop(0, `rgba(67, 56, 202, ${0.05 * glowIntensity})`);
      bottomAura.addColorStop(1, 'rgba(2, 6, 17, 0)');
      ctx.fillStyle = bottomAura;
      ctx.fillRect(0, 0, width, height);

      // 4. INTERACTIVE MOUSE SPOTLIGHT (Subtle proximity field)
      if (interactiveSpotlight && mouseRef.current.x > -200) {
        const mouseAura = ctx.createRadialGradient(
          mouseRef.current.x,
          mouseRef.current.y,
          0,
          mouseRef.current.x,
          mouseRef.current.y,
          spotlightRadius
        );
        mouseAura.addColorStop(0, `rgba(56, 189, 248, ${0.065 * glowIntensity})`);
        mouseAura.addColorStop(0.5, `rgba(37, 99, 235, ${0.03 * glowIntensity})`);
        mouseAura.addColorStop(1, 'rgba(2, 6, 17, 0)');
        ctx.fillStyle = mouseAura;
        ctx.fillRect(0, 0, width, height);
      }

      // 5. HIGH-PRECISION TACTICAL MICRO-DOT MATRIX
      const cols = Math.ceil(width / dotSpacing) + 1;
      const rows = Math.ceil(height / dotSpacing) + 1;
      const mX = mouseRef.current.x;
      const mY = mouseRef.current.y;
      const spotRadSq = spotlightRadius * spotlightRadius;

      ctx.save();
      for (let r = 0; r < rows; r++) {
        const y = r * dotSpacing;
        for (let c = 0; c < cols; c++) {
          const x = c * dotSpacing;

          // Default subtle dot alpha
          let alpha = 0.08;
          let rRadius = dotRadius;
          let dotColor = 'rgba(148, 163, 184, '; // Slate-400

          // Proximity boost from interactive mouse cursor
          if (interactiveSpotlight && mX > -200) {
            const dx = x - mX;
            const dy = y - mY;
            const distSq = dx * dx + dy * dy;
            if (distSq < spotRadSq) {
              const proxFactor = 1 - Math.sqrt(distSq) / spotlightRadius;
              alpha += proxFactor * 0.35 * glowIntensity;
              rRadius += proxFactor * 0.8;
              dotColor = 'rgba(56, 189, 248, '; // Electric Cyan glow near cursor
            }
          }

          // Subtle illumination when radar sweep passes
          if (showRadarSweep && Math.abs(y - sweepY) < 60) {
            const sweepFactor = 1 - Math.abs(y - sweepY) / 60;
            alpha += sweepFactor * 0.18 * glowIntensity;
            dotColor = 'rgba(125, 211, 252, '; // Bright Sky Blue
          }

          ctx.fillStyle = `${dotColor}${Math.min(0.8, alpha)})`;
          ctx.beginPath();
          ctx.arc(x, y, rRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // 6. SUBTLE TACTICAL COORDINATE CROSSHAIRS
      if (showCrosshairs) {
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.lineWidth = 1;
        const crosshairStep = dotSpacing * 5; // Every 5 dots (e.g. 180px)
        const cCols = Math.ceil(width / crosshairStep);
        const cRows = Math.ceil(height / crosshairStep);
        const arm = 4;

        for (let r = 0; r <= cRows; r++) {
          const cy = r * crosshairStep;
          for (let c = 0; c <= cCols; c++) {
            const cx = c * crosshairStep;

            ctx.beginPath();
            ctx.moveTo(cx - arm, cy);
            ctx.lineTo(cx + arm, cy);
            ctx.moveTo(cx, cy - arm);
            ctx.lineTo(cx, cy + arm);
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // 7. ULTRA-SUBTLE TELEMETRY SCANNING HORIZONTAL SWEEP
      if (showRadarSweep) {
        ctx.save();
        const sweepGrad = ctx.createLinearGradient(0, sweepY - 50, 0, sweepY + 4);
        sweepGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
        sweepGrad.addColorStop(0.85, `rgba(56, 189, 248, ${0.025 * glowIntensity})`);
        sweepGrad.addColorStop(1, `rgba(186, 230, 253, ${0.07 * glowIntensity})`);

        ctx.fillStyle = sweepGrad;
        ctx.fillRect(0, Math.max(0, sweepY - 50), width, 54);

        // Scanline hairline
        ctx.strokeStyle = `rgba(186, 230, 253, ${0.12 * glowIntensity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, sweepY);
        ctx.lineTo(width, sweepY);
        ctx.stroke();
        ctx.restore();
      }

      // 8. DEEP PERIMETER EDGE VIGNETTE (Grounds the content and keeps focus centered)
      const vignette = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        Math.min(width, height) * 0.42,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.82
      );
      vignette.addColorStop(0, 'rgba(2, 6, 17, 0)');
      vignette.addColorStop(0.65, 'rgba(2, 6, 17, 0.4)');
      vignette.addColorStop(1, 'rgba(2, 6, 17, 0.88)');

      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    };

    lastTime = performance.now();
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (interactiveSpotlight) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [
    dotSpacing,
    dotRadius,
    interactiveSpotlight,
    spotlightRadius,
    glowIntensity,
    showRadarSweep,
    showCrosshairs
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{
        width: '100vw',
        height: '100vh',
        background: '#020611'
      }}
      aria-hidden="true"
    />
  );
};

export default MinimalistObsidianBackground;
