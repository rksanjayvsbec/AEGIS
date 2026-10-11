import React, { useRef } from 'react';
import LaserFlow from './LaserFlow';
import { 
  Terminal, 
  Zap, 
  Lock
} from 'lucide-react';

export interface LaserFlowShowcaseProps {
  color?: string;
  className?: string;
}

export const LaserFlowShowcase: React.FC<LaserFlowShowcaseProps> = ({
  color = '#FF79C6',
  className = ''
}) => {
  const revealImgRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const el = revealImgRef.current;
    if (el) {
      el.style.setProperty('--mx', `${x}px`);
      el.style.setProperty('--my', `${y + rect.height * 0.5}px`);
    }
  };

  const handleMouseLeave = () => {
    const el = revealImgRef.current;
    if (el) {
      el.style.setProperty('--mx', '-9999px');
      el.style.setProperty('--my', '-9999px');
    }
  };

  return (
    <div 
      className={`relative w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-800 ${className}`}
      style={{ 
        minHeight: '560px', 
        position: 'relative', 
        overflow: 'hidden',
        backgroundColor: '#120F17'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* ⚡ GLSL WebGL Laser Flow Beam */}
      <LaserFlow
        horizontalBeamOffset={0.1}
        verticalBeamOffset={0.0}
        color={color}
        horizontalSizing={1.19}
        wispDensity={2.3}
        wispIntensity={16.9}
        flowSpeed={0.55}
        flowStrength={0.19}
        fogIntensity={0.99}
        fogScale={0.26}
        fogFallSpeed={1.22}
        decay={1.52}
        falloffStart={1.1}
      />
      
      {/* 🌟 Interactive Content Box */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] sm:w-[86%] py-8 px-6 sm:px-10 rounded-2xl flex flex-col items-center justify-center text-center z-20 backdrop-blur-xl shadow-[0_0_50px_rgba(255,121,198,0.25)]"
        style={{
          backgroundColor: 'rgba(18, 15, 23, 0.88)',
          border: `2px solid ${color}`,
        }}
      >
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-pink-950/80 border border-pink-500/40 text-pink-300 text-xs font-mono font-bold mb-4 shadow-sm">
          <span>🕵️‍♂️</span>
          <span>REAL-TIME FORENSIC SYNTAX DETECTIVE</span>
        </div>

        {/* Headline */}
        <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-3 max-w-2xl leading-tight">
          Decode Every Clue. Solve Every Anomaly. Uncover Network Truth.
        </h2>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mb-6 leading-relaxed">
          Like a high-precision forensic laser, our real-time engine traces configuration fingerprints, identifies hidden vulnerabilities, and solves compliance mysteries in milliseconds.
        </p>

        {/* Feature Grid Inside Laser Box */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full max-w-2xl mb-6 text-left">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-pink-500/30 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-pink-950 text-pink-400 border border-pink-500/40">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Instant Clue Scanner</div>
              <div className="text-[10px] text-slate-400 font-mono">0.42ms Forensic Parser</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-pink-500/30 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-pink-950 text-pink-400 border border-pink-500/40">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Zero-Trust Shield</div>
              <div className="text-[10px] text-slate-400 font-mono">100% Case Protection</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-pink-500/30 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-pink-950 text-pink-400 border border-pink-500/40">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">AI Detective Brain</div>
              <div className="text-[10px] text-slate-400 font-mono">Autonomous Pattern Solver</div>
            </div>
          </div>
        </div>

        {/* Quick Tags */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-[11px] font-mono font-semibold px-3 py-1 rounded-lg bg-slate-900 text-pink-300 border border-pink-500/30">
            🔍 Cisco IOS-XE Clues
          </span>
          <span className="text-[11px] font-mono font-semibold px-3 py-1 rounded-lg bg-slate-900 text-pink-300 border border-pink-500/30">
            📁 Juniper JunOS Evidence
          </span>
          <span className="text-[11px] font-mono font-semibold px-3 py-1 rounded-lg bg-slate-900 text-pink-300 border border-pink-500/30">
            🛡️ Palo Alto PAN-OS Dossier
          </span>
        </div>
      </div>

      {/* 🎭 Interactive Reveal Masking Layer */}
      <div
        ref={revealImgRef}
        className="absolute inset-0 z-10 pointer-events-none opacity-40 mix-blend-lighten"
        style={{
          background: 'radial-gradient(circle, rgba(255,121,198,0.3) 0%, rgba(99,102,241,0.15) 50%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at var(--mx, -9999px) var(--my, -9999px), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 60px, rgba(255,255,255,0.6) 120px, rgba(255,255,255,0.25) 180px, rgba(255,255,255,0) 240px)',
          maskImage: 'radial-gradient(circle at var(--mx, -9999px) var(--my, -9999px), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 60px, rgba(255,255,255,0.6) 120px, rgba(255,255,255,0.25) 180px, rgba(255,255,255,0) 240px)',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat'
        }}
      />
    </div>
  );
};

export default LaserFlowShowcase;
