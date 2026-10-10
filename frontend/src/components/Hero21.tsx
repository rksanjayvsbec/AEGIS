import React, { useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Volume2, 
  Sparkles, 
  Radio, 
  Cpu, 
  Lock, 
  Terminal,
  FileCheck,
  RefreshCw
} from 'lucide-react';
import StarBurst from './StarBurst';
import './Hero21.css';

export interface Hero21Props {
  badgeText?: string;
  title?: string;
  titleGradient?: string;
  description?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  diagnosticButtonText?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  onDiagnosticAction?: () => void;
  radarScanning?: boolean;
  tags?: { label: string; icon?: React.ElementType }[];
  isSpeaking?: boolean;
  className?: string;
}

const DEFAULT_TAGS = [
  { label: 'CIS Benchmark v8', icon: ShieldCheck },
  { label: 'NIST SP 800-53 R5', icon: Lock },
  { label: 'DISA STIG Defense', icon: FileCheck },
  { label: 'Multi-Vendor AST Engine', icon: Cpu },
  { label: 'Offline NLP Heuristics', icon: Terminal }
];

export const Hero21: React.FC<Hero21Props> = ({
  badgeText = 'AEGIS AUTONOMOUS DEFENSE RADAR',
  title = 'Enterprise Network Security & Multi-Vendor Compliance Intelligence',
  titleGradient = 'from-white via-sky-100 to-sky-300',
  description = 'Continuous zero-trust posture auditing, dynamic AST syntax tokenization, and air-gapped NLP heuristic learning across Cisco, Juniper, Palo Alto, and Arista infrastructures.',
  primaryButtonText = "Let's Get Started",
  secondaryButtonText = 'Executive Audio Briefing',
  diagnosticButtonText = 'Perimeter Diagnostics',
  onPrimaryAction,
  onSecondaryAction,
  onDiagnosticAction,
  radarScanning = false,
  tags = DEFAULT_TAGS,
  isSpeaking = false,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // GLSL Aurora Fluid Shader Animation Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 480);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Deep space backdrop
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // Multiple flowing GLSL-like Aurora wave ribbons
      const waveCount = 4;
      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        const baseOffsetY = height * (0.35 + w * 0.15);
        const amp = 45 + w * 15;
        const freq = 0.003 + w * 0.001;

        ctx.moveTo(0, height);
        ctx.lineTo(0, baseOffsetY);

        for (let x = 0; x <= width; x += 15) {
          const y = baseOffsetY + 
            Math.sin(x * freq + time + w * 1.5) * amp + 
            Math.cos(x * freq * 0.5 - time * 0.8) * (amp * 0.5);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        const auroraGrad = ctx.createLinearGradient(0, baseOffsetY - amp, width, height);
        if (w === 0) {
          auroraGrad.addColorStop(0, 'rgba(56, 189, 248, 0.28)'); // Cyan
          auroraGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.18)'); // Indigo
          auroraGrad.addColorStop(1, 'rgba(6, 10, 20, 0)');
        } else if (w === 1) {
          auroraGrad.addColorStop(0, 'rgba(192, 132, 252, 0.25)'); // Purple
          auroraGrad.addColorStop(0.6, 'rgba(14, 165, 233, 0.15)'); // Sky
          auroraGrad.addColorStop(1, 'rgba(6, 10, 20, 0)');
        } else if (w === 2) {
          auroraGrad.addColorStop(0, 'rgba(52, 211, 153, 0.22)'); // Emerald
          auroraGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.12)'); // Cyan
          auroraGrad.addColorStop(1, 'rgba(6, 10, 20, 0)');
        } else {
          auroraGrad.addColorStop(0, 'rgba(232, 121, 249, 0.18)'); // Fuchsia
          auroraGrad.addColorStop(0.7, 'rgba(99, 102, 241, 0.08)');
          auroraGrad.addColorStop(1, 'rgba(6, 10, 20, 0)');
        }

        ctx.fillStyle = auroraGrad;
        ctx.fill();
      }

      // Atmospheric glowing ambient light focal center
      const centerGlow = ctx.createRadialGradient(
        width / 2, height * 0.3, 0,
        width / 2, height * 0.3, width * 0.45
      );
      centerGlow.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
      centerGlow.addColorStop(0.3, 'rgba(168, 85, 247, 0.12)');
      centerGlow.addColorStop(0.7, 'rgba(6, 10, 20, 0.05)');
      centerGlow.addColorStop(1, 'transparent');

      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, width, height);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={`hero-21-container ${className}`}>
      {/* 1. Fluid GLSL Aurora Canvas Background */}
      <canvas 
        ref={canvasRef} 
        className="hero-21-canvas" 
      />

      {/* Grid Overlay Matrix */}
      <div className="hero-21-grid-overlay" />

      {/* 2. Main Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 sm:py-16 flex flex-col items-center text-center space-y-7">
        
        {/* 🌟 Luminous Orb Mark */}
        <div className="relative flex items-center justify-center">
          {/* Outer Pulsing Aura */}
          <div className="hero-21-orb-aura" />
          <div className="hero-21-orb-ring-1" />
          <div className="hero-21-orb-ring-2" />
          
          {/* Luminous Center Orb Sphere */}
          <div className="hero-21-orb-core">
            <ShieldCheck className="h-9 w-9 text-sky-300 drop-shadow-[0_0_12px_rgba(56,189,248,0.9)]" />
          </div>
        </div>

        {/* 🔖 Theme-Aware Badge Pill */}
        <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-slate-950/80 border border-sky-500/40 shadow-[0_0_20px_rgba(56,189,248,0.25)] backdrop-blur-md">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400"></span>
          </span>
          <span className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-sky-300">
            {badgeText}
          </span>
          <Sparkles className="h-3 w-3 text-sky-400" />
        </div>

        {/* 📢 Headline Typography */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white max-w-4xl leading-[1.15]">
          <span className={`bg-gradient-to-r ${titleGradient} bg-clip-text text-transparent`}>
            {title}
          </span>
        </h1>

        {/* 📝 Subtitle Description */}
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-normal">
          {description}
        </p>

        {/* ⚡ Interactive Call to Action Group */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {/* Primary Action Button */}
          <button
            onClick={onPrimaryAction}
            className="group px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-sm sm:text-base border border-sky-400/80 shadow-[0_0_35px_rgba(56,189,248,0.5)] hover:shadow-[0_0_55px_rgba(56,189,248,0.85)] hover:scale-105 transition-all duration-300 flex items-center space-x-2.5 cursor-pointer backdrop-blur-xl"
          >
            <span className="font-mono text-sky-200 text-base">[</span>
            <span>{primaryButtonText}</span>
            <span className="font-mono text-sky-200 text-base">]</span>
            <ArrowRight className="h-4 w-4 text-sky-200 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Secondary Audio Briefing Button */}
          <button
            onClick={onSecondaryAction}
            className={`px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center space-x-2.5 transition-all duration-300 cursor-pointer border backdrop-blur-xl shadow-md ${
              isSpeaking 
                ? 'bg-rose-950/80 text-rose-300 border-rose-500/60 shadow-[0_0_25px_rgba(244,63,94,0.4)]' 
                : 'bg-slate-950/70 hover:bg-slate-900 text-slate-200 hover:text-white border-slate-700/80 hover:border-sky-500/40 hover:shadow-[0_0_25px_rgba(56,189,248,0.2)]'
            }`}
          >
            <Volume2 className={`h-4 w-4 ${isSpeaking ? 'text-rose-400 animate-pulse' : 'text-sky-400'}`} />
            <span>{isSpeaking ? 'Mute Briefing' : secondaryButtonText}</span>
          </button>

          {/* Tertiary Perimeter Diagnostics Trigger */}
          {onDiagnosticAction && (
            <StarBurst particleCount={24} starCount={12} radius={110} speed={4.5} colors={['#38bdf8', '#0284c7', '#6366f1', '#facc15', '#ffffff']}>
              <button
                onClick={onDiagnosticAction}
                disabled={radarScanning}
                className="px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center space-x-2.5 transition-all duration-300 cursor-pointer border border-emerald-500/40 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 hover:text-white shadow-[0_0_25px_rgba(52,211,153,0.25)] hover:shadow-[0_0_35px_rgba(52,211,153,0.45)] hover:scale-105"
              >
                <RefreshCw className={`h-4 w-4 text-emerald-400 ${radarScanning ? 'animate-spin' : ''}`} />
                <span>{radarScanning ? 'Scanning Perimeter...' : diagnosticButtonText}</span>
              </button>
            </StarBurst>
          )}
        </div>

        {/* 🏷️ Ambient Action Labels & Trust Tags */}
        <div className="pt-6 border-t border-slate-800/80 w-full flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {tags.map((tag, idx) => {
            const TagIcon = tag.icon || Radio;
            return (
              <div 
                key={idx}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800/90 text-slate-300 text-xs font-mono font-semibold transition-all hover:border-sky-500/40 hover:text-sky-300 shadow-xs"
              >
                <TagIcon className="h-3.5 w-3.5 text-sky-400" />
                <span>{tag.label}</span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default Hero21;
