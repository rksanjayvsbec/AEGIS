import React, { useRef, useEffect } from 'react';

export interface DarkAuroraBackgroundProps {
  className?: string;
  speed?: number;
  glowIntensity?: number;
  interactive?: boolean;
}

interface AuroraCloud {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  radius: number;
  baseRadius: number;
  color: string;
  colorStop: string;
  speedX: number;
  speedY: number;
  phase: number;
  pulseSpeed: number;
}

interface CyberParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  twinklePhase: number;
  twinkleSpeed: number;
  color: string;
}

interface ClickRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export const DarkAuroraBackground: React.FC<DarkAuroraBackgroundProps> = ({
  className = '',
  speed = 0.85,
  glowIntensity = 1.45,
  interactive = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });
  const ripplesRef = useRef<ClickRipple[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId = 0;
    let isVisible = !document.hidden;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // 🌌 6 Vibrant & Deeply Luminous Aurora Energy Clouds
    const clouds: AuroraCloud[] = [
      {
        x: width * 0.5,
        y: height * 0.22,
        baseX: width * 0.5,
        baseY: height * 0.22,
        radius: Math.min(width, height) * 0.65,
        baseRadius: Math.min(width, height) * 0.65,
        color: 'rgba(6, 182, 212, ',    // Electric Cyan
        colorStop: 'rgba(8, 145, 178, 0)',
        speedX: 0.0006 * speed,
        speedY: 0.00045 * speed,
        phase: 0,
        pulseSpeed: 0.0009 * speed
      },
      {
        x: width * 0.18,
        y: height * 0.62,
        baseX: width * 0.18,
        baseY: height * 0.62,
        radius: Math.min(width, height) * 0.6,
        baseRadius: Math.min(width, height) * 0.6,
        color: 'rgba(37, 99, 235, ',    // Royal Sapphire Blue
        colorStop: 'rgba(29, 78, 216, 0)',
        speedX: -0.0005 * speed,
        speedY: 0.00055 * speed,
        phase: 1.8,
        pulseSpeed: 0.0008 * speed
      },
      {
        x: width * 0.82,
        y: height * 0.42,
        baseX: width * 0.82,
        baseY: height * 0.42,
        radius: Math.min(width, height) * 0.62,
        baseRadius: Math.min(width, height) * 0.62,
        color: 'rgba(56, 189, 248, ',   // Radiant Sky Blue
        colorStop: 'rgba(2, 132, 199, 0)',
        speedX: 0.00045 * speed,
        speedY: -0.00045 * speed,
        phase: 3.5,
        pulseSpeed: 0.001 * speed
      },
      {
        x: width * 0.38,
        y: height * 0.15,
        baseX: width * 0.38,
        baseY: height * 0.15,
        radius: Math.min(width, height) * 0.52,
        baseRadius: Math.min(width, height) * 0.52,
        color: 'rgba(124, 58, 237, ',   // Vivid Ultraviolet / Violet
        colorStop: 'rgba(91, 33, 182, 0)',
        speedX: -0.00055 * speed,
        speedY: 0.00035 * speed,
        phase: 5.1,
        pulseSpeed: 0.00075 * speed
      },
      {
        x: width * 0.68,
        y: height * 0.78,
        baseX: width * 0.68,
        baseY: height * 0.78,
        radius: Math.min(width, height) * 0.58,
        baseRadius: Math.min(width, height) * 0.58,
        color: 'rgba(13, 148, 136, ',   // Deep Emerald Teal Ocean
        colorStop: 'rgba(15, 118, 110, 0)',
        speedX: 0.00035 * speed,
        speedY: -0.0004 * speed,
        phase: 2.4,
        pulseSpeed: 0.00085 * speed
      },
      {
        x: width * 0.5,
        y: height * 0.85,
        baseX: width * 0.5,
        baseY: height * 0.85,
        radius: Math.min(width, height) * 0.5,
        baseRadius: Math.min(width, height) * 0.5,
        color: 'rgba(99, 102, 241, ',   // Luminous Indigo Core
        colorStop: 'rgba(67, 56, 202, 0)',
        speedX: 0.0004 * speed,
        speedY: 0.0003 * speed,
        phase: 4.2,
        pulseSpeed: 0.0007 * speed
      }
    ];

    // ✨ 60 Dynamic Constellation Cyber Particles with Interconnects
    const particleCount = 65;
    const particles: CyberParticle[] = [];
    const particleColors = ['#38bdf8', '#818cf8', '#22d3ee', '#c084fc'];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45 * speed,
        vy: -(0.15 + Math.random() * 0.4) * speed,
        size: 0.8 + Math.random() * 1.8,
        alpha: 0.25 + Math.random() * 0.5,
        baseAlpha: 0.25 + Math.random() * 0.5,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.02 + Math.random() * 0.04,
        color: particleColors[Math.floor(Math.random() * particleColors.length)]
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;

      clouds[0].baseX = width * 0.5;
      clouds[0].baseY = height * 0.22;
      clouds[1].baseX = width * 0.18;
      clouds[1].baseY = height * 0.62;
      clouds[2].baseX = width * 0.82;
      clouds[2].baseY = height * 0.42;
      clouds[3].baseX = width * 0.38;
      clouds[3].baseY = height * 0.15;
      clouds[4].baseX = width * 0.68;
      clouds[4].baseY = height * 0.78;
      clouds[5].baseX = width * 0.5;
      clouds[5].baseY = height * 0.85;

      const minDim = Math.min(width, height);
      clouds.forEach((c) => {
        c.radius = minDim * 0.6;
        c.baseRadius = minDim * 0.6;
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX / window.innerWidth;
      mouseRef.current.targetY = e.clientY / window.innerHeight;
    };

    const handleClick = (e: MouseEvent) => {
      // Spawn an ethereal expanding cyber shockwave ripple
      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 10,
        maxRadius: Math.max(width, height) * 0.45,
        alpha: 0.45,
        color: Math.random() > 0.5 ? '#38bdf8' : '#818cf8'
      });
    };

    window.addEventListener('resize', handleResize);
    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('click', handleClick);
    }

    // Main 60fps render loop
    const render = (time: number) => {
      // Mouse spring follow interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const mouseShiftX = (mouseRef.current.x - 0.5) * 110;
      const mouseShiftY = (mouseRef.current.y - 0.5) * 85;

      // 1. Deep Midnight Obsidian Space Canvas Base
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, width, height);

      // 2. Render Morphing Aurora Clouds with Additive Luminescence
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      clouds.forEach((c, idx) => {
        const wanderX = Math.sin(time * c.speedX + c.phase) * (width * 0.14);
        const wanderY = Math.cos(time * c.speedY + c.phase * 1.25) * (height * 0.12);
        const pulse = Math.sin(time * c.pulseSpeed + c.phase) * 0.18;

        c.x = c.baseX + wanderX + mouseShiftX * (0.5 + idx * 0.12);
        c.y = c.baseY + wanderY + mouseShiftY * (0.5 + idx * 0.12);
        const curRadius = c.baseRadius * (1 + pulse);

        const grad = ctx.createRadialGradient(
          c.x,
          c.y,
          0,
          c.x,
          c.y,
          curRadius
        );

        // Rich, vibrant, luminous alpha stops
        const alphaPeak = Math.min(0.55, 0.42 * glowIntensity).toFixed(3);
        const alphaMid = Math.min(0.28, 0.20 * glowIntensity).toFixed(3);

        grad.addColorStop(0, `${c.color}${alphaPeak})`);
        grad.addColorStop(0.35, `${c.color}${alphaMid})`);
        grad.addColorStop(0.75, `${c.color}${(parseFloat(alphaMid) * 0.35).toFixed(3)})`);
        grad.addColorStop(1, c.colorStop);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(c.x, c.y, curRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Flowing Cyber Aurora Wave Ribbons across the horizon
      const ribbonCount = 3;
      const ribbonColors = [
        'rgba(34, 211, 238, 0.08)',  // Cyan wave
        'rgba(99, 102, 241, 0.07)',  // Indigo wave
        'rgba(56, 189, 248, 0.08)'   // Sky wave
      ];

      for (let r = 0; r < ribbonCount; r++) {
        ctx.beginPath();
        ctx.fillStyle = ribbonColors[r];
        const baseRibbonY = height * (0.28 + r * 0.18);
        const ribbonFreq = 0.0018 + r * 0.0006;
        const ribbonSpeed = 0.0006 * speed * (r % 2 === 0 ? 1 : -1);

        ctx.moveTo(0, height);
        for (let px = 0; px <= width; px += 20) {
          const py =
            baseRibbonY +
            Math.sin(px * ribbonFreq + time * ribbonSpeed + r * 1.5) * 65 +
            Math.cos(px * 0.0008 - time * 0.0004) * 35;
          ctx.lineTo(px, py);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
      }

      // 4. Interactive Magnetic Cursor Glow Aura
      if (interactive) {
        const cursorX = mouseRef.current.x * width;
        const cursorY = mouseRef.current.y * height;
        const cursorRadius = Math.min(width, height) * 0.32;

        const cursorGrad = ctx.createRadialGradient(
          cursorX,
          cursorY,
          0,
          cursorX,
          cursorY,
          cursorRadius
        );
        cursorGrad.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
        cursorGrad.addColorStop(0.4, 'rgba(99, 102, 241, 0.10)');
        cursorGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

        ctx.fillStyle = cursorGrad;
        ctx.beginPath();
        ctx.arc(cursorX, cursorY, cursorRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // 5. Crisp Cybernetic Blueprint Micro-Grid with Glowing Beacons
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.032)';
      ctx.lineWidth = 1;
      const gridSize = 48;

      ctx.beginPath();
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Luminous cyan grid intersection crosshairs
      ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
      const crossStep = gridSize * 2;
      for (let x = crossStep; x < width; x += crossStep) {
        for (let y = crossStep; y < height; y += crossStep) {
          ctx.beginPath();
          ctx.arc(x, y, 1.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // 6. Constellation Cyber Particles & Distance Interconnect Lines
      ctx.save();
      const maxConnectDist = 85;

      // Update positions
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around bounds
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        p.twinklePhase += p.twinkleSpeed;
        const twinkle = Math.sin(p.twinklePhase) * 0.5 + 0.5;
        const currentAlpha = p.baseAlpha * (0.6 + twinkle * 0.6);

        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw constellation connecting lines between neighboring particles
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 0.75;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectDist) {
            const lineAlpha = (1 - dist / maxConnectDist) * 0.16;
            ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // 7. Interactive Sonar Shockwave Ripples from Clicks
      if (ripplesRef.current.length > 0) {
        ctx.save();
        for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
          const rip = ripplesRef.current[i];
          rip.radius += 4.5 * speed;
          rip.alpha *= 0.955;

          if (rip.alpha < 0.01 || rip.radius > rip.maxRadius) {
            ripplesRef.current.splice(i, 1);
            continue;
          }

          ctx.strokeStyle = rip.color;
          ctx.globalAlpha = rip.alpha;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
          ctx.stroke();

          // Second harmonic inner ripple
          ctx.beginPath();
          ctx.arc(rip.x, rip.y, Math.max(0, rip.radius * 0.7), 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 8. Subtle Corner Vignette (Leaves center energetic and visible)
      const vigGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.45,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.88
      );
      vigGrad.addColorStop(0, 'rgba(3, 7, 18, 0)');
      vigGrad.addColorStop(0.65, 'rgba(3, 7, 18, 0.25)');
      vigGrad.addColorStop(1, 'rgba(3, 7, 18, 0.75)');

      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, width, height);

      if (isVisible) {
        animId = requestAnimationFrame(render);
      }
    };

    const onVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        animId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animId);
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('click', handleClick);
      }
    };
  }, [speed, glowIntensity, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{
        width: '100vw',
        height: '100vh',
        background: '#030712'
      }}
    />
  );
};

export default DarkAuroraBackground;
