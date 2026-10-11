import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface LaserFlowProps {
  color?: string;
  horizontalBeamOffset?: number;
  verticalBeamOffset?: number;
  horizontalSizing?: number;
  wispDensity?: number;
  wispIntensity?: number;
  flowSpeed?: number;
  flowStrength?: number;
  fogIntensity?: number;
  fogScale?: number;
  fogFallSpeed?: number;
  decay?: number;
  falloffStart?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const LaserFlow: React.FC<LaserFlowProps> = ({
  color = '#38bdf8',
  horizontalBeamOffset = 0.0,
  verticalBeamOffset = 0.0,
  horizontalSizing = 1.19,
  wispDensity = 2.3,
  wispIntensity = 16.9,
  flowSpeed = 0.55,
  flowStrength = 0.19,
  fogIntensity = 0.99,
  fogScale = 0.26,
  fogFallSpeed = 1.22,
  decay = 1.52,
  falloffStart = 1.1,
  className = '',
  style = {}
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(1.0); // 1.0 DPR slashes GPU heat dramatically
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);
    } catch {
      return;
    }

    const hexToRgb = (hex: string) => {
      const parsed = parseInt(hex.replace('#', ''), 16);
      return new THREE.Vector3(
        ((parsed >> 16) & 255) / 255,
        ((parsed >> 8) & 255) / 255,
        (parsed & 255) / 255
      );
    };

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(width, height) },
      uColor: { value: hexToRgb(color) },
      uHOffset: { value: horizontalBeamOffset },
      uVOffset: { value: verticalBeamOffset },
      uHSizing: { value: horizontalSizing },
      uWispDensity: { value: wispDensity },
      uWispIntensity: { value: wispIntensity },
      uFlowSpeed: { value: flowSpeed },
      uFlowStrength: { value: flowStrength },
      uFogIntensity: { value: fogIntensity },
      uFogScale: { value: fogScale },
      uFogFallSpeed: { value: fogFallSpeed },
      uDecay: { value: decay },
      uFalloffStart: { value: falloffStart }
    };

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec3 uColor;
      uniform float uHOffset;
      uniform float uVOffset;
      uniform float uHSizing;
      uniform float uWispDensity;
      uniform float uWispIntensity;
      uniform float uFlowSpeed;
      uniform float uFlowStrength;
      uniform float uFogIntensity;
      uniform float uFogScale;
      uniform float uFogFallSpeed;
      uniform float uDecay;
      uniform float uFalloffStart;

      varying vec2 vUv;

      // Noise Helpers
      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
          f.y
        );
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy / uResolution.xy) * 2.0 - 1.0;
        uv.x *= uResolution.x / uResolution.y;

        // Apply Horizontal & Vertical beam centers
        uv.x -= uHOffset;
        uv.y -= uVOffset;

        // Coordinate scaling
        uv.x /= uHSizing;

        // 1. Central Razor Laser Beam
        float distToBeam = abs(uv.y);
        float core = exp(-distToBeam * (28.0 * uDecay));
        float halo = exp(-distToBeam * (6.5 * uDecay)) * 0.45;

        // 2. Flowing Cyber Fog Wisps
        vec2 flowUv = uv * uFogScale;
        flowUv.x += uTime * (uFlowSpeed * 0.4);
        flowUv.y += uTime * (uFogFallSpeed * 0.15);

        float fogNoise1 = noise(flowUv * 3.5);
        float fogNoise2 = noise(flowUv * 7.0 - uTime * 0.2);
        float combinedFog = (fogNoise1 * 0.65 + fogNoise2 * 0.35) * uFogIntensity;

        // Wisp streams
        float wisps = pow(noise(vec2(uv.x * uWispDensity - uTime * uFlowSpeed, uv.y * 12.0)), 3.0) * (uWispIntensity * 0.05);

        // Falloff
        float falloff = smoothstep(uFalloffStart, 0.0, abs(uv.x));
        float illuminatedFog = combinedFog * halo * 1.8 * falloff;
        core *= falloff;
        halo *= falloff;
        wisps *= falloff;

        float totalIntensity = core + halo + illuminatedFog + wisps;
        
        // Color tinting: Hot white laser core + chromatic bloom in uColor
        vec3 finalColor = mix(uColor, vec3(1.0, 1.0, 1.0), clamp(core * 0.6, 0.0, 1.0));
        finalColor += uColor * (halo + illuminatedFog + wisps);

        // Alpha transparency blend
        float alpha = clamp(totalIntensity * 0.9, 0.0, 1.0);

        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let animationFrameId = 0;
    let clock = new THREE.Clock();
    let isVisible = false;
    let isPageVisible = !document.hidden;

    const animate = () => {
      if (!isVisible || !isPageVisible) {
        animationFrameId = 0;
        return;
      }
      uniforms.uTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    const startAnimate = () => {
      if (isVisible && isPageVisible && animationFrameId === 0) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    const stopAnimate = () => {
      if (animationFrameId !== 0) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
      }
    };

    // IntersectionObserver to pause rendering when scrolled off-screen
    const io = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      isVisible ? startAnimate() : stopAnimate();
    }, { threshold: 0.05 });
    io.observe(container);

    const onVisibilityChange = () => {
      isPageVisible = !document.hidden;
      isPageVisible ? startAnimate() : stopAnimate();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      renderer.setSize(newWidth, newHeight);
      uniforms.uResolution.value.set(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      stopAnimate();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [
    color,
    horizontalBeamOffset,
    verticalBeamOffset,
    horizontalSizing,
    wispDensity,
    wispIntensity,
    flowSpeed,
    flowStrength,
    fogIntensity,
    fogScale,
    fogFallSpeed,
    decay,
    falloffStart
  ]);

  return (
    <div
      ref={mountRef}
      className={`laser-flow-container ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'hidden',
        ...style
      }}
    />
  );
};

export default LaserFlow;
