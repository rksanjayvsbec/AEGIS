import React from 'react';

export interface AegisGraphicLogoProps {
  className?: string;
  size?: number;
}

export const AegisGraphicLogo: React.FC<AegisGraphicLogoProps> = ({
  className = '',
  size = 110
}) => {
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Ambient Neon Purple Halo Behind Logo */}
      <div 
        className="absolute inset-0 rounded-full blur-2xl opacity-60 animate-pulse pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(192, 132, 252, 0.8) 0%, rgba(147, 51, 234, 0.4) 50%, transparent 75%)'
        }}
      />

      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 200 200" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
      >
        <defs>
          {/* Obsidian Chrome Body Gradient */}
          <linearGradient id="shieldChrome" x1="20" y1="10" x2="180" y2="190" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1a132e" />
            <stop offset="35%" stopColor="#0c0717" />
            <stop offset="70%" stopColor="#140c26" />
            <stop offset="100%" stopColor="#05030a" />
          </linearGradient>

          {/* Glowing Purple Neon Rim Gradient */}
          <linearGradient id="neonRimPurple" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#e9d5ff" />
            <stop offset="60%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#7e22ce" />
          </linearGradient>

          {/* Cyber Core Cyan Laser Accent */}
          <linearGradient id="laserCyan" x1="70" y1="60" x2="130" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>

          {/* Specular Top Bevel Highlight */}
          <linearGradient id="topBevel" x1="100" y1="10" x2="100" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </linearGradient>
        </defs>

        {/* 🛡️ Outer Cyber Geometric Shield Armor */}
        <polygon 
          points="100,16 178,48 162,136 100,188 38,136 22,48" 
          fill="url(#shieldChrome)" 
          stroke="url(#neonRimPurple)" 
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Specular Top Edge Light Refraction */}
        <polygon 
          points="100,18 174,49 100,68 26,49" 
          fill="url(#topBevel)" 
          opacity="0.35"
        />

        {/* 🔷 Inner Geometric Crystal Facets (Left & Right Wings) */}
        <polygon 
          points="100,28 154,55 142,125 100,165" 
          fill="#160d2b" 
          stroke="#a855f7" 
          strokeWidth="1.5"
          opacity="0.8"
        />
        <polygon 
          points="100,28 46,55 58,125 100,165" 
          fill="#0e071e" 
          stroke="#c084fc" 
          strokeWidth="1.5"
          opacity="0.9"
        />

        {/* ⚡ Center Laser Aegis Core Matrix (Isometric Diamond) */}
        <polygon 
          points="100,52 132,86 100,142 68,86" 
          fill="#080410" 
          stroke="url(#laserCyan)" 
          strokeWidth="2.5"
        />

        {/* Inner Glowing Laser Core */}
        <polygon 
          points="100,68 120,92 100,126 80,92" 
          fill="url(#laserCyan)" 
          opacity="0.85"
        />

        {/* Brilliant Diamond Core Spark */}
        <circle cx="100" cy="92" r="5" fill="#ffffff" filter="drop-shadow(0 0 8px #ffffff)" />
        
        {/* Orbital Micro Laser Pins */}
        <circle cx="100" cy="36" r="2.5" fill="#e9d5ff" />
        <circle cx="160" cy="62" r="2" fill="#c084fc" />
        <circle cx="40" cy="62" r="2" fill="#c084fc" />
        <circle cx="100" cy="172" r="2.5" fill="#c084fc" />
      </svg>
    </div>
  );
};

export default AegisGraphicLogo;
