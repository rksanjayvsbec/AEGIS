import React, { useRef, useEffect } from 'react';

export interface CyberKineticBackgroundProps {
  className?: string;
  speed?: number;
  waveCount?: number;
  interactive?: boolean;
  glowIntensity?: number;
  variant?: 'fluid-waves' | 'cyber-horizon' | 'hex-shield';
  standingStill?: boolean;
}

export const CyberKineticBackground: React.FC<CyberKineticBackgroundProps> = ({
  className = '',
  speed = 0.7,
  waveCount = 9,
  interactive = false,
  glowIntensity = 1.0,
  variant = 'cyber-horizon',
  standingStill = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({
    x: -1000,
    y: -1000,
    targetX: -1000,
    targetY: -1000,
    active: false
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId = 0;
    let isVisible = !document.hidden;
    let width = 0;
    let height = 0;
    let time = 0;
    let lastTime = 0;

    // Ambient floating cyber particles
    const particleCount = 45;
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      baseAlpha: number;
      color: string;
    }
    const particles: Particle[] = [];
    const pColors = ['#38bdf8', '#60a5fa', '#818cf8', '#22d3ee'];

    // Sky Twinkling Stars for cyber-horizon
    interface SkyStar {
      xRatio: number;
      yRatio: number;
      size: number;
      color: string;
      speed: number;
      phase: number;
    }
    const skyStars: SkyStar[] = [];
    const starColors = ['#ffffff', '#fde047', '#38bdf8', '#f472b6', '#c084fc'];
    for (let i = 0; i < 65; i++) {
      skyStars.push({
        xRatio: Math.random(),
        yRatio: Math.random() * 0.42,
        size: Math.random() * 1.6 + 0.6,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        speed: 1.5 + Math.random() * 2.5,
        phase: Math.random() * Math.PI * 2
      });
    }

    // Pre-computed tactile noise texture pattern
    let noisePattern: CanvasPattern | null = null;
    try {
      const nCanvas = document.createElement('canvas');
      nCanvas.width = 128;
      nCanvas.height = 128;
      const nCtx = nCanvas.getContext('2d');
      if (nCtx) {
        const img = nCtx.createImageData(128, 128);
        for (let i = 0; i < img.data.length; i += 4) {
          const val = Math.floor(Math.random() * 255);
          img.data[i] = val;
          img.data[i + 1] = val;
          img.data[i + 2] = val;
          img.data[i + 3] = 16; // 6% tactile grain
        }
        nCtx.putImageData(img, 0, 0);
        noisePattern = ctx.createPattern(nCanvas, 'repeat');
      }
    } catch {
      // Ignore if canvas pattern unavailable
    }

    const resize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Re-init particles
      if (particles.length === 0) {
        for (let i = 0; i < particleCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.35 * speed,
            vy: -(0.15 + Math.random() * 0.45) * speed,
            size: Math.random() * 1.6 + 0.6,
            alpha: Math.random() * 0.4 + 0.2,
            baseAlpha: Math.random() * 0.4 + 0.2,
            color: pColors[Math.floor(Math.random() * pColors.length)]
          });
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.targetX = -1000;
      mouseRef.current.targetY = -1000;
    };

    if (interactive && !standingStill) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseleave', handleMouseLeave);
    }

    const onVisibility = () => {
      isVisible = !document.hidden;
      if (isVisible && animId === 0) {
        lastTime = performance.now();
        animId = requestAnimationFrame(render);
      } else if (!isVisible && animId !== 0) {
        cancelAnimationFrame(animId);
        animId = 0;
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Color palette for waves (electric cyan, sapphire, indigo)
    const wavePalettes = [
      { stroke: 'rgba(56, 189, 248, 0.75)', fillStart: 'rgba(56, 189, 248, 0.07)', fillEnd: 'rgba(14, 116, 144, 0)' },
      { stroke: 'rgba(59, 130, 246, 0.70)', fillStart: 'rgba(59, 130, 246, 0.06)', fillEnd: 'rgba(30, 64, 175, 0)' },
      { stroke: 'rgba(99, 102, 241, 0.65)', fillStart: 'rgba(99, 102, 241, 0.06)', fillEnd: 'rgba(67, 56, 202, 0)' },
      { stroke: 'rgba(34, 211, 238, 0.75)', fillStart: 'rgba(34, 211, 238, 0.07)', fillEnd: 'rgba(8, 145, 178, 0)' },
      { stroke: 'rgba(129, 140, 248, 0.70)', fillStart: 'rgba(129, 140, 248, 0.06)', fillEnd: 'rgba(79, 70, 229, 0)' },
      { stroke: 'rgba(14, 165, 233, 0.75)', fillStart: 'rgba(14, 165, 233, 0.07)', fillEnd: 'rgba(2, 132, 199, 0)' }
    ];

    const render = (currTime: number) => {
      if (!isVisible) return;
      animId = requestAnimationFrame(render);

      if (!standingStill) {
        const dt = lastTime > 0 ? Math.min((currTime - lastTime) / 1000, 0.1) : 0.016;
        lastTime = currTime;
        time += dt * speed;
      } else {
        time = 1.6; // Completely stationary constant timestamp
      }

      // Smooth mouse follow
      if (!standingStill && interactive && mouseRef.current.active) {
        mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
        mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;
      } else {
        mouseRef.current.x = width * 0.5;
        mouseRef.current.y = height * 0.5;
      }

      // 1. BASE BACKGROUND: Deep High-Contrast Obsidian Midnight Canvas
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#020612');   // Deepest obsidian slate
      bgGrad.addColorStop(0.5, '#050c1f'); // Midnight navy core
      bgGrad.addColorStop(1, '#02050f');   // Grounding dark slate
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. FOCAL TOP RADIAL GLOW
      const topAura = ctx.createRadialGradient(
        width * 0.5,
        height * 0.05,
        0,
        width * 0.5,
        height * 0.05,
        Math.max(width, height) * 0.6
      );
      topAura.addColorStop(0, `rgba(37, 99, 235, ${0.12 * glowIntensity})`);
      topAura.addColorStop(0.5, `rgba(14, 116, 144, ${0.05 * glowIntensity})`);
      topAura.addColorStop(1, 'rgba(2, 6, 18, 0)');
      ctx.fillStyle = topAura;
      ctx.fillRect(0, 0, width, height);

      // ==========================================
      // VARIANT 1: FLUID CYBERNETIC SILK WAVES
      // ==========================================
      if (variant === 'fluid-waves') {
        const mX = mouseRef.current.x;
        const mY = mouseRef.current.y;
        const count = waveCount;
        const step = Math.max(6, Math.floor(width / 140));

        // Render waves from back to front
        for (let i = 0; i < count; i++) {
          const p = wavePalettes[i % wavePalettes.length];
          // Base vertical placement (fans out gracefully across the mid-to-bottom half)
          const progress = i / (count - 1);
          const baseY = height * 0.35 + progress * (height * 0.58);
          const phase = i * 0.65;
          const amp = (45 + i * 8) * (0.8 + 0.2 * Math.sin(time * 0.4 + i));
          const freq = 0.0022 - i * 0.0001;

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(0, height);

          // Build path along the wave
          for (let x = 0; x <= width + step; x += step) {
            // Multi-harmonic sine waves for fluid silky motion
            const sin1 = Math.sin(x * freq + time * 0.8 + phase) * amp;
            const sin2 = Math.sin(x * freq * 2.2 - time * 0.5 + phase * 1.5) * (amp * 0.35);
            const cos1 = Math.cos(x * freq * 0.5 + time * 0.3) * (amp * 0.25);
            let y = baseY + sin1 + sin2 + cos1;

            // Interactive mouse distortion wave
            if (interactive && mX > -200) {
              const dx = x - mX;
              const dy = baseY - mY;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const maxDist = 240;
              if (dist < maxDist) {
                const force = (1 - dist / maxDist) * 55 * Math.cos(time * 2 + dist * 0.04);
                y += force;
              }
            }

            if (x === 0) {
              ctx.lineTo(0, y);
            } else {
              ctx.lineTo(x, y);
            }
          }

          // Close bottom path for gradient fill
          ctx.lineTo(width, height);
          ctx.closePath();

          // Translucent gradient fill under the wave
          const waveGrad = ctx.createLinearGradient(0, baseY - amp, 0, height);
          waveGrad.addColorStop(0, p.fillStart);
          waveGrad.addColorStop(0.6, p.fillEnd);
          waveGrad.addColorStop(1, 'rgba(2, 6, 18, 0)');
          ctx.fillStyle = waveGrad;
          ctx.fill();

          // Wave crest stroke with crisp luminescence
          ctx.beginPath();
          for (let x = 0; x <= width + step; x += step) {
            const sin1 = Math.sin(x * freq + time * 0.8 + phase) * amp;
            const sin2 = Math.sin(x * freq * 2.2 - time * 0.5 + phase * 1.5) * (amp * 0.35);
            const cos1 = Math.cos(x * freq * 0.5 + time * 0.3) * (amp * 0.25);
            let y = baseY + sin1 + sin2 + cos1;

            if (interactive && mX > -200) {
              const dx = x - mX;
              const dy = baseY - mY;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const maxDist = 240;
              if (dist < maxDist) {
                const force = (1 - dist / maxDist) * 55 * Math.cos(time * 2 + dist * 0.04);
                y += force;
              }
            }

            if (x === 0) {
              ctx.moveTo(0, y);
            } else {
              ctx.lineTo(x, y);
            }
          }

          ctx.strokeStyle = p.stroke;
          ctx.lineWidth = 1.6 + (i === count - 1 ? 0.8 : 0);
          ctx.stroke();
          ctx.restore();
        }
      }

      // ==========================================
      // VARIANT 2: 3D CYBER HORIZON PERSPECTIVE GRID (Vibrant Colors & Rich Texture)
      // ==========================================
      if (variant === 'cyber-horizon') {
        const horizonY = height * 0.44;
        const fov = 340;
        const gridSpacing = 42;
        const gridSpeed = standingStill ? 0 : (time * 50) % gridSpacing;
        const vanishingX = width * 0.5; // Symmetrically locked dead-center: never moves or tilts to cursor

        ctx.save();

        // 1. VIBRANT COSMIC SYNTHWAVE SKY GRADIENT
        const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
        skyGrad.addColorStop(0, '#06020f');   // Deep obsidian space
        skyGrad.addColorStop(0.35, '#19062d'); // Ultraviolet night
        skyGrad.addColorStop(0.68, '#4a044e'); // Deep magenta nebula
        skyGrad.addColorStop(0.88, '#9d174d'); // Warm sunset fuchsia
        skyGrad.addColorStop(1, '#f43f5e');   // Radiant coral sunset line
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, horizonY);

        // 2. TWINKLING MULTI-COLORED SKY STARS
        ctx.save();
        for (let i = 0; i < skyStars.length; i++) {
          const star = skyStars[i];
          const sx = star.xRatio * width;
          const sy = star.yRatio * horizonY;
          const twinkle = standingStill
            ? (0.7 + 0.3 * Math.sin(star.phase))
            : (0.35 + 0.65 * Math.sin(time * star.speed + star.phase));

          ctx.fillStyle = star.color;
          ctx.globalAlpha = Math.max(0.1, Math.min(1, twinkle));
          ctx.beginPath();
          ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
          ctx.fill();

          // Sparkle flare for larger stars
          if (star.size > 1.8 && twinkle > 0.8) {
            ctx.strokeStyle = star.color;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(sx - 3, sy);
            ctx.lineTo(sx + 3, sy);
            ctx.moveTo(sx, sy - 3);
            ctx.lineTo(sx, sy + 3);
            ctx.stroke();
          }
        }
        ctx.restore();

        // 3. RADIANT ATMOSPHERIC HORIZON SUNBURST DOME
        const horizonDomeRadius = Math.max(width, height) * 0.52;
        const horizonDome = ctx.createRadialGradient(
          vanishingX,
          horizonY,
          0,
          vanishingX,
          horizonY,
          horizonDomeRadius
        );
        horizonDome.addColorStop(0, `rgba(244, 63, 94, ${0.32 * glowIntensity})`);
        horizonDome.addColorStop(0.22, `rgba(168, 85, 247, ${0.22 * glowIntensity})`);
        horizonDome.addColorStop(0.48, `rgba(59, 130, 246, ${0.12 * glowIntensity})`);
        horizonDome.addColorStop(1, 'rgba(2, 6, 18, 0)');
        ctx.fillStyle = horizonDome;
        ctx.fillRect(0, 0, width, horizonY + 20);

        // 4. RETRO SYNTHWAVE CYBER SUN (Vibrant Multi-Stop Sunset Gradient)
        const sunRadius = Math.min(width * 0.22, 135);
        ctx.save();

        // Sun Glow Halo
        const sunHalo = ctx.createRadialGradient(
          vanishingX,
          horizonY,
          sunRadius * 0.5,
          vanishingX,
          horizonY,
          sunRadius * 1.35
        );
        sunHalo.addColorStop(0, `rgba(253, 224, 71, ${0.4 * glowIntensity})`);
        sunHalo.addColorStop(0.4, `rgba(244, 63, 94, ${0.25 * glowIntensity})`);
        sunHalo.addColorStop(1, 'rgba(244, 63, 94, 0)');
        ctx.fillStyle = sunHalo;
        ctx.beginPath();
        ctx.arc(vanishingX, horizonY, sunRadius * 1.35, Math.PI, 0, false);
        ctx.fill();

        // Solid Radiant Gradient Semi-Circle Sun
        const sunFill = ctx.createLinearGradient(vanishingX, horizonY - sunRadius, vanishingX, horizonY);
        sunFill.addColorStop(0, '#fef08a');   // Brilliant Golden Yellow
        sunFill.addColorStop(0.25, '#fb923c'); // Neon Coral Orange
        sunFill.addColorStop(0.60, '#ec4899'); // Hot Fuchsia
        sunFill.addColorStop(1, '#8b5cf6');   // Royal Ultraviolet
        ctx.fillStyle = sunFill;
        ctx.beginPath();
        ctx.arc(vanishingX, horizonY, sunRadius, Math.PI, 0, false);
        ctx.fill();

        // Dark Horizontal Retro Laser Slats Cutting the Sun
        const slatCount = 6;
        for (let s = 1; s <= slatCount; s++) {
          const slatY = horizonY - (sunRadius / (slatCount + 1)) * s;
          const slatHeight = 2.5 + (s * 0.8);
          const halfChord = Math.sqrt(Math.max(0, sunRadius * sunRadius - (horizonY - slatY) * (horizonY - slatY)));

          ctx.fillStyle = '#1e0836';
          ctx.fillRect(vanishingX - halfChord, slatY - slatHeight * 0.5, halfChord * 2, slatHeight);
        }

        // Concentric Radar Rings around Sun
        ctx.strokeStyle = `rgba(254, 240, 138, ${0.45 * glowIntensity})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(vanishingX, horizonY, sunRadius, Math.PI, 0, false);
        ctx.stroke();
        ctx.strokeStyle = `rgba(244, 63, 94, ${0.35 * glowIntensity})`;
        ctx.beginPath();
        ctx.arc(vanishingX, horizonY, sunRadius * 1.15, Math.PI, 0, false);
        ctx.stroke();
        ctx.restore();

        // 5. WIREFRAME MOUNTAIN TOPOGRAPHY SILHOUETTE (Left & Right Horizon)
        const drawMountainRange = (isLeft: boolean) => {
          ctx.save();
          const startX = isLeft ? 0 : vanishingX + sunRadius * 0.75;
          const endX = isLeft ? vanishingX - sunRadius * 0.75 : width;
          const rangeW = endX - startX;

          const peaks = isLeft
            ? [
                { x: 0, y: horizonY },
                { x: startX + rangeW * 0.15, y: horizonY - 45 },
                { x: startX + rangeW * 0.32, y: horizonY - 25 },
                { x: startX + rangeW * 0.55, y: horizonY - 70 },
                { x: startX + rangeW * 0.78, y: horizonY - 32 },
                { x: endX, y: horizonY }
              ]
            : [
                { x: startX, y: horizonY },
                { x: startX + rangeW * 0.22, y: horizonY - 35 },
                { x: startX + rangeW * 0.45, y: horizonY - 68 },
                { x: startX + rangeW * 0.68, y: horizonY - 28 },
                { x: startX + rangeW * 0.85, y: horizonY - 48 },
                { x: width, y: horizonY }
              ];

          // Mountain Silhouette Fill
          ctx.beginPath();
          ctx.moveTo(peaks[0].x, peaks[0].y);
          for (let p = 1; p < peaks.length; p++) {
            ctx.lineTo(peaks[p].x, peaks[p].y);
          }
          ctx.lineTo(peaks[peaks.length - 1].x, horizonY);
          ctx.closePath();

          const mGrad = ctx.createLinearGradient(0, horizonY - 70, 0, horizonY);
          mGrad.addColorStop(0, 'rgba(30, 10, 50, 0.95)');
          mGrad.addColorStop(1, 'rgba(8, 3, 18, 0.98)');
          ctx.fillStyle = mGrad;
          ctx.fill();

          // Mountain Wireframe Ridge Lines
          ctx.strokeStyle = `rgba(236, 72, 153, ${0.55 * glowIntensity})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Mountain Internal Wireframe Lattice
          ctx.strokeStyle = `rgba(168, 85, 247, ${0.25 * glowIntensity})`;
          ctx.lineWidth = 1;
          for (let p = 1; p < peaks.length - 1; p++) {
            ctx.beginPath();
            ctx.moveTo(peaks[p].x, peaks[p].y);
            ctx.lineTo(peaks[p].x, horizonY);
            ctx.stroke();

            // Diagonal struts
            ctx.beginPath();
            ctx.moveTo(peaks[p].x, peaks[p].y);
            ctx.lineTo(peaks[p + 1].x, horizonY);
            ctx.stroke();
          }
          ctx.restore();
        };

        drawMountainRange(true);
        drawMountainRange(false);

        // 6. CRISP LASER HORIZON BEAM (Chromatic Spectrum)
        const beamGrad = ctx.createLinearGradient(0, 0, width, 0);
        beamGrad.addColorStop(0, 'rgba(236, 72, 153, 0)');
        beamGrad.addColorStop(0.2, `rgba(236, 72, 153, ${0.6 * glowIntensity})`);
        beamGrad.addColorStop(0.5, `rgba(255, 255, 255, ${0.95 * glowIntensity})`);
        beamGrad.addColorStop(0.8, `rgba(56, 189, 248, ${0.6 * glowIntensity})`);
        beamGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

        ctx.strokeStyle = beamGrad;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(0, horizonY);
        ctx.lineTo(width, horizonY);
        ctx.stroke();

        // 7. MULTI-COLORED 3D PERSPECTIVE GRID FLOOR
        const horizLineCount = 26;
        const vCols = 28;
        const groundStep = 80;

        // 7A. TEXTURED ILLUMINATED RUNWAY TILES (Pulsing Matrix Cells)
        const illuminatedTiles = [
          { c: -3, r: 5, col: 'rgba(236, 72, 153, ' },
          { c: 2, r: 7, col: 'rgba(6, 182, 212, ' },
          { c: -5, r: 9, col: 'rgba(168, 85, 247, ' },
          { c: 4, r: 11, col: 'rgba(244, 63, 94, ' },
          { c: -2, r: 13, col: 'rgba(56, 189, 248, ' },
          { c: 1, r: 15, col: 'rgba(234, 179, 8, ' },
          { c: -4, r: 17, col: 'rgba(192, 132, 252, ' },
          { c: 3, r: 19, col: 'rgba(34, 211, 238, ' }
        ];

        illuminatedTiles.forEach((tile) => {
          const z1 = tile.r * gridSpacing + gridSpeed;
          const z2 = (tile.r + 1) * gridSpacing + gridSpeed;
          const y1 = horizonY + (fov * (height - horizonY)) / (fov + z1);
          const y2 = horizonY + (fov * (height - horizonY)) / (fov + z2);

          if (y1 >= horizonY && y2 <= height) {
            const gx1 = vanishingX + tile.c * groundStep;
            const gx2 = vanishingX + (tile.c + 1) * groundStep;

            const x1Top = vanishingX + (gx1 - vanishingX) * (y1 - horizonY) / (height - horizonY);
            const x2Top = vanishingX + (gx2 - vanishingX) * (y1 - horizonY) / (height - horizonY);
            const x1Bot = vanishingX + (gx1 - vanishingX) * (y2 - horizonY) / (height - horizonY);
            const x2Bot = vanishingX + (gx2 - vanishingX) * (y2 - horizonY) / (height - horizonY);

            const pulse = standingStill 
              ? (0.16 + 0.04 * Math.sin(tile.r * 2 + tile.c)) 
              : (0.12 + 0.08 * Math.sin(time * 2.5 + tile.r + tile.c));
            ctx.fillStyle = `${tile.col}${pulse * glowIntensity})`;
            ctx.beginPath();
            ctx.moveTo(x1Top, y1);
            ctx.lineTo(x2Top, y1);
            ctx.lineTo(x2Bot, y2);
            ctx.lineTo(x1Bot, y2);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = `${tile.col}${pulse * 1.8 * glowIntensity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });

        // 7B. PERSPECTIVE HORIZONTAL GRID LINES (Depth Color Shift)
        for (let i = 1; i <= horizLineCount; i++) {
          const z = (i * gridSpacing + gridSpeed);
          const y = horizonY + (fov * (height - horizonY)) / (fov + z);
          if (y > height || y < horizonY) continue;

          const progress = (y - horizonY) / (height - horizonY);
          const depthAlpha = Math.pow(progress, 1.15) * 0.58 * glowIntensity;

          // Color transition: Hot Pink at horizon -> Electric Violet -> Bright Cyan in foreground
          let lineStroke: string;
          if (progress < 0.35) {
            lineStroke = `rgba(244, 63, 94, ${depthAlpha})`;   // Hot Fuchsia
          } else if (progress < 0.70) {
            lineStroke = `rgba(168, 85, 247, ${depthAlpha})`;  // Electric Violet
          } else {
            lineStroke = `rgba(56, 189, 248, ${depthAlpha})`;  // Electric Cyan
          }

          ctx.strokeStyle = lineStroke;
          ctx.lineWidth = 1.0 + progress * 0.8;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // 7C. CHROMATIC PERSPECTIVE VERTICAL BEAMS
        for (let i = -vCols; i <= vCols; i++) {
          const groundX = vanishingX + i * groundStep;
          const absCol = Math.abs(i);
          const centerDist = absCol / vCols;
          const vAlpha = (1 - centerDist * 0.45) * 0.32 * glowIntensity;

          // Chromatic spectrum: Outer Fuchsia -> Mid Violet -> Inner Sapphire -> Center Cyan -> Center Laser White
          let colStroke: string;
          if (i === 0) {
            colStroke = `rgba(255, 255, 255, ${0.85 * glowIntensity})`; // Center laser
          } else if (absCol <= 3) {
            colStroke = `rgba(34, 211, 238, ${vAlpha * 1.3})`; // Cyan
          } else if (absCol <= 8) {
            colStroke = `rgba(59, 130, 246, ${vAlpha * 1.15})`; // Sapphire
          } else if (absCol <= 16) {
            colStroke = `rgba(168, 85, 247, ${vAlpha * 1.1})`; // Violet
          } else {
            colStroke = `rgba(236, 72, 153, ${vAlpha})`; // Fuchsia
          }

          ctx.strokeStyle = colStroke;
          ctx.lineWidth = i === 0 ? 1.8 : 1.0;
          ctx.beginPath();
          ctx.moveTo(vanishingX, horizonY);
          ctx.lineTo(groundX, height);
          ctx.stroke();

          // 7D. MULTI-COLORED DATA PACKETS (Cyan, Pink, Gold)
          if (absCol % 2 === 1 && absCol <= 18) {
            const packetCycle = standingStill 
              ? ((absCol * 0.28) % 1) 
              : ((time * 0.85 + absCol * 0.28) % 1);
            const packetZ = (1 - packetCycle) * 700;
            const packetY = horizonY + (fov * (height - horizonY)) / (fov + packetZ);
            if (packetY >= horizonY && packetY <= height) {
              const packetX = vanishingX + (groundX - vanishingX) * (packetY - horizonY) / (height - horizonY);
              const packetAlpha = packetCycle * 0.85 * glowIntensity;
              const packetSize = 1.5 + packetCycle * 2.8;

              const pktColors = ['#ffffff', '#38bdf8', '#f472b6', '#facc15'];
              const pktColor = pktColors[absCol % pktColors.length];

              ctx.fillStyle = pktColor;
              ctx.globalAlpha = packetAlpha;
              ctx.beginPath();
              ctx.arc(packetX, packetY, packetSize, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = pktColor;
              ctx.globalAlpha = packetAlpha * 0.45;
              ctx.beginPath();
              ctx.arc(packetX, packetY, packetSize * 2.2, 0, Math.PI * 2);
              ctx.fill();
              ctx.globalAlpha = 1.0;
            }
          }
        }

        ctx.restore();
      }

      // ==========================================
      // VARIANT 3: HEXAGONAL ZERO-TRUST DEFENSE SHIELD
      // ==========================================
      if (variant === 'hex-shield') {
        const hexRadius = 42;
        const hexHeight = hexRadius * Math.sqrt(3);
        const hCols = Math.ceil(width / (hexRadius * 1.5)) + 1;
        const hRows = Math.ceil(height / hexHeight) + 1;
        const mX = mouseRef.current.x;
        const mY = mouseRef.current.y;

        ctx.save();
        ctx.lineWidth = 1;

        for (let r = 0; r < hRows; r++) {
          const cy = r * hexHeight + (r % 2 === 1 ? hexHeight * 0.5 : 0);
          for (let c = 0; c < hCols; c++) {
            const cx = c * (hexRadius * 1.5);

            let alpha = 0.05;
            let strokeColor = 'rgba(56, 189, 248, ';
            let fillColor = 'transparent';

            // Proximity to mouse
            if (mX > -200) {
              const dx = cx - mX;
              const dy = cy - mY;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 180) {
                const p = 1 - dist / 180;
                alpha = 0.05 + p * 0.45 * glowIntensity;
                strokeColor = 'rgba(125, 211, 252, ';
                fillColor = `rgba(56, 189, 248, ${p * 0.08 * glowIntensity})`;
              }
            }

            // Draw Hexagon
            ctx.beginPath();
            for (let a = 0; a < 6; a++) {
              const angle = (Math.PI / 3) * a;
              const hx = cx + hexRadius * 0.9 * Math.cos(angle);
              const hy = cy + hexRadius * 0.9 * Math.sin(angle);
              if (a === 0) ctx.moveTo(hx, hy);
              else ctx.lineTo(hx, hy);
            }
            ctx.closePath();

            if (fillColor !== 'transparent') {
              ctx.fillStyle = fillColor;
              ctx.fill();
            }

            ctx.strokeStyle = `${strokeColor}${alpha})`;
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // 3. FLOATING AMBIENT CYBER DUST PARTICLES
      ctx.save();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!standingStill) {
          p.x += p.vx;
          p.y += p.vy;

          // Wrap around bounds
          if (p.y < 0) p.y = height;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 4. PERIMETER EDGE VIGNETTE (Keeps focus crisp and readable)
      const vignette = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        Math.min(width, height) * 0.45,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.85
      );
      vignette.addColorStop(0, 'rgba(2, 6, 18, 0)');
      vignette.addColorStop(0.7, 'rgba(2, 6, 18, 0.35)');
      vignette.addColorStop(1, 'rgba(2, 6, 18, 0.88)');

      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      // 5. TACTILE TEXTURE: ULTRA-FINE CRT MICRO-SCANLINES
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
      for (let y = 0; y < height; y += 4) {
        ctx.fillRect(0, y, width, 1.2);
      }
      ctx.restore();

      // 6. TACTILE TEXTURE: CINEMATIC FILM GRAIN NOISE PATTERN
      if (noisePattern) {
        ctx.save();
        ctx.fillStyle = noisePattern;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }
    };

    resize();
    window.addEventListener('resize', resize);
    lastTime = performance.now();
    render(performance.now());

    return () => {
      if (animId !== 0) cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      if (interactive && !standingStill) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [speed, waveCount, interactive, glowIntensity, variant, standingStill]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{
        width: '100vw',
        height: '100vh',
        background: '#020612'
      }}
      aria-hidden="true"
    />
  );
};

export default CyberKineticBackground;
