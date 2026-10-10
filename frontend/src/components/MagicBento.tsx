import React, { useRef, useEffect, useCallback, useState } from 'react';
import { gsap } from 'gsap';
import { 
  Cpu, 
  ShieldCheck, 
  Sparkles, 
  Terminal, 
  Network, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Lock,
  Radio
} from 'lucide-react';
import './MagicBento.css';

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = '56, 189, 248'; // Cyan / Sky Blue for Aegis cyber theme
const MOBILE_BREAKPOINT = 768;

export interface BentoCardItem {
  id: string;
  color?: string;
  title: string;
  description: string;
  label: string;
  visualType?: 'tokenizer' | 'zerotrust' | 'heuristic' | 'remediation' | 'ssh' | 'dossier' | 'custom';
  customVisual?: React.ReactNode;
  headerBadge?: React.ReactNode;
  footerActions?: React.ReactNode;
  onClick?: () => void;
}

const DEFAULT_CARD_DATA: BentoCardItem[] = [
  {
    id: 'tokenizer',
    color: 'rgba(10, 17, 34, 0.92)',
    title: 'Multi-Vendor Tokenizer',
    description: 'Unified AST parser normalizing Cisco IOS, JunOS, PAN-OS, and Arista syntax.',
    label: 'Architecture',
    visualType: 'tokenizer'
  },
  {
    id: 'zerotrust',
    color: 'rgba(10, 17, 34, 0.92)',
    title: 'Zero-Trust Hardening',
    description: 'Automated evaluation against CIS Benchmark v8, NIST SP 800-53 R5 & DISA STIG.',
    label: 'Compliance',
    visualType: 'zerotrust'
  },
  {
    id: 'heuristic',
    color: 'rgba(10, 17, 34, 0.92)',
    title: 'Heuristic Learning Engine',
    description: 'Offline NLP mapping loop that dynamically adapts to non-standard custom commands.',
    label: 'Intelligence',
    visualType: 'heuristic'
  },
  {
    id: 'remediation',
    color: 'rgba(10, 17, 34, 0.92)',
    title: 'Automated Remediation',
    description: 'Generates hardened production-ready CLI rollback & configuration fix scripts in seconds.',
    label: 'Auto-Fix',
    visualType: 'remediation'
  },
  {
    id: 'ssh',
    color: 'rgba(10, 17, 34, 0.92)',
    title: 'Live Netmiko SSH Audit',
    description: 'Real-time discovery mesh with secure credentialed execution across physical switches.',
    label: 'Discovery',
    visualType: 'ssh'
  },
  {
    id: 'dossier',
    color: 'rgba(10, 17, 34, 0.92)',
    title: 'Executive PDF Dossiers',
    description: 'Audit-ready cryptographic compliance reports with full gap analysis & audit trails.',
    label: 'Governance',
    visualType: 'dossier'
  }
];

