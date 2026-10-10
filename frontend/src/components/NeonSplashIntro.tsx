import React, { useState, useEffect } from 'react';
import NeonReveal from './NeonReveal';
import AegisGraphicLogo from './AegisGraphicLogo';
import './NeonReveal.css';

export interface NeonSplashIntroProps {
  onComplete?: () => void;
  brandName?: string;
  subtitle?: string;
  duration?: number;
}

export const NeonSplashIntro: React.FC<NeonSplashIntroProps> = ({
  onComplete,
  brandName = 'AEGIS',
  duration = 2.8
}) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Automatically transition to the dashboard once the reveal completes
    const timeout = setTimeout(() => {
      handleDismiss();
    }, duration * 1000);

    return () => clearTimeout(timeout);
  }, [duration]);

  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 500);
  };

  return (
    <div 
      onClick={handleDismiss}
      className={`fixed inset-0 z-[99999] transition-all duration-700 select-none overflow-hidden cursor-pointer ${
        isClosing ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      title="Click anywhere to enter"
    >
      {/* 🌟 FULL-WEBPAGE REACT BITS PRO NEON REVEAL */}
      <NeonReveal
        text={brandName}
        colorHue={265}
        revealDelay={150}
        revealDuration={2400}
        expandFrom="center"
        barWidth={1.0}
        barHeight={0.02}
        fullscreen={true}
      >
        {/* DEAD-CENTER WEBPAGE DISPLAY: ONLY NEW GRAPHIC LOGO & BLACK NAME */}
        <div className="flex flex-col items-center justify-center space-y-6 w-full px-4 select-none pointer-events-none">
          
          {/* 1. New Graphic Design Cyber Shield Logo */}
          <AegisGraphicLogo size={125} />

          {/* 2. Brand Name in Custom Jet Black Typography */}
          <div className="text-center">
            <h1 className="pro-neon-title select-none">
              {brandName}
            </h1>
          </div>

        </div>
      </NeonReveal>
    </div>
  );
};

export default NeonSplashIntro;
