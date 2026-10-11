import React from 'react';

export interface CyberGridBackgroundProps {
  className?: string;
  gridSize?: number;
  showDots?: boolean;
}

export const CyberGridBackground: React.FC<CyberGridBackgroundProps> = ({
  className = '',
  gridSize = 44,
  showDots = true
}) => {
  return (
    <div 
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#020617] ${className}`}
      aria-hidden="true"
    >
      {/* 🌌 Deep Multi-Zone Radial Mesh Gradients */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(1100px circle at 50% -10%, rgba(56, 189, 248, 0.08), transparent 65%),
            radial-gradient(850px circle at 15% 105%, rgba(99, 102, 241, 0.05), transparent 55%),
            radial-gradient(850px circle at 85% 105%, rgba(16, 185, 129, 0.04), transparent 55%),
            radial-gradient(700px circle at 50% 50%, rgba(15, 23, 42, 0.5), transparent 80%)
          `
        }}
      />

      {/* 📐 Crisp Static Cyber Blueprint Grid */}
      <svg className="absolute inset-0 w-full h-full opacity-70">
        <defs>
          <pattern
            id="cyber-static-grid-pattern"
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
          >
            {/* Grid Hairlines */}
            <path
              d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
              fill="none"
              stroke="rgba(255, 255, 255, 0.03)"
              strokeWidth="1"
            />
            {/* Subtle Intersection Micro-Dots */}
            {showDots && (
              <circle
                cx="0"
                cy="0"
                r="1"
                fill="rgba(56, 189, 248, 0.18)"
              />
            )}
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#cyber-static-grid-pattern)" />
      </svg>

      {/* 🌑 Perimeter Edge Vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(2, 6, 23, 0.85) 100%)'
        }}
      />
    </div>
  );
};

export default CyberGridBackground;