// Rich Center Visualizer Widget Renderer for Each Bento Card
const BentoVisualizer: React.FC<{ type: BentoCardItem['visualType'] }> = ({ type }) => {
  switch (type) {
    case 'tokenizer':
      return (
        <div className="w-full bg-[#050b18]/90 rounded-xl p-3 border border-sky-500/25 space-y-2 font-mono text-xs shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-[10px] text-sky-400 font-semibold">
              <Cpu className="h-3.5 w-3.5" />
              <span>AST SYNTAX PIPELINE</span>
            </div>
            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded flex items-center space-x-1">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>LIVE AST</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-300 bg-slate-950/80 px-2 py-1 rounded border border-slate-800">
            <span className="text-sky-300">RAW_CLI</span>
            <ArrowRight className="h-3 w-3 text-slate-500" />
            <span className="text-purple-300">TOKENIZER</span>
            <ArrowRight className="h-3 w-3 text-slate-500" />
            <span className="text-emerald-300">NORMALIZED</span>
          </div>

          <div className="flex flex-wrap gap-1 pt-0.5">
            {['Cisco IOS', 'JunOS', 'PAN-OS', 'Arista EOS'].map(v => (
              <span key={v} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700/60 font-semibold">
                {v}
              </span>
            ))}
          </div>
        </div>
      );

    case 'zerotrust':
      return (
        <div className="w-full bg-[#050b18]/90 rounded-xl p-3 border border-emerald-500/25 space-y-2 text-xs shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold">
              <ShieldCheck className="h-4 w-4" />
              <span>POLICY BASELINE MATRIX</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
              100% HARDENED
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-center">
            <div className="p-1 rounded bg-slate-950 border border-sky-500/20 text-sky-300 font-semibold">
              CIS v8
            </div>
            <div className="p-1 rounded bg-slate-950 border border-emerald-500/20 text-emerald-300 font-semibold">
              NIST 800-53
            </div>
            <div className="p-1 rounded bg-slate-950 border border-purple-500/20 text-purple-300 font-semibold">
              DISA STIG
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
            <span className="flex items-center space-x-1">
              <Lock className="h-3 w-3 text-emerald-400" />
              <span>Zero-Trust Protocol</span>
            </span>
            <span className="text-emerald-400 font-bold">Enforced</span>
          </div>
        </div>
      );

    case 'heuristic':
      return (
        <div className="w-full bg-[#050b18]/90 rounded-xl p-3 border border-purple-500/25 space-y-2 text-xs shadow-inner font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-[10px] text-purple-400 font-bold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI NLP RULE SYNTHESIS</span>
            </div>
            <span className="text-[9px] bg-purple-500/10 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded">
              98.4% Confidence
            </span>
          </div>

          <div className="bg-slate-950 p-1.5 rounded border border-slate-800 text-[10px] text-purple-200">
            <span className="text-slate-400">Pattern: </span>
            <span className="text-sky-300 font-semibold">^snmp-server community</span>
            <br />
            <span className="text-slate-400">Mapped: </span>
            <span className="text-emerald-300 font-semibold">snmp_v3_only ➔ False</span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Dynamic Regex Adapter</span>
            <span className="text-purple-400 font-semibold">Self-Learning</span>
          </div>
        </div>
      );

    case 'remediation':
      return (
        <div className="w-full bg-[#050b18]/90 rounded-xl p-3 border border-rose-500/25 space-y-2 text-xs shadow-inner font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-[10px] text-rose-400 font-bold">
              <Terminal className="h-3.5 w-3.5" />
              <span>CLI REMEDIATION ENGINE</span>
            </div>
            <span className="text-[9px] bg-rose-500/10 text-rose-300 border border-rose-500/30 px-1.5 py-0.2 rounded font-bold">
              AUTO-PATCH
            </span>
          </div>

          <div className="bg-slate-950 p-2 rounded border border-slate-800 text-[10px] space-y-0.5">
            <div className="text-rose-400 font-semibold truncate">- no service password-encryption</div>
            <div className="text-emerald-400 font-semibold truncate">+ service password-encryption</div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center space-x-1 text-sky-300 font-medium">
              <Zap className="h-3 w-3 text-sky-400" />
              <span>Instant Rollback CLI</span>
            </span>
            <span className="text-emerald-400 font-bold">Ready</span>
          </div>
        </div>
      );

    case 'ssh':
      return (
        <div className="w-full bg-[#050b18]/90 rounded-xl p-3 border border-cyan-500/25 space-y-2 text-xs shadow-inner font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-[10px] text-cyan-400 font-bold">
              <Network className="h-3.5 w-3.5" />
              <span>NETMIKO CREDENTIAL MESH</span>
            </div>
            <span className="text-[9px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.2 rounded flex items-center space-x-1">
              <Radio className="h-2.5 w-2.5 text-cyan-400 animate-pulse" />
              <span>CONNECTED</span>
            </span>
          </div>

          <div className="bg-slate-950 p-1.5 rounded border border-slate-800 text-[10px] space-y-0.5 text-slate-300">
            <div className="flex justify-between">
              <span>Node: core-switch-01</span>
              <span className="text-emerald-400 font-semibold">10.0.1.1</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Port: 22/tcp [SSH v2]</span>
              <span className="text-sky-300">Ping: 12ms</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Air-Gapped Execution</span>
            <span className="text-cyan-300 font-bold">Encrypted</span>
          </div>
        </div>
      );

    case 'dossier':
      return (
        <div className="w-full bg-[#050b18]/90 rounded-xl p-3 border border-amber-500/25 space-y-2 text-xs shadow-inner font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-[10px] text-amber-400 font-bold">
              <FileText className="h-3.5 w-3.5" />
              <span>CRYPTOGRAPHIC DOSSIER</span>
            </div>
            <span className="text-[9px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
              PDF EXPORT
            </span>
          </div>

          <div className="bg-slate-950 p-1.5 rounded border border-slate-800 text-[10px] space-y-0.5 text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-amber-200 font-semibold">ReportLab Engine</span>
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            </div>
            <div className="text-[9px] text-slate-400 truncate">SHA-256: 8f4b...c91e</div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Compliance Gap Audit</span>
            <span className="text-amber-300 font-bold">Generated</span>
          </div>
        </div>
      );

    default:
      return null;
  }
};

