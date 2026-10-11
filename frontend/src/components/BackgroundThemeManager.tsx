import React, { useState, useEffect } from 'react';
import { Sparkles, Sliders, Check, X } from 'lucide-react';
import PremiumAegisVoidBackground from './PremiumAegisVoidBackground';
import Silk from './Silk';
import CyberKineticBackground from './CyberKineticBackground';
import MinimalistObsidianBackground from './MinimalistObsidianBackground';
import CyberGridBackground from './CyberGridBackground';

export type CanvasThemeType = 
  | 'premium-void'
  | 'silk'
  | 'cyber-horizon' 
  | 'cyber-waves' 
  | 'hex-shield' 
  | 'minimalist-obsidian' 
  | 'cyber-grid'
  | 'stealth-black';

interface BackgroundThemeManagerProps {
  onThemeChange?: (theme: CanvasThemeType) => void;
}

export const BackgroundThemeManager: React.FC<BackgroundThemeManagerProps> = ({ onThemeChange }) => {
  const [theme, setTheme] = useState<CanvasThemeType>(() => {
    const saved = localStorage.getItem('aegis_canvas_theme_v5');
    const validThemes: CanvasThemeType[] = [
      'premium-void',
      'silk',
      'cyber-horizon',
      'cyber-waves',
      'hex-shield',
      'minimalist-obsidian',
      'cyber-grid',
      'stealth-black'
    ];
    if (saved && validThemes.includes(saved as CanvasThemeType)) {
      return saved as CanvasThemeType;
    }
    return 'premium-void'; // 🌌 Active Default: AEGIS Quantum Void Ultra-Premium Atmosphere
  });

  const [isOpen, setIsOpen] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState<number>(() => {
    const saved = localStorage.getItem('aegis_canvas_glow');
    return saved ? parseFloat(saved) : 1.0;
  });
  const [interactive, setInteractive] = useState<boolean>(false);
  const [standingStill, setStandingStill] = useState<boolean>(() => {
    const saved = localStorage.getItem('aegis_canvas_still_v2');
    return saved === 'true'; // Default is false: Animated!
  });

  useEffect(() => {
    localStorage.setItem('aegis_canvas_theme_v5', theme);
    if (onThemeChange) onThemeChange(theme);
  }, [theme, onThemeChange]);

  useEffect(() => {
    localStorage.setItem('aegis_canvas_glow', glowIntensity.toString());
  }, [glowIntensity]);

  useEffect(() => {
    localStorage.setItem('aegis_canvas_interactive', interactive.toString());
  }, [interactive]);

  useEffect(() => {
    localStorage.setItem('aegis_canvas_still_v2', standingStill.toString());
  }, [standingStill]);

  const themesList: { id: CanvasThemeType; name: string; desc: string; badge: string; icon: string }[] = [
    {
      id: 'premium-void',
      name: 'AEGIS Quantum Void',
      desc: 'Deep obsidian space with volumetric multi-spectral nebulae & autonomous quantum stardust',
      badge: 'Ultra Premium',
      icon: '🌌'
    },
    {
      id: 'silk',
      name: 'React Bits Silk (Purple)',
      desc: 'Dynamic GLSL mathematical silk fabric with deep purple #4d0490 aura and micro-texture',
      badge: 'Fluid',
      icon: '🔮'
    },
    {
      id: 'cyber-horizon',
      name: '3D Cyber Horizon Grid',
      desc: 'Infinite 3D perspective grid receding into a glowing neon horizon',
      badge: 'Perspective',
      icon: '📐'
    },
    {
      id: 'cyber-waves',
      name: 'Cybernetic Silk Waves',
      desc: 'Silky glowing harmonic sine waves with interactive fluid ripples',
      badge: 'Harmonic',
      icon: '🌊'
    },
    {
      id: 'hex-shield',
      name: 'Zero-Trust Hex Shield',
      desc: 'Interactive honeycomb defense shield with reactive proximity glow',
      badge: 'Tactical',
      icon: '🛡️'
    },
    {
      id: 'cyber-grid',
      name: 'Cyber Blueprint Mesh',
      desc: 'Architectural blueprint grid with subtle coordinate intersections',
      badge: 'Blueprint',
      icon: '⚡'
    },
    {
      id: 'minimalist-obsidian',
      name: 'Obsidian Slate Dots',
      desc: 'Ultra-clean dark slate with tactical micro-dots and sapphire aura',
      badge: 'Minimalist',
      icon: '✨'
    },
    {
      id: 'stealth-black',
      name: 'Stealth Pitch Black',
      desc: '100% distraction-free pure obsidian with edge vignette',
      badge: 'Stealth',
      icon: '🌑'
    }
  ];

  return (
    <>
      {/* 🎨 RENDER THE CHOSEN LIVE BACKGROUND */}
      {theme === 'premium-void' && (
        <PremiumAegisVoidBackground
          speed={standingStill ? 0 : 0.55}
          glowIntensity={glowIntensity}
          standingStill={standingStill}
        />
      )}

      {theme === 'silk' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <Silk
            speed={standingStill ? 0 : 5}
            scale={1}
            color="#4d0490"
            noiseIntensity={1.5}
            rotation={0}
            style={{
              width: '100vw',
              height: '100vh',
              opacity: Math.min(glowIntensity, 1.0)
            }}
          />
          {/* Subtle vignette so content in the foreground remains crisp and legible */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(2, 6, 23, 0.2) 0%, rgba(2, 6, 23, 0.75) 100%)'
            }}
            aria-hidden="true"
          />
        </div>
      )}
      {theme === 'cyber-waves' && (
        <CyberKineticBackground
          variant="fluid-waves"
          waveCount={9}
          speed={0.7}
          glowIntensity={glowIntensity}
          interactive={interactive}
        />
      )}

      {theme === 'cyber-horizon' && (
        <CyberKineticBackground
          variant="cyber-horizon"
          speed={standingStill ? 0 : 0.7}
          standingStill={standingStill}
          glowIntensity={glowIntensity}
          interactive={false}
        />
      )}

      {theme === 'hex-shield' && (
        <CyberKineticBackground
          variant="hex-shield"
          speed={0.6}
          glowIntensity={glowIntensity}
          interactive={interactive}
        />
      )}

      {theme === 'minimalist-obsidian' && (
        <MinimalistObsidianBackground
          glowIntensity={glowIntensity}
          interactiveSpotlight={interactive}
          dotSpacing={38}
          dotRadius={1.1}
          showRadarSweep={true}
          showCrosshairs={true}
        />
      )}

      {theme === 'cyber-grid' && (
        <CyberGridBackground gridSize={40} showDots={true} />
      )}

      {theme === 'stealth-black' && (
        <div 
          className="fixed inset-0 pointer-events-none z-0 bg-[#02050e]"
          style={{
            backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(30, 58, 138, 0.08), transparent 60%), radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(2, 5, 14, 0.95) 100%)'
          }}
          aria-hidden="true"
        />
      )}

      {/* 🎛️ FLOATING QUICK ATMOSPHERE / THEME SWITCHER PILL (Bottom Right) */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
        {isOpen && (
          <div className="mb-3 w-80 sm:w-96 p-4 rounded-2xl bg-[#090e1f]/95 backdrop-blur-xl border border-blue-500/25 shadow-2xl shadow-black/80 animate-in fade-in slide-in-from-bottom-3 duration-200 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100">Canvas Atmosphere</h4>
                  <p className="text-[10px] text-slate-400">Choose your preferred dynamic background</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/50 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Theme Options */}
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {themesList.map((t) => {
                const isSelected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`w-full text-left p-2 rounded-xl border transition-all flex items-start justify-between group ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500/50 shadow-sm shadow-blue-500/10'
                        : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/40 hover:border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-start space-x-2.5">
                      <span className="text-base pt-0.5">{t.icon}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-semibold ${isSelected ? 'text-blue-300' : 'text-slate-200'}`}>
                            {t.name}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-medium ${
                            isSelected
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {t.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{t.desc}</p>
                      </div>
                    </div>
                    <div className="pt-0.5">
                      {isSelected ? (
                        <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-700 group-hover:border-slate-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Interactive & Intensity Controls */}
            <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-slate-400">Stand Still (Static Wallpaper)</label>
                <button
                  onClick={() => setStandingStill(!standingStill)}
                  className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                    standingStill ? 'bg-emerald-600' : 'bg-slate-700'
                  }`}
                  title={standingStill ? 'Standing still (0% CPU/motion)' : 'Animated motion active'}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      standingStill ? 'translate-x-4.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {!standingStill && (
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-slate-400">Interactive Mouse Ripples</label>
                  <button
                    onClick={() => setInteractive(!interactive)}
                    className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                      interactive ? 'bg-blue-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        interactive ? 'translate-x-4.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Cyber Luminescence</span>
                  <span className="font-mono text-blue-400">{Math.round(glowIntensity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="1.8"
                  step="0.1"
                  value={glowIntensity}
                  onChange={(e) => setGlowIntensity(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Pill Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-full border backdrop-blur-md shadow-lg transition-all text-xs font-medium ${
            isOpen
              ? 'bg-blue-600 text-white border-blue-400 shadow-blue-500/20'
              : 'bg-[#090e1f]/85 text-slate-300 hover:text-white border-blue-500/20 hover:border-blue-500/40 hover:bg-[#0f172a]/95'
          }`}
          title="Change background atmosphere"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Atmosphere:</span>
          <span className="text-blue-300 font-semibold capitalize">
            {theme.replace('cyber-', '').replace('-', ' ')}
          </span>
        </button>
      </div>
    </>
  );
};

export default BackgroundThemeManager;
