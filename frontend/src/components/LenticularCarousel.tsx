import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Server, 
  ShieldCheck, 
  ShieldAlert, 
  FileCode, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Layers
} from 'lucide-react';
import './LenticularCarousel.css';

export interface DeviceRecord {
  id: string;
  hostname: string;
  vendor: string;
  model: string;
  os_version: string;
  ip_address: string;
  compliance_score: number;
  passed_rules_count: number;
  failed_rules_count: number;
  timestamp: string;
  report_pdf_path?: string;
  details?: any;
}

export interface LenticularCarouselProps {
  items: DeviceRecord[];
  onViewDetails?: (device: DeviceRecord) => void;
  onDownloadPdf?: (device: DeviceRecord) => void;
  getScoreBadge?: (score: number) => {
    bg: string;
    dot: string;
    label: string;
    ring: string;
    textColor: string;
    barBg: string;
  };
  getVendorBadgeColor?: (vendor: string) => string;
  className?: string;
}

export const LenticularCarousel: React.FC<LenticularCarouselProps> = ({
  items,
  onViewDetails,
  onDownloadPdf,
  getScoreBadge = (score) => ({
    bg: score >= 80 ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30' : 'text-amber-400 bg-amber-950/60 border-amber-500/30',
    dot: score >= 80 ? 'bg-emerald-400' : 'bg-amber-400',
    label: score >= 80 ? 'Optimal Compliance' : 'Review Required',
    ring: score >= 80 ? '#10b981' : '#f59e0b',
    textColor: score >= 80 ? 'text-emerald-400' : 'text-amber-400',
    barBg: score >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
  }),
  getVendorBadgeColor = (vendor) => {
    const v = vendor.toLowerCase();
    if (v.includes('cisco')) return 'bg-sky-950/70 text-sky-300 border-sky-500/30';
    if (v.includes('juniper')) return 'bg-purple-950/70 text-purple-300 border-purple-500/30';
    if (v.includes('palo')) return 'bg-orange-950/70 text-orange-300 border-orange-500/30';
    return 'bg-slate-900 text-slate-300 border-slate-700';
  },
  className = ''
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const total = items.length;

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (total === 0) return;
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (total === 0) return;
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  // ⏱️ Auto-Play: Automatically change tab once every 4.5 seconds
  // Resets timer instantly when the user manually changes the active tab
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (total <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 7500);

    return () => clearInterval(interval);
  }, [total, isHovered, activeIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  // Smooth DOM-based mouse tilt (NO React re-renders)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8; // -4 to +4 deg
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8; // +4 to -4 deg
    stage.style.setProperty('--card-tilt-x', `${y.toFixed(2)}deg`);
    stage.style.setProperty('--card-tilt-y', `${x.toFixed(2)}deg`);
    stage.style.setProperty('--shimmer-x', `${(x * 2.5).toFixed(1)}%`);
    stage.style.setProperty('--shimmer-y', `${(y * 2.5).toFixed(1)}%`);
  };

  const handleStageMouseLeave = () => {
    setIsHovered(false);
    const stage = stageRef.current;
    if (!stage) return;
    stage.style.setProperty('--card-tilt-x', '0deg');
    stage.style.setProperty('--card-tilt-y', '0deg');
    stage.style.setProperty('--shimmer-x', '0%');
    stage.style.setProperty('--shimmer-y', '0%');
  };

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400 bg-slate-950/80 rounded-2xl border border-slate-800">
        <Server className="h-10 w-10 mx-auto text-slate-500 mb-3" />
        <p>No audited hardware asset dossiers matching current filter criteria.</p>
      </div>
    );
  }

  return (
    <div 
      className={`lenticular-carousel-wrapper ${className}`} 
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleStageMouseLeave}
    >
      {/* 1. Header Toolbar with Blade Navigation Index & Auto-Play Status */}
      <div className="flex items-center justify-between px-2 mb-6 relative z-30 pointer-events-auto">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-sky-950/80 border border-sky-500/30 text-sky-400">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-sky-400">
                LENTICULAR HOLOGRAPHIC STAGE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Auto-Cycle 7.5s</span>
              </span>
            </div>
            <div className="text-xs text-slate-300 font-semibold mt-0.5">
              Asset Dossier <span className="text-white font-mono">{activeIndex + 1}</span> of <span className="text-white font-mono">{total}</span>
            </div>
          </div>
        </div>

        {/* Previous & Next Control Chevrons */}
        <div className="flex items-center space-x-2 relative z-30">
          <button
            type="button"
            onClick={(e) => handlePrev(e)}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 hover:border-sky-500/50 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
            aria-label="Previous Dossier"
          >
            <ChevronLeft className="h-4 w-4 pointer-events-none" />
          </button>
          <button
            type="button"
            onClick={(e) => handleNext(e)}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 hover:border-sky-500/50 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
            aria-label="Next Dossier"
          >
            <ChevronRight className="h-4 w-4 pointer-events-none" />
          </button>
        </div>
      </div>

      {/* 2. 3D Lenticular Perspective Stage */}
      <div 
        ref={stageRef}
        className="lenticular-stage"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleStageMouseLeave}
      >
        <div className="lenticular-track">
          {items.map((device, index) => {
            // Calculate distance offset relative to active index
            let offset = index - activeIndex;
            if (offset < -Math.floor(total / 2)) offset += total;
            if (offset > Math.floor(total / 2)) offset -= total;

            const isCenter = offset === 0;
            const isVisible = Math.abs(offset) <= 2;

            if (!isVisible) return null;

            const badge = getScoreBadge(device.compliance_score);
            const vendorClass = getVendorBadgeColor(device.vendor);

            // Compute dynamic 3D Lenticular Flip Transform (Pure 3D Perspective)
            const translateX = offset * 280; // Spread distance
            const translateZ = -Math.abs(offset) * 125; // Push back in 3D Z-plane
            const rotateY = isCenter ? 0 : offset * -18; // Soft, elegant curve
            const scale = isCenter ? 1 : Math.max(0.85, 0.94 - Math.abs(offset) * 0.04);
            const opacity = isCenter ? 1 : Math.max(0.3, 0.72 - Math.abs(offset) * 0.2);
            const zIndex = 20 - Math.abs(offset);

            return (
              <div
                key={device.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isCenter) {
                    setActiveIndex(index);
                  }
                }}
                className={`lenticular-card-container ${isCenter ? 'is-active' : 'is-flanking'}`}
                style={{
                  transform: isCenter 
                    ? `translateX(0px) translateZ(0px) scale(1) rotateY(var(--card-tilt-y, 0deg)) rotateX(var(--card-tilt-x, 0deg))`
                    : `translateX(${translateX}px) translateZ(${translateZ}px) scale(${scale}) rotateY(${rotateY}deg)`,
                  opacity,
                  zIndex
                }}
              >
                {/* 🌟 Lenticular Card Surface */}
                <div className="lenticular-card-surface flashy-card-gradient">
                  {/* Lenticular Holographic Sheen Layer */}
                  <div 
                    className="lenticular-shimmer"
                    style={{
                      transform: isCenter ? 'translateX(var(--shimmer-x, 0%)) translateY(var(--shimmer-y, 0%))' : undefined
                    }}
                  />

                  {/* Laser Accent Top Border */}
                  <div className="lenticular-laser-top" />

                  {/* Card Content Header */}
                  <div className="p-5 pb-4 space-y-3 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-slate-950 text-sky-400 rounded-lg border border-sky-500/30">
                          <Server className="h-4 w-4" />
                        </div>
                        <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-md border ${vendorClass}`}>
                          {device.vendor}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-white tracking-tight flex items-center space-x-1.5">
                        <span>{device.hostname}</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono flex items-center space-x-1.5 mt-0.5">
                        <span>IP: {device.ip_address || '192.168.1.1'}</span>
                        <span>•</span>
                        <span>{device.model || 'Enterprise Chassis'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Compliance Score Gauge Deck */}
                  <div className="px-5 py-3.5 bg-slate-950/90 border-y border-slate-800/80 relative z-10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-300">CIS Benchmark Score</span>
                      <span className={`text-xl font-extrabold font-mono ${badge.textColor}`}>
                        {device.compliance_score}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full ${badge.barBg} transition-all duration-500 rounded-full shadow-sm`}
                        style={{ width: `${device.compliance_score}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center space-x-2">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <div>
                          <div className="text-[10px] text-slate-400 font-mono">Passed</div>
                          <div className="text-xs font-bold text-emerald-300 font-mono">{device.passed_rules_count}</div>
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-500/30 flex items-center space-x-2">
                        <ShieldAlert className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                        <div>
                          <div className="text-[10px] text-slate-400 font-mono">Deviations</div>
                          <div className="text-xs font-bold text-rose-300 font-mono">{device.failed_rules_count}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metadata & Quick Action Footer */}
                  <div className="p-5 pt-3 relative z-10 space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>OS: {device.os_version || 'Production Firmware'}</span>
                      <span>Audit: Just now</span>
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      {onViewDetails && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onViewDetails(device);
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-sky-950/90 hover:bg-sky-900 text-sky-200 text-xs font-bold border border-sky-500/50 hover:border-sky-400 shadow-sm flex items-center justify-center space-x-1.5 transition-all cursor-pointer relative z-20"
                        >
                          <FileCode className="h-3.5 w-3.5" />
                          <span>Audit Rules</span>
                        </button>
                      )}

                      {onDownloadPdf && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onDownloadPdf(device);
                          }}
                          className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 hover:border-sky-500/40 shadow-sm transition-all cursor-pointer relative z-20"
                          title="Download Cryptographic PDF Dossier"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Pagination Dots Selector */}
      <div className="flex items-center justify-center space-x-2 mt-8 relative z-30 pointer-events-auto">
        {items.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveIndex(idx);
            }}
            className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              idx === activeIndex 
                ? 'w-8 bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.9)]' 
                : 'w-2.5 bg-slate-700 hover:bg-slate-500'
            }`}
            aria-label={`Jump to blade ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default LenticularCarousel;
