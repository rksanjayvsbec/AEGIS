import React, { useState, useEffect } from 'react';
import './NeonReveal.css';

export interface NeonRevealProps {
  text?: string;
  subtext?: string;
  children?: React.ReactNode;
  colorHue?: number; // default 260 (Neon Violet / Purple from screenshot)
  revealDelay?: number; // ms
  revealDuration?: number; // ms
  expandFrom?: 'center' | 'left' | 'right';
  direction?: 'horizontal' | 'vertical';
  barWidth?: number;
  barHeight?: number;
  verticalOffset?: number;
  mirrored?: boolean;
  fullscreen?: boolean;
  className?: string;
  onComplete?: () => void;
}

export const NeonReveal: React.FC<NeonRevealProps> = ({
  text = 'AEGIS',
  subtext = 'AUTONOMOUS ZERO-TRUST DEFENSE SYSTEM',
  children,
  colorHue = 265, // Authentic React Bits Pro Purple Hue (260-270)
  revealDelay = 300,
  revealDuration = 2500,
  expandFrom = 'center',
  barWidth = 1.0,
  barHeight = 0.02,
  mirrored = false,
  fullscreen = false,
  className = '',
  onComplete
}) => {
  const [isLit, setIsLit] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLit(true);
      if (onComplete) {
        setTimeout(onComplete, revealDuration + 400);
      }
    }, revealDelay);

    return () => clearTimeout(timer);
  }, [revealDelay, revealDuration, onComplete]);

  return (
    <div 
      className={`pro-neon-reveal-stage ${fullscreen ? 'is-fullscreen' : ''} ${className}`}
      style={{
        '--neon-hue': colorHue,
        '--neon-color': `hsl(${colorHue}, 100%, 75%)`,
        '--neon-color-deep': `hsl(${colorHue}, 90%, 55%)`,
        '--neon-color-dark': `hsl(${colorHue}, 80%, 20%)`,
        '--duration': `${revealDuration}ms`,
        '--bar-scale': barWidth,
        '--bar-h': `${barHeight * 100}%`
      } as React.CSSProperties}
    >
      {/* 🔮 SVG Noise Filter for Photorealistic Film Grain Light Scattering */}
      <svg className="pro-neon-noise-filter" aria-hidden="true">
        <filter id="neon-grain-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.35" />
          </feComponentTransfer>
        </filter>
      </svg>

      {/* 1. Top Emitter: Realistic Glowing Neon Bar Tube */}
      <div className={`pro-neon-top-bar-container expand-${expandFrom} ${isLit ? 'is-active' : ''}`}>
        <div className="pro-neon-bar-tube">
          <div className="pro-neon-bar-core" />
          <div className="pro-neon-bar-halo" />
          <div className="pro-neon-bar-flares" />
        </div>
      </div>

      {/* 2. Downward Volumetric Conical Light Beam (Grainy Light Fan from Screenshot) */}
      <div className={`pro-neon-light-fan ${isLit ? 'is-active' : ''}`}>
        {/* Soft Volumetric Gradient Wash */}
        <div className="pro-neon-cone-gradient" />
        
        {/* Grain Stipple Scatter Layer */}
        <div className="pro-neon-cone-grain" />

        {/* Dynamic Light Rays */}
        <div className="pro-neon-light-rays" />
      </div>

      {/* 3. Mirrored Bottom Emitter (if enabled) */}
      {mirrored && (
        <div className={`pro-neon-bottom-bar-container expand-${expandFrom} ${isLit ? 'is-active' : ''}`}>
          <div className="pro-neon-bar-tube">
            <div className="pro-neon-bar-core" />
            <div className="pro-neon-bar-halo" />
          </div>
          <div className="pro-neon-light-fan mirrored">
            <div className="pro-neon-cone-gradient" />
          </div>
        </div>
      )}

      {/* 4. Center Typography & Illuminated Silhouette Content */}
      <div className={`pro-neon-content-layer ${isLit ? 'is-illuminated' : ''}`}>
        {children ? (
          children
        ) : (
          <div className="pro-neon-default-text-block">
            <h1 className="pro-neon-title font-black tracking-tight select-none">
              {text}
            </h1>
            {subtext && (
              <p className="pro-neon-subtext font-mono font-bold tracking-widest uppercase mt-2">
                {subtext}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 5. Ambient Vignette Overlay */}
      <div className="pro-neon-vignette" />
    </div>
  );
};

export default NeonReveal;
