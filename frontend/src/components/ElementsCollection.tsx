import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Droplets, Zap, Flame, CloudRain, Sliders, Eye, EyeOff } from 'lucide-react';

export type ElementVariant = 'water' | 'lightning' | 'fire' | 'condensation';

interface ElementsCollectionProps {
  variant?: ElementVariant;
  interactive?: boolean;
  className?: string;
  showControls?: boolean;
  overlayOpacity?: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  amplitude: number;
  speed: number;
  decay: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  hue: number;
  pulseSpeed: number;
  pulseOffset: number;
}

export const ElementsCollection: React.FC<ElementsCollectionProps> = ({
  variant: initialVariant = 'water',
  interactive = true,
  className = '',
  showControls = true,
  overlayOpacity = 0.85
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [variant, setVariant] = useState<ElementVariant>(initialVariant);
  const [isVisible, setIsVisible] = useState(true);
  const [particleCount, setParticleCount] = useState(45);
  const [isExpanded, setIsExpanded] = useState(false);

  // Animation state refs
  const animFrameId = useRef<number>(0);
  const ripplesRef = useRef<Ripple[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000, vx: 0, vy: 0, isDown: false, lastX: 0, lastY: 0 });
  const timeRef = useRef<number>(0);

  // Initialize Particles
  const initParticles = useCallback((width: number, height: number, v: ElementVariant) => {
    const parts: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      parts.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (v === 'fire' ? 0.8 : 0.4),
        vy: v === 'fire' ? -(0.8 + Math.random() * 1.5) : (Math.random() - 0.5) * 0.4,
        size: Math.random() * 3 + 1.2,
        baseAlpha: Math.random() * 0.6 + 0.2,
        alpha: Math.random() * 0.6 + 0.2,
        hue: v === 'water' ? 185 + Math.random() * 35 : v === 'fire' ? 15 + Math.random() * 35 : v === 'lightning' ? 220 + Math.random() * 40 : 200,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }
    particlesRef.current = parts;
  }, [particleCount]);

  // Spawn a ripple
  const createRipple = useCallback((x: number, y: number, amplitude = 1.0) => {
    let color = 'rgba(6, 182, 212, 0.4)'; // Cyan
    let maxR = Math.max(120, Math.min(window.innerWidth * 0.35, 260));

    if (variant === 'lightning') {
      color = 'rgba(99, 102, 241, 0.5)'; // Indigo
      maxR = 180;
    } else if (variant === 'fire') {
      color = 'rgba(249, 115, 22, 0.4)'; // Orange
      maxR = 140;
    } else if (variant === 'condensation') {
      color = 'rgba(148, 163, 184, 0.35)'; // Slate
      maxR = 100;
    }

    ripplesRef.current.push({
      x,
      y,
      radius: 2,
      maxRadius: maxR,
      amplitude: amplitude * (variant === 'condensation' ? 0.6 : 1.2),
      speed: variant === 'lightning' ? 6.5 : variant === 'water' ? 3.2 : 2.5,
      decay: 0.982,
      color
    });

    // Limit active ripples to prevent frame drops
    if (ripplesRef.current.length > 25) {
      ripplesRef.current.shift();
    }
  }, [variant]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isVisible) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      initParticles(width, height, variant);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Initial ripples
    createRipple(width * 0.5, height * 0.45, 1.5);
    createRipple(width * 0.3, height * 0.6, 0.9);

    const render = () => {
      timeRef.current += 0.018;
      const t = timeRef.current;

      ctx.clearRect(0, 0, width, height);

      // 1. BASE ELEMENTAL AMBIENT GRADIENT & CAUSTICS
      const grad = ctx.createRadialGradient(
        width * 0.5 + Math.sin(t * 0.5) * 80,
        height * 0.4 + Math.cos(t * 0.4) * 60,
        10,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.75
      );

      if (variant === 'water') {
        // Cyan-Deep Indigo Water Realm
        grad.addColorStop(0, 'rgba(6, 182, 212, 0.09)');
        grad.addColorStop(0.35, 'rgba(14, 165, 233, 0.05)');
        grad.addColorStop(0.7, 'rgba(99, 102, 241, 0.03)');
        grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      } else if (variant === 'lightning') {
        // Electric Indigo Realm
        grad.addColorStop(0, 'rgba(99, 102, 241, 0.12)');
        grad.addColorStop(0.4, 'rgba(168, 85, 247, 0.06)');
        grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      } else if (variant === 'fire') {
        // Plasma Fire Heat-Haze Realm
        grad.addColorStop(0, 'rgba(249, 115, 22, 0.11)');
        grad.addColorStop(0.5, 'rgba(239, 68, 68, 0.05)');
        grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      } else {
        // Dew Condensation Realm
        grad.addColorStop(0, 'rgba(148, 163, 184, 0.08)');
        grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.03)');
        grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      }

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. REFRACTED BACKGROUND CAUSTIC LINES / WAVES
      if (variant === 'water' || variant === 'condensation') {
        ctx.save();
        ctx.lineWidth = 1.2;
        for (let j = 0; j < 3; j++) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(6, 182, 212, ${0.03 + j * 0.015})`;
          for (let x = 0; x <= width; x += 25) {
            const waveY = (height * 0.35) + 
                          Math.sin(x * 0.008 + t * 1.5 + j * 1.8) * 22 + 
                          Math.cos(x * 0.015 - t * 0.9) * 14;
            if (x === 0) ctx.moveTo(x, waveY);
            else ctx.lineTo(x, waveY);
          }
          ctx.stroke();
        }
        ctx.restore();
      }

      // 3. REFRACTED UNDERWATER SHIELD EMBLEM (OpenAI / Aegis elemental mark)
      const centerX = width * 0.5;
      const centerY = height * 0.38;
      const markSize = Math.min(width, height) * 0.18;

      ctx.save();
      ctx.translate(centerX, centerY);

      // Refractive ripple displacement on mark center
      let displaceX = 0;
      let displaceY = 0;
      for (const r of ripplesRef.current) {
        const dx = centerX - r.x;
        const dy = centerY - r.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (Math.abs(dist - r.radius) < 35) {
          const force = ((35 - Math.abs(dist - r.radius)) / 35) * r.amplitude * 4;
          displaceX += (dx / (dist || 1)) * force;
          displaceY += (dy / (dist || 1)) * force;
        }
      }
      ctx.translate(displaceX, displaceY);

      // Draw Aegis / Elemental Shield Geometry
      ctx.beginPath();
      const shieldH = markSize * 1.2;
      const shieldW = markSize * 0.9;
      ctx.moveTo(0, -shieldH * 0.5);
      ctx.lineTo(shieldW * 0.5, -shieldH * 0.3);
      ctx.quadraticCurveTo(shieldW * 0.5, shieldH * 0.2, 0, shieldH * 0.55);
      ctx.quadraticCurveTo(-shieldW * 0.5, shieldH * 0.2, -shieldW * 0.5, -shieldH * 0.3);
      ctx.closePath();

      // Shield Gradient
      const shieldGrad = ctx.createLinearGradient(-shieldW * 0.5, -shieldH * 0.5, shieldW * 0.5, shieldH * 0.5);
      if (variant === 'water') {
        shieldGrad.addColorStop(0, 'rgba(6, 182, 212, 0.16)');
        shieldGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.08)');
        shieldGrad.addColorStop(1, 'rgba(99, 102, 241, 0.14)');
      } else if (variant === 'lightning') {
        shieldGrad.addColorStop(0, 'rgba(99, 102, 241, 0.22)');
        shieldGrad.addColorStop(1, 'rgba(168, 85, 247, 0.12)');
      } else if (variant === 'fire') {
        shieldGrad.addColorStop(0, 'rgba(249, 115, 22, 0.22)');
        shieldGrad.addColorStop(1, 'rgba(239, 68, 68, 0.12)');
      } else {
        shieldGrad.addColorStop(0, 'rgba(148, 163, 184, 0.15)');
        shieldGrad.addColorStop(1, 'rgba(56, 189, 248, 0.08)');
      }

      ctx.fillStyle = shieldGrad;
      ctx.fill();

      ctx.lineWidth = 2.0;
      ctx.strokeStyle = variant === 'water' ? 'rgba(6, 182, 212, 0.35)' : variant === 'lightning' ? 'rgba(99, 102, 241, 0.45)' : 'rgba(249, 115, 22, 0.4)';
      ctx.stroke();

      // Inner Cyber Core Rings
      for (let k = 1; k <= 3; k++) {
        ctx.beginPath();
        const rad = (markSize * 0.24) * k * 0.5;
        ctx.arc(0, -shieldH * 0.04, rad, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 + Math.sin(t * 2 + k) * 0.04})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.restore();

      // 4. DRAW & UPDATE POINTER-DRIVEN CIRCULAR RIPPLES
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const r = ripplesRef.current[i];
        r.radius += r.speed;
        r.amplitude *= r.decay;

        if (r.radius >= r.maxRadius || r.amplitude < 0.02) {
          ripplesRef.current.splice(i, 1);
          continue;
        }

        // Draw multiple nested wavefront rings
        for (let ring = 0; ring < 3; ring++) {
          const ringRad = r.radius - ring * 12;
          if (ringRad <= 0) continue;

          ctx.beginPath();
          ctx.arc(r.x, r.y, ringRad, 0, Math.PI * 2);

          const alpha = (1 - ringRad / r.maxRadius) * r.amplitude * (0.35 - ring * 0.08);
          if (variant === 'water') {
            ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
          } else if (variant === 'lightning') {
            ctx.strokeStyle = `rgba(129, 140, 248, ${alpha * 1.3})`;
          } else if (variant === 'fire') {
            ctx.strokeStyle = `rgba(251, 146, 60, ${alpha})`;
          } else {
            ctx.strokeStyle = `rgba(203, 213, 225, ${alpha * 1.2})`;
          }

          ctx.lineWidth = Math.max(1, 2.5 * r.amplitude * (1 - ringRad / r.maxRadius));
          ctx.stroke();
        }
      }

      // 5. DRAW & UPDATE SUSPENDED BIOLUMINESCENT PARTICLES
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Pulse alpha
        p.alpha = p.baseAlpha + Math.sin(t * p.pulseSpeed * 60 + p.pulseOffset) * 0.25;

        // Push away from active mouse cursor
        const mdx = p.x - mouseRef.current.x;
        const mdy = p.y - mouseRef.current.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 90) {
          const push = ((90 - mdist) / 90) * 2;
          p.x += (mdx / (mdist || 1)) * push;
          p.y += (mdy / (mdist || 1)) * push;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 85%, 65%, ${Math.max(0.05, p.alpha)})`;
        ctx.fill();

        // Particle soft ambient glow halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, ${Math.max(0.01, p.alpha * 0.18)})`;
        ctx.fill();
      }

      // 6. LIGHTNING ARCS IF VARIANT IS LIGHTNING
      if (variant === 'lightning' && Math.random() < 0.06) {
        ctx.save();
        ctx.strokeStyle = 'rgba(199, 210, 254, 0.7)';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = '#818cf8';
        ctx.shadowBlur = 12;

        let startX = Math.random() * width;
        let startY = 0;
        ctx.beginPath();
        ctx.moveTo(startX, startY);

        for (let step = 0; step < 7; step++) {
          startX += (Math.random() - 0.5) * 70;
          startY += height / 7;
          ctx.lineTo(startX, startY);
        }
        ctx.stroke();
        ctx.restore();
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [variant, isVisible, particleCount, createRipple, initParticles]);

  // Pointer Interaction Handlers
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - mouseRef.current.lastX;
    const dy = y - mouseRef.current.lastY;
    const speed = Math.sqrt(dx * dx + dy * dy);

    mouseRef.current.vx = dx;
    mouseRef.current.vy = dy;
    mouseRef.current.x = x;
    mouseRef.current.y = y;
    mouseRef.current.lastX = x;
    mouseRef.current.lastY = y;

    // Trigger subtle ripple upon movement threshold
    if (speed > 18 && Math.random() < 0.28) {
      createRipple(x, y, Math.min(1.4, speed * 0.035));
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseRef.current.isDown = true;
    createRipple(x, y, 1.8);
  };

  const handlePointerUp = () => {
    mouseRef.current.isDown = false;
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className={`fixed inset-0 pointer-events-auto z-0 overflow-hidden ${className}`}
      style={{ opacity: overlayOpacity }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />

      {/* Floating ThreeUI Elemental Control Deck */}
      {showControls && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end space-y-2 pointer-events-auto select-none">
          {isExpanded && (
            <div className="glass-card rounded-2xl p-3.5 border border-slate-200/90 shadow-xl space-y-3 backdrop-blur-xl bg-white/90 animate-fade-in text-slate-800 w-64">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-1.5 text-xs font-black text-slate-900">
                  <Droplets className="h-4 w-4 text-cyan-600" />
                  <span>Elements</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setIsVisible(!isVisible)}
                    className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                    title={isVisible ? "Hide Background" : "Show Background"}
                  >
                    {isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5 text-rose-500" />}
                  </button>
                  <span className="text-4xs font-mono font-bold bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded border border-cyan-150 uppercase">
                    WebGL2
                  </span>
                </div>
              </div>

              {/* Elemental Variants Picker */}
              <div>
                <label className="text-4xs font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Select Elemental Realm
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setVariant('water')}
                    className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-3xs font-bold transition-all ${
                      variant === 'water'
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Droplets className="h-3 w-3" />
                    <span>Water (Cyan)</span>
                  </button>

                  <button
                    onClick={() => setVariant('lightning')}
                    className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-3xs font-bold transition-all ${
                      variant === 'lightning'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Zap className="h-3 w-3" />
                    <span>Lightning</span>
                  </button>

                  <button
                    onClick={() => setVariant('fire')}
                    className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-3xs font-bold transition-all ${
                      variant === 'fire'
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Flame className="h-3 w-3" />
                    <span>Fire (Plasma)</span>
                  </button>

                  <button
                    onClick={() => setVariant('condensation')}
                    className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-3xs font-bold transition-all ${
                      variant === 'condensation'
                        ? 'bg-slate-700 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <CloudRain className="h-3 w-3" />
                    <span>Condensation</span>
                  </button>
                </div>
              </div>

              {/* Particle Density Control */}
              <div className="pt-1">
                <div className="flex justify-between text-4xs font-bold text-slate-500 mb-1">
                  <span>Suspended Motes</span>
                  <span className="font-mono">{particleCount}</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={90}
                  value={particleCount}
                  onChange={(e) => setParticleCount(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                />
              </div>

              <div className="text-4xs text-slate-400 text-center font-mono pt-1">
                Move pointer or click to propagate ripples
              </div>
            </div>
          )}

          {/* Trigger Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-2xl glass-card border border-slate-200/90 shadow-md hover:shadow-lg transition-all text-xs font-bold text-slate-700 hover:text-cyan-600 active:scale-95 bg-white/90"
            title="Elemental Water Background Settings"
          >
            <Droplets className="h-4 w-4 text-cyan-600 animate-pulse" />
            <span className="hidden sm:inline">Water Background</span>
            <Sliders className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ElementsCollection;