const createParticleElement = (x: number, y: number, color = DEFAULT_GLOW_COLOR) => {
  const el = document.createElement('div');
  el.className = 'particle';
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

const calculateSpotlightValues = (radius: number) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75
});

const updateCardGlowProperties = (card: HTMLElement, mouseX: number, mouseY: number, glow: number, radius: number) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;

  card.style.setProperty('--glow-x', `${relativeX}%`);
  card.style.setProperty('--glow-y', `${relativeY}%`);
  card.style.setProperty('--glow-intensity', glow.toString());
  card.style.setProperty('--glow-radius', `${radius}px`);
};

export interface ParticleCardProps {
  children: React.ReactNode;
  className?: string;
  disableAnimations?: boolean;
  style?: React.CSSProperties;
  particleCount?: number;
  glowColor?: string;
  enableTilt?: boolean;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const ParticleCard: React.FC<ParticleCardProps> = ({
  children,
  className = '',
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = false,
  enableMagnetism = false,
  onClick
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const particlesRef = useRef<HTMLElement[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef<HTMLElement[]>([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimationRef = useRef<gsap.core.Tween | null>(null);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return;

    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor)
    );
    particlesInitialized.current = true;
  }, [particleCount, glowColor]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();

    particlesRef.current.forEach(particle => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'back.in(1.7)',
        onComplete: () => {
          particle.parentNode?.removeChild(particle);
        }
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;

    if (!particlesInitialized.current) {
      initializeParticles();
    }

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;

        const clone = particle.cloneNode(true) as HTMLElement;
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);

        gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });

        gsap.to(clone, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: 'none',
          repeat: -1,
          yoyo: true
        });

        gsap.to(clone, {
          opacity: 0.3,
          duration: 1.5,
          ease: 'power2.inOut',
          repeat: -1,
          yoyo: true
        });
      }, index * 100);

      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;

    const element = cardRef.current;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 4,
          rotateY: 4,
          duration: 0.3,
          ease: 'power2.out',
          transformPerspective: 1000
        });
      }
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();
      element.style.setProperty('--glow-intensity', '0');

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }

      if (enableMagnetism) {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Update radiant border glow spotlight coordinates
      const relativeX = (x / rect.width) * 100;
      const relativeY = (y / rect.height) * 100;
      element.style.setProperty('--glow-x', `${relativeX}%`);
      element.style.setProperty('--glow-y', `${relativeY}%`);
      element.style.setProperty('--glow-intensity', '1');
      element.style.setProperty('--glow-radius', '280px');

      if (!enableTilt && !enableMagnetism) return;

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        gsap.to(element, {
          rotateX,
          rotateY,
          duration: 0.1,
          ease: 'power2.out',
          transformPerspective: 1000
        });
      }

      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.04;
        const magnetY = (y - centerY) * 0.04;

        magnetismAnimationRef.current = gsap.to(element, {
          x: magnetX,
          y: magnetY,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!clickEffect) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );

      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `;

      element.appendChild(ripple);

      gsap.fromTo(
        ripple,
        {
          scale: 0,
          opacity: 1
        },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          onComplete: () => ripple.remove()
        }
      );
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('click', handleClick);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('click', handleClick);
      clearAllParticles();
    };
  }, [animateParticles, clearAllParticles, disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor]);

  return (
    <div
      ref={cardRef}
      className={`${className} particle-container`}
      style={{ ...style, position: 'relative', overflow: 'hidden' }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface GlobalSpotlightProps {
  gridRef: React.RefObject<HTMLDivElement>;
  disableAnimations?: boolean;
  enabled?: boolean;
  spotlightRadius?: number;
  glowColor?: string;
}

const GlobalSpotlight: React.FC<GlobalSpotlightProps> = ({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR
}) => {
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (disableAnimations || !gridRef?.current || !enabled) return;

    const spotlight = document.createElement('div');
    spotlight.className = 'global-spotlight';
    spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%,
        rgba(${glowColor}, 0.08) 15%,
        rgba(${glowColor}, 0.04) 25%,
        rgba(${glowColor}, 0.02) 40%,
        rgba(${glowColor}, 0.01) 65%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const handleMouseMove = (e: MouseEvent) => {
      if (!spotlightRef.current || !gridRef.current) return;

      const section = gridRef.current.closest('.bento-section');
      const rect = section?.getBoundingClientRect();
      const proximityPadding = 120;
      const mouseInside =
        rect &&
        e.clientX >= rect.left - proximityPadding &&
        e.clientX <= rect.right + proximityPadding &&
        e.clientY >= rect.top - proximityPadding &&
        e.clientY <= rect.bottom + proximityPadding;

      const cards = gridRef.current.querySelectorAll<HTMLElement>('.magic-bento-card');

      if (!mouseInside) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
        cards.forEach(card => {
          card.style.setProperty('--glow-intensity', '0');
        });
        return;
      }

      const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
      let minDistance = Infinity;

      cards.forEach(card => {
        const cardElement = card;
        const cardRect = cardElement.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance =
          Math.hypot(e.clientX - centerX, e.clientY - centerY) - Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);

        minDistance = Math.min(minDistance, effectiveDistance);

        let glowIntensity = 0;
        if (effectiveDistance <= proximity) {
          glowIntensity = 1;
        } else if (effectiveDistance <= fadeDistance) {
          glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        }

        updateCardGlowProperties(cardElement, e.clientX, e.clientY, glowIntensity, spotlightRadius);
      });

      gsap.to(spotlightRef.current, {
        left: e.clientX,
        top: e.clientY,
        duration: 0.1,
        ease: 'power2.out'
      });

      const targetOpacity =
        minDistance <= proximity
          ? 0.8
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
            : 0;

      gsap.to(spotlightRef.current, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.2 : 0.5,
        ease: 'power2.out'
      });
    };

    const handleMouseLeave = () => {
      gridRef.current?.querySelectorAll<HTMLElement>('.magic-bento-card').forEach(card => {
        card.style.setProperty('--glow-intensity', '0');
      });
      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
    };
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

  return null;
};

const BentoCardGrid: React.FC<{ children: React.ReactNode; gridRef: React.RefObject<HTMLDivElement> }> = ({ children, gridRef }) => (
  <div className="card-grid bento-section" ref={gridRef}>
    {children}
  </div>
);

const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

export interface MagicBentoProps {
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  disableAnimations?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  enableTilt?: boolean;
  glowColor?: string;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
  cards?: BentoCardItem[];
}

const MagicBento: React.FC<MagicBentoProps> = ({
  textAutoHide = false,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = true,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = true,
  cards = DEFAULT_CARD_DATA
}) => {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useMobileDetection();
  const shouldDisableAnimations = disableAnimations || isMobile;

  return (
    <>
      {enableSpotlight && (
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={shouldDisableAnimations}
          enabled={enableSpotlight}
          spotlightRadius={spotlightRadius}
          glowColor={glowColor}
        />
      )}

      <BentoCardGrid gridRef={gridRef}>
        {cards.map((card, index) => {
          const baseClassName = `magic-bento-card ${textAutoHide ? 'magic-bento-card--text-autohide' : ''} ${enableBorderGlow ? 'magic-bento-card--border-glow' : ''}`;
          const cardProps = {
            className: baseClassName,
            style: {
              backgroundColor: card.color || 'rgba(10, 17, 34, 0.92)',
              '--glow-rgb': glowColor
            } as React.CSSProperties
          };

          const cardInner = (
            <>
              {/* Header Label & Badge */}
              <div className="magic-bento-card__header">
                <div className="magic-bento-card__label">{card.label}</div>
                {card.headerBadge && <div>{card.headerBadge}</div>}
              </div>

              {/* Rich Visual Center Widget */}
              <div className="magic-bento-card__visual">
                {card.customVisual ? card.customVisual : <BentoVisualizer type={card.visualType || 'tokenizer'} />}
              </div>

              {/* Content Footer */}
              <div className="magic-bento-card__content">
                <h2 className="magic-bento-card__title">{card.title}</h2>
                <p className="magic-bento-card__description">{card.description}</p>
                {card.footerActions && (
                  <div className="pt-2 mt-2 border-t border-slate-800/80" onClick={(e) => e.stopPropagation()}>
                    {card.footerActions}
                  </div>
                )}
              </div>
            </>
          );

          if (enableStars) {
            return (
              <ParticleCard
                key={card.id || index}
                {...cardProps}
                onClick={card.onClick}
                disableAnimations={shouldDisableAnimations}
                particleCount={particleCount}
                glowColor={glowColor}
                enableTilt={enableTilt}
                clickEffect={clickEffect}
                enableMagnetism={enableMagnetism}
              >
                {cardInner}
              </ParticleCard>
            );
          }

          return (
            <div
              key={card.id || index}
              {...cardProps}
              ref={el => {
                if (!el) return;

                const handleMouseMove = (e: MouseEvent) => {
                  if (shouldDisableAnimations) return;

                  const rect = el.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const centerX = rect.width / 2;
                  const centerY = rect.height / 2;

                  if (enableTilt) {
                    const rotateX = ((y - centerY) / centerY) * -6;
                    const rotateY = ((x - centerX) / centerX) * 6;
                    gsap.to(el, {
                      rotateX,
                      rotateY,
                      duration: 0.1,
                      ease: 'power2.out',
                      transformPerspective: 1000
                    });
                  }

                  if (enableMagnetism) {
                    const magnetX = (x - centerX) * 0.04;
                    const magnetY = (y - centerY) * 0.04;
                    gsap.to(el, {
                      x: magnetX,
                      y: magnetY,
                      duration: 0.3,
                      ease: 'power2.out'
                    });
                  }
                };

                const handleMouseLeave = () => {
                  if (shouldDisableAnimations) return;

                  if (enableTilt) {
                    gsap.to(el, {
                      rotateX: 0,
                      rotateY: 0,
                      duration: 0.3,
                      ease: 'power2.out'
                    });
                  }

                  if (enableMagnetism) {
                    gsap.to(el, {
                      x: 0,
                      y: 0,
                      duration: 0.3,
                      ease: 'power2.out'
                    });
                  }
                };

                const handleClick = (e: MouseEvent) => {
                  if (!clickEffect || shouldDisableAnimations) return;

                  const rect = el.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;

                  const maxDistance = Math.max(
                    Math.hypot(x, y),
                    Math.hypot(x - rect.width, y),
                    Math.hypot(x, y - rect.height),
                    Math.hypot(x - rect.width, y - rect.height)
                  );

                  const ripple = document.createElement('div');
                  ripple.style.cssText = `
                    position: absolute;
                    width: ${maxDistance * 2}px;
                    height: ${maxDistance * 2}px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
                    left: ${x - maxDistance}px;
                    top: ${y - maxDistance}px;
                    pointer-events: none;
                    z-index: 1000;
                  `;

                  el.appendChild(ripple);

                  gsap.fromTo(
                    ripple,
                    {
                      scale: 0,
                      opacity: 1
                    },
                    {
                      scale: 1,
                      opacity: 0,
                      duration: 0.8,
                      ease: 'power2.out',
                      onComplete: () => ripple.remove()
                    }
                  );
                };

                el.addEventListener('mousemove', handleMouseMove);
                el.addEventListener('mouseleave', handleMouseLeave);
                el.addEventListener('click', handleClick);
              }}
            >
              {cardInner}
            </div>
          );
        })}
      </BentoCardGrid>
    </>
  );
};

export default MagicBento;
