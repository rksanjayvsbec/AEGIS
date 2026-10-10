import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Radar,
  Palette,
  ChevronDown,
  Check,
  Crosshair
} from 'lucide-react';

export type GlobeStyle = 'tactical_stealth' | 'cyber_holo' | 'tron_synthwave' | 'realistic_earth';

export interface StyleConfig {
  id: GlobeStyle;
  name: string;
  shortName: string;
  tagline: string;
  badgeTag: string;
  badgeClass: string;
  badgeActive: string;
  badgeIdle: string;
  primaryHex: string;
  secondaryHex: string;
  sphereColor: number;
  sphereRoughness: number;
  sphereMetalness: number;
  atmosphereColor: number;
  atmosphereOpacity: number;
  coronaColor: number;
  coronaOpacity: number;
  gridColor: number;
  gridOpacity: number;
  equatorColor: number;
  equatorOpacity: number;
  radarColor: number;
  starColor: number;
  defaultArcColor: number;
  vpnArcColor: number;
  attackArcColor: number;
  pulseColor: number;
  nodeCompliantColor: number;
  nodeWarningColor: number;
  nodeCriticalColor: number;
}

export const STYLE_CONFIGS: Record<GlobeStyle, StyleConfig> = {
  tactical_stealth: {
    id: 'tactical_stealth',
    name: 'Tactical Stealth Matrix',
    shortName: 'Tactical Matrix',
    tagline: 'MIL-SPEC OBSIDIAN // 360° ACTIVE DEFENSE RADAR',
    badgeTag: 'SEC-OPS // TACTICAL',
    badgeClass: 'border-emerald-500/40 text-emerald-300',
    badgeActive: 'bg-emerald-950/95 border-2 border-emerald-400 text-white shadow-[0_0_25px_rgba(16,185,129,0.7)]',
    badgeIdle: 'bg-slate-950/90 border border-emerald-500/35 text-slate-200 hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.35)]',
    primaryHex: '#10b981',
    secondaryHex: '#34d399',
    sphereColor: 0x03070b,
    sphereRoughness: 0.65,
    sphereMetalness: 0.25,
    atmosphereColor: 0x10b981,
    atmosphereOpacity: 0.28,
    coronaColor: 0x059669,
    coronaOpacity: 0.12,
    gridColor: 0x10b981,
    gridOpacity: 0.2,
    equatorColor: 0x34d399,
    equatorOpacity: 0.5,
    radarColor: 0x10b981,
    starColor: 0x6ee7b7,
    defaultArcColor: 0x10b981,
    vpnArcColor: 0x06b6d4,
    attackArcColor: 0xef4444,
    pulseColor: 0x34d399,
    nodeCompliantColor: 0x10b981,
    nodeWarningColor: 0xf59e0b,
    nodeCriticalColor: 0xef4444
  },
  cyber_holo: {
    id: 'cyber_holo',
    name: 'Holographic Cyber SOC',
    shortName: 'Cyber Holo',
    tagline: 'AZURE VOID // HOLOGRAPHIC DIGITAL TWIN',
    badgeTag: 'SOC-CORE // HOLOGRAPHIC',
    badgeClass: 'border-sky-500/40 text-sky-300',
    badgeActive: 'bg-sky-950/95 border-2 border-sky-400 text-white shadow-[0_0_25px_rgba(56,189,248,0.7)]',
    badgeIdle: 'bg-slate-950/90 border border-sky-500/35 text-slate-200 hover:border-sky-400 hover:shadow-[0_0_15px_rgba(56,189,248,0.35)]',
    primaryHex: '#38bdf8',
    secondaryHex: '#0284c7',
    sphereColor: 0x020817,
    sphereRoughness: 0.4,
    sphereMetalness: 0.3,
    atmosphereColor: 0x38bdf8,
    atmosphereOpacity: 0.26,
    coronaColor: 0x0284c7,
    coronaOpacity: 0.12,
    gridColor: 0x38bdf8,
    gridOpacity: 0.22,
    equatorColor: 0x38bdf8,
    equatorOpacity: 0.45,
    radarColor: 0x38bdf8,
    starColor: 0xe0f2fe,
    defaultArcColor: 0x38bdf8,
    vpnArcColor: 0xa855f7,
    attackArcColor: 0xef4444,
    pulseColor: 0x38bdf8,
    nodeCompliantColor: 0x34d399,
    nodeWarningColor: 0xfbbf24,
    nodeCriticalColor: 0xf43f5e
  },
  tron_synthwave: {
    id: 'tron_synthwave',
    name: 'Tron Synthwave',
    shortName: 'Tron Neon',
    tagline: 'NEON CYBER // ULTRAVIOLET GRID',
    badgeTag: 'NEON-TRON // SYNTHWAVE',
    badgeClass: 'border-fuchsia-500/40 text-fuchsia-300',
    badgeActive: 'bg-fuchsia-950/95 border-2 border-fuchsia-400 text-white shadow-[0_0_25px_rgba(232,121,249,0.7)]',
    badgeIdle: 'bg-slate-950/90 border border-fuchsia-500/35 text-slate-200 hover:border-fuchsia-400 hover:shadow-[0_0_15px_rgba(232,121,249,0.35)]',
    primaryHex: '#e879f9',
    secondaryHex: '#06b6d4',
    sphereColor: 0x05020a,
    sphereRoughness: 0.3,
    sphereMetalness: 0.4,
    atmosphereColor: 0xd946ef,
    atmosphereOpacity: 0.28,
    coronaColor: 0x7c3aed,
    coronaOpacity: 0.14,
    gridColor: 0xe879f9,
    gridOpacity: 0.22,
    equatorColor: 0x06b6d4,
    equatorOpacity: 0.55,
    radarColor: 0xd946ef,
    starColor: 0xf5d0fe,
    defaultArcColor: 0xe879f9,
    vpnArcColor: 0x06b6d4,
    attackArcColor: 0xff0055,
    pulseColor: 0xf472b6,
    nodeCompliantColor: 0x06b6d4,
    nodeWarningColor: 0xfbbf24,
    nodeCriticalColor: 0xff0055
  },
  realistic_earth: {
    id: 'realistic_earth',
    name: 'Photorealistic NASA Earth',
    shortName: 'NASA Earth',
    tagline: 'NASA BLUE MARBLE // GEOGRAPHIC RECON',
    badgeTag: 'NASA // SATELLITE',
    badgeClass: 'border-sky-500/40 text-sky-300',
    badgeActive: 'bg-sky-950/95 border-2 border-sky-400 text-white shadow-[0_0_25px_rgba(56,189,248,0.7)]',
    badgeIdle: 'bg-slate-950/90 border border-slate-800 text-slate-200 hover:border-sky-500/50',
    primaryHex: '#38bdf8',
    secondaryHex: '#0ea5e9',
    sphereColor: 0x0a1628,
    sphereRoughness: 0.52,
    sphereMetalness: 0.08,
    atmosphereColor: 0x38bdf8,
    atmosphereOpacity: 0.22,
    coronaColor: 0x0284c7,
    coronaOpacity: 0.08,
    gridColor: 0x38bdf8,
    gridOpacity: 0.12,
    equatorColor: 0x38bdf8,
    equatorOpacity: 0.38,
    radarColor: 0x38bdf8,
    starColor: 0xe0f2fe,
    defaultArcColor: 0x38bdf8,
    vpnArcColor: 0xc084fc,
    attackArcColor: 0xef4444,
    pulseColor: 0x38bdf8,
    nodeCompliantColor: 0x34d399,
    nodeWarningColor: 0xfbbf24,
    nodeCriticalColor: 0xf43f5e
  }
};

export interface GlobeNode {
  id: string;
  name: string;
  ip: string;
  role: string;
  vendor: string;
  model: string;
  score: number;
  status: 'compliant' | 'warning' | 'critical' | 'hostile' | 'isolated';
  traffic: string;
  vlan: string;
  vlanId: number;
  zone: string;
  lat: number;
  lon: number;
  x?: number;
  y?: number;
  openPorts: string[];
  vulnerabilities: string[];
  interfaces: Array<{
    name: string;
    ip: string;
    status: string;
    speed: string;
    mtu: number;
    mac: string;
  }>;
  neighbors: Array<{
    device: string;
    localPort: string;
    remotePort: string;
    protocol: string;
  }>;
  remediationCommands: string[];
  recordId?: string;
}

export interface GlobeConnection {
  id: string;
  from: string;
  to: string;
  fromPort: string;
  toPort: string;
  media: string;
  speed: string;
  bandwidth: string;
  type: 'normal' | 'secure' | 'vpn' | 'attack' | 'hostile';
  latency: string;
  protocol: string;
  isEncrypted: boolean;
  saturation: number;
}

export interface CyberGlobe3DProps {
  nodes: GlobeNode[];
  connections: GlobeConnection[];
  selectedNode: GlobeNode | null;
  selectedConnection: GlobeConnection | null;
  onSelectNode: (node: GlobeNode | null) => void;
  onSelectConnection: (conn: GlobeConnection | null) => void;
  isSimulatingPackets?: boolean;
  isScanning?: boolean;
  isRogueIsolated?: boolean;
  viewMode?: 'all' | 'threats' | 'heatmap' | 'vlans';
  showPortLabels?: boolean;
  showBandwidthPills?: boolean;
  className?: string;
  initialStyle?: GlobeStyle;
  onStyleChange?: (style: GlobeStyle) => void;
}

interface ProjectedNodeBadge {
  node: GlobeNode;
  screenX: number;
  screenY: number;
  opacity: number;
  scale: number;
  isVisible: boolean;
}

// ==========================================
// 🎨 PROCEDURAL TACTICAL MATRIX TEXTURE BUILDER
// ==========================================
function buildTacticalMatrixTexture(
  style: GlobeStyle,
  baseImg: HTMLImageElement | null
): THREE.CanvasTexture {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const isTactical = style === 'tactical_stealth';
  const isHolo = style === 'cyber_holo';

  // 1. Deep Matte Obsidian Background
  ctx.fillStyle = isTactical ? '#020509' : isHolo ? '#020617' : '#05020c';
  ctx.fillRect(0, 0, width, height);

  // Subtle coordinate grid background lines
  ctx.strokeStyle = isTactical
    ? 'rgba(16, 185, 129, 0.08)'
    : isHolo
    ? 'rgba(56, 189, 248, 0.08)'
    : 'rgba(232, 121, 249, 0.08)';
  ctx.lineWidth = 1;

  // Horizontal lat lines every 15 degrees
  for (let y = 0; y <= height; y += height / 12) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Vertical lon lines every 15 degrees
  for (let x = 0; x <= width; x += width / 24) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Equator Highlight
  ctx.strokeStyle = isTactical
    ? 'rgba(52, 211, 153, 0.5)'
    : isHolo
    ? 'rgba(56, 189, 248, 0.5)'
    : 'rgba(6, 182, 212, 0.6)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  // Tropic of Cancer & Capricorn dashed lines
  ctx.save();
  ctx.setLineDash([8, 8]);
  ctx.strokeStyle = isTactical
    ? 'rgba(16, 185, 129, 0.3)'
    : isHolo
    ? 'rgba(56, 189, 248, 0.3)'
    : 'rgba(217, 70, 239, 0.35)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, ((90 - 23.5) / 180) * height);
  ctx.lineTo(width, ((90 - 23.5) / 180) * height);
  ctx.moveTo(0, ((90 + 23.5) / 180) * height);
  ctx.lineTo(width, ((90 + 23.5) / 180) * height);
  ctx.stroke();
  ctx.restore();

  // Tactical Monospace HUD Labels on Map
  ctx.fillStyle = isTactical
    ? 'rgba(52, 211, 153, 0.45)'
    : isHolo
    ? 'rgba(56, 189, 248, 0.45)'
    : 'rgba(232, 121, 249, 0.5)';
  ctx.font = 'bold 15px monospace';

  // Latitude Labels
  const latLabels = [
    { text: '+60° N // NORAD DEFENSE GRID', y: (30 / 180) * height },
    { text: '+30° N // SECTOR ALPHA PACIFIC', y: (60 / 180) * height },
    { text: '00° EQUATORIAL TRUNK // SEC-OPS', y: height / 2 - 8 },
    { text: '-30° S // SECTOR BRAVO ATLANTIC', y: (120 / 180) * height },
    { text: '-60° S // ANTARCTIC SENTINEL', y: (150 / 180) * height }
  ];

  latLabels.forEach(({ text, y }) => {
    ctx.fillText(text, 24, y);
    ctx.fillText(text, width / 2 + 24, y);
  });

  // Longitude Labels along Equator
  const lonLabels = ['180° W', '120° W', '060° W', '000° GMT', '060° E', '120° E', '180° E'];
  lonLabels.forEach((txt, idx) => {
    const x = (idx / (lonLabels.length - 1)) * (width - 140) + 40;
    ctx.fillText(txt, x, height / 2 + 22);
  });

  // Crosshair reticles '+' at 30° intersections
  for (let latDeg = -60; latDeg <= 60; latDeg += 30) {
    const y = ((90 - latDeg) / 180) * height;
    for (let lonDeg = -180; lonDeg <= 180; lonDeg += 30) {
      const x = ((lonDeg + 180) / 360) * width;
      ctx.strokeStyle = isTactical
        ? 'rgba(52, 211, 153, 0.5)'
        : isHolo
        ? 'rgba(56, 189, 248, 0.5)'
        : 'rgba(232, 121, 249, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x - 5, y);
      ctx.lineTo(x + 5, y);
      ctx.moveTo(x, y - 5);
      ctx.lineTo(x, y + 5);
      ctx.stroke();
    }
  }

  // 2. Continental Matrix Dot Sampling from Satellite Map
  if (baseImg) {
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 512;
    sampleCanvas.height = 256;
    const sampleCtx = sampleCanvas.getContext('2d');
    if (sampleCtx) {
      sampleCtx.drawImage(baseImg, 0, 0, 512, 256);
      const imgData = sampleCtx.getImageData(0, 0, 512, 256).data;

      const stepX = 2; // sample step in 512
      const stepY = 2; // sample step in 256

      for (let sy = 0; sy < 256; sy += stepY) {
        for (let sx = 0; sx < 512; sx += stepX) {
          const idx = (sy * 512 + sx) * 4;
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];

          // Is it landmass or clouds?
          const isLand =
            (r > 42 && g > 46) ||
            (r > b + 12 && g > 40) ||
            (r > 130 && g > 130 && b > 130);

          const targetX = (sx / 512) * width;
          const targetY = (sy / 256) * height;

          if (isLand) {
            let dotColor: string;
            if (isTactical) {
              const rand = (sx * 7 + sy * 13) % 10;
              dotColor = rand > 7 ? '#34d399' : rand > 3 ? '#10b981' : '#059669';
            } else if (isHolo) {
              const rand = (sx * 7 + sy * 13) % 10;
              dotColor = rand > 7 ? '#38bdf8' : rand > 3 ? '#0ea5e9' : '#0284c7';
            } else {
              const rand = (sx * 7 + sy * 13) % 10;
              dotColor = rand > 7 ? '#f472b6' : rand > 3 ? '#e879f9' : '#c084fc';
            }

            ctx.fillStyle = dotColor;
            ctx.beginPath();
            ctx.arc(targetX, targetY, 1.9, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Faint tactical grid dots over oceans
            if (sx % 4 === 0 && sy % 4 === 0) {
              ctx.fillStyle = isTactical
                ? 'rgba(16, 185, 129, 0.09)'
                : isHolo
                ? 'rgba(56, 189, 248, 0.08)'
                : 'rgba(217, 70, 239, 0.08)';
              ctx.fillRect(targetX - 0.75, targetY - 0.75, 1.5, 1.5);
            }
          }
        }
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

// ==========================================
// 🛰️ RADAR SWEEP FAN GEOMETRY BUILDER
// ==========================================
function createRadarFanGeometry(
  radius: number,
  slices = 10,
  segments = 36,
  sweepAngleRad = (Math.PI / 180) * 28
): THREE.BufferGeometry {
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  for (let s = 0; s <= slices; s++) {
    const angle = -(s / slices) * sweepAngleRad;
    const factor = 1 - Math.pow(s / slices, 0.65); // Trailing fadeout

    for (let i = 0; i <= segments; i++) {
      const phi = (i / segments) * Math.PI;
      const y = radius * Math.cos(phi);
      const radH = radius * Math.sin(phi);
      const x = radH * Math.sin(angle);
      const z = radH * Math.cos(angle);

      positions.push(x, y, z);
      // Vertex colors (Green / Theme tint fading to black at trailing edge)
      colors.push(0.15 * factor, 0.85 * factor, 0.45 * factor);
    }
  }

  for (let s = 0; s < slices; s++) {
    for (let i = 0; i < segments; i++) {
      const a = s * (segments + 1) + i;
      const b = (s + 1) * (segments + 1) + i;
      const c = (s + 1) * (segments + 1) + (i + 1);
      const d = s * (segments + 1) + (i + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// ==========================================
// 🌐 MAIN 3D CYBER GLOBE COMPONENT
// ==========================================
export const CyberGlobe3D: React.FC<CyberGlobe3DProps> = ({
  nodes,
  connections,
  selectedNode,
  selectedConnection,
  onSelectNode,
  onSelectConnection,
  isSimulatingPackets = true,
  isScanning = false,
  isRogueIsolated = false,
  viewMode = 'all',
  showPortLabels = false,
  showBandwidthPills = false,
  className = '',
  initialStyle,
  onStyleChange
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active Globe Style State (Default: Tactical Stealth Matrix)
  const [globeStyle, setGlobeStyle] = useState<GlobeStyle>(() => {
    if (initialStyle) return initialStyle;
    const saved = localStorage.getItem('aegis_globe_style') as GlobeStyle;
    return saved && STYLE_CONFIGS[saved] ? saved : 'tactical_stealth';
  });

  const [styleMenuOpen, setStyleMenuOpen] = useState(false);
  const [isRadarActive, setIsRadarActive] = useState<boolean>(() => {
    return localStorage.getItem('aegis_globe_radar') !== 'false';
  });

  const isRadarActiveRef = useRef<boolean>(true);
  isRadarActiveRef.current = isRadarActive;

  const currentStyleConfig = STYLE_CONFIGS[globeStyle] || STYLE_CONFIGS.tactical_stealth;

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const arcsGroupRef = useRef<THREE.Group | null>(null);
  const pulsesGroupRef = useRef<THREE.Group | null>(null);
  const nodeMarkersGroupRef = useRef<THREE.Group | null>(null);
  
  // Dynamic Mesh References for Live Style Transitions
  const sphereMeshRef = useRef<THREE.Mesh | null>(null);
  const sphereMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const atmosphereMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const coronaMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const gridMatRef = useRef<THREE.LineBasicMaterial | null>(null);
  const equatorMatRef = useRef<THREE.LineBasicMaterial | null>(null);
  const starMatRef = useRef<THREE.PointsMaterial | null>(null);
  
  // Tactical Radar Sweep Objects
  const radarSweepGroupRef = useRef<THREE.Group | null>(null);
  const polarRingsGroupRef = useRef<THREE.Group | null>(null);
  const sonarPingMeshRef = useRef<THREE.Mesh | null>(null);
  const scanRingRef = useRef<THREE.Mesh | null>(null);

  // Texture Caches
  const baseImgRef = useRef<HTMLImageElement | null>(null);
  const rawEarthTextureRef = useRef<THREE.Texture | null>(null);
  const matrixTexturesCacheRef = useRef<Record<string, THREE.CanvasTexture>>({});

  // Auto-Spin & Interaction State
  const [autoSpin, setAutoSpin] = useState<boolean>(true);
  const autoSpinRef = useRef<boolean>(true);
  autoSpinRef.current = autoSpin;

  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });

  // 2D Projected Badges State for Crystal-Clear Typography
  const [projectedBadges, setProjectedBadges] = useState<ProjectedNodeBadge[]>([]);

  // Convert Latitude / Longitude to 3D Sphere Vector
  const latLongToVector3 = useCallback((lat: number, lon: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }, []);

  // Handle Style Switch
  const handleSelectStyle = (newStyle: GlobeStyle) => {
    setGlobeStyle(newStyle);
    localStorage.setItem('aegis_globe_style', newStyle);
    setStyleMenuOpen(false);
    if (onStyleChange) onStyleChange(newStyle);
  };

  const handleToggleRadar = () => {
    const next = !isRadarActive;
    setIsRadarActive(next);
    localStorage.setItem('aegis_globe_radar', String(next));
  };

  // Close dropdown menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('#globe-style-menu-container')) {
        setStyleMenuOpen(false);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // ==========================================
  // 1. INITIALIZE THREE.JS SCENE & GLOBE HIERARCHY
  // ==========================================
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || 1000;
    const height = container.clientHeight || 760;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 1, 3200);
    camera.position.set(0, 40, 520);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // 4. Master Globe Rotation Group
    const globeGroup = new THREE.Group();
    globeGroup.rotation.x = 0.12;
    globeGroupRef.current = globeGroup;
    scene.add(globeGroup);

    // 5. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.6);
    sunLight.position.set(450, 250, 450);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x34d399, 0.9);
    rimLight.position.set(-400, -200, -400);
    scene.add(rimLight);

    // 6. 🌍 MASTER GLOBE SPHERE
    const globeRadius = 185;
    const sphereGeo = new THREE.SphereGeometry(globeRadius, 64, 64);

    // Initial procedural matrix texture for tactical mode
    const initialMatrixTex = buildTacticalMatrixTexture(globeStyle, null);
    matrixTexturesCacheRef.current[globeStyle] = initialMatrixTex;

    const sphereMat = new THREE.MeshStandardMaterial({
      map: initialMatrixTex,
      roughness: currentStyleConfig.sphereRoughness,
      metalness: currentStyleConfig.sphereMetalness,
      color: 0xffffff
    });
    sphereMatRef.current = sphereMat;

    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    sphereMeshRef.current = sphereMesh;
    globeGroup.add(sphereMesh);

    // Load NASA Blue Marble Image & Raw Texture asynchronously
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('/earth-blue-marble.jpg', (rawTex) => {
      rawTex.colorSpace = THREE.SRGBColorSpace;
      rawTex.anisotropy = 8;
      rawEarthTextureRef.current = rawTex;

      // Also create an Image element to sample landmass coordinates for dot matrix
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        baseImgRef.current = img;
        // Generate high-resolution continental matrix texture
        const updatedMatrixTex = buildTacticalMatrixTexture(globeStyle, img);
        matrixTexturesCacheRef.current[globeStyle] = updatedMatrixTex;
        
        if (sphereMatRef.current && globeStyle !== 'realistic_earth') {
          sphereMatRef.current.map = updatedMatrixTex;
          sphereMatRef.current.needsUpdate = true;
        }
      };
      img.src = '/earth-blue-marble.jpg';
    });

    // 7. Luminous Rayleigh Scattering Atmospheric Halo
    const atmosphereGeo = new THREE.SphereGeometry(globeRadius * 1.025, 48, 48);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: currentStyleConfig.atmosphereColor,
      transparent: true,
      opacity: currentStyleConfig.atmosphereOpacity,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    atmosphereMatRef.current = atmosphereMat;
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);

    const coronaGeo = new THREE.SphereGeometry(globeRadius * 1.10, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: currentStyleConfig.coronaColor,
      transparent: true,
      opacity: currentStyleConfig.coronaOpacity,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    coronaMatRef.current = coronaMat;
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    globeGroup.add(coronaMesh);

    // 8. Spherical Latitude & Longitude Coordinate Lines
    const gridMat = new THREE.LineBasicMaterial({
      color: currentStyleConfig.gridColor,
      transparent: true,
      opacity: currentStyleConfig.gridOpacity,
      blending: THREE.AdditiveBlending
    });
    gridMatRef.current = gridMat;

    const equatorMat = new THREE.LineBasicMaterial({
      color: currentStyleConfig.equatorColor,
      transparent: true,
      opacity: currentStyleConfig.equatorOpacity,
      blending: THREE.AdditiveBlending
    });
    equatorMatRef.current = equatorMat;

    // Parallels (Latitude Rings)
    [-60, -40, -20, 0, 20, 40, 60].forEach((lat) => {
      const rad = (lat * Math.PI) / 180;
      const y = globeRadius * Math.sin(rad);
      const ringRadius = globeRadius * Math.cos(rad);
      const ringGeo = new THREE.BufferGeometry();
      const points: THREE.Vector3[] = [];
      const segments = 64;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(ringRadius * Math.cos(theta), y, ringRadius * Math.sin(theta)));
      }
      ringGeo.setFromPoints(points);
      const line = new THREE.LineLoop(ringGeo, lat === 0 ? equatorMat : gridMat);
      globeGroup.add(line);
    });

    // Meridians (Longitude Lines)
    for (let i = 0; i < 12; i++) {
      const meridianGeo = new THREE.BufferGeometry();
      const points: THREE.Vector3[] = [];
      const segments = 64;
      const lon = (i * 30 * Math.PI) / 180;
      for (let j = 0; j <= segments; j++) {
        const theta = (j / segments) * Math.PI * 2;
        const x = globeRadius * Math.sin(theta) * Math.cos(lon);
        const z = globeRadius * Math.sin(theta) * Math.sin(lon);
        const y = globeRadius * Math.cos(theta);
        points.push(new THREE.Vector3(x, y, z));
      }
      meridianGeo.setFromPoints(points);
      const line = new THREE.LineLoop(meridianGeo, gridMat);
      globeGroup.add(line);
    }

    // 9. 🛰️ 3D ROTATING RADAR SWEEP BEAM (Military Sonar Fan)
    const radarSweepGroup = new THREE.Group();
    radarSweepGroupRef.current = radarSweepGroup;
    globeGroup.add(radarSweepGroup);

    // Leading Radar Beam Arc (North to South Pole)
    const arcPoints: THREE.Vector3[] = [];
    const segments = 48;
    for (let i = 0; i <= segments; i++) {
      const phi = (i / segments) * Math.PI;
      const x = 0;
      const y = (globeRadius * 1.018) * Math.cos(phi);
      const z = (globeRadius * 1.018) * Math.sin(phi);
      arcPoints.push(new THREE.Vector3(x, y, z));
    }
    const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);
    const leadArcMat = new THREE.LineBasicMaterial({
      color: currentStyleConfig.radarColor,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    const leadArc = new THREE.Line(arcGeo, leadArcMat);
    radarSweepGroup.add(leadArc);

    // Trailing Gradient Mesh Fan
    const fanGeo = createRadarFanGeometry(globeRadius * 1.014, 10, 36, (Math.PI / 180) * 32);
    const fanMat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const fanMesh = new THREE.Mesh(fanGeo, fanMat);
    radarSweepGroup.add(fanMesh);

    // 10. 🎯 POLAR TACTICAL RETICLES (North & South Pole Crosshairs)
    const polarRingsGroup = new THREE.Group();
    polarRingsGroupRef.current = polarRingsGroup;
    globeGroup.add(polarRingsGroup);

    [1, -1].forEach((dir) => {
      const pY = dir * globeRadius * 1.02;
      const pRingGeo = new THREE.RingGeometry(globeRadius * 0.08, globeRadius * 0.088, 32);
      const pRingMat = new THREE.MeshBasicMaterial({
        color: currentStyleConfig.secondaryHex,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      const pRing = new THREE.Mesh(pRingGeo, pRingMat);
      pRing.position.y = pY;
      pRing.rotation.x = Math.PI / 2;
      polarRingsGroup.add(pRing);

      // Polar Crosshairs
      const crossPoints: THREE.Vector3[] = [
        new THREE.Vector3(-18, pY, 0),
        new THREE.Vector3(18, pY, 0),
        new THREE.Vector3(0, pY, -18),
        new THREE.Vector3(0, pY, 18)
      ];
      const crossGeo = new THREE.BufferGeometry().setFromPoints(crossPoints);
      const crossMat = new THREE.LineBasicMaterial({
        color: currentStyleConfig.primaryHex,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      });
      const crossLine = new THREE.LineSegments(crossGeo, crossMat);
      polarRingsGroup.add(crossLine);
    });

    // 11. Expanding Sonar Wave Ping
    const sonarPingGeo = new THREE.RingGeometry(globeRadius * 1.008, globeRadius * 1.025, 64);
    const sonarPingMat = new THREE.MeshBasicMaterial({
      color: currentStyleConfig.radarColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    const sonarPing = new THREE.Mesh(sonarPingGeo, sonarPingMat);
    sonarPing.rotation.x = Math.PI / 2;
    sonarPingMeshRef.current = sonarPing;
    globeGroup.add(sonarPing);

    // 12. Ambient Outer Starfield Dust
    const starCount = 350;
    const starGeo = new THREE.BufferGeometry();
    const starCoords = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const r = globeRadius * 1.6 + Math.random() * 500;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      starCoords[i] = r * Math.sin(phi) * Math.cos(theta);
      starCoords[i + 1] = r * Math.cos(phi);
      starCoords[i + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starCoords, 3));
    const starMat = new THREE.PointsMaterial({
      color: currentStyleConfig.starColor,
      size: 1.4,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending
    });
    starMatRef.current = starMat;
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 13. Radar Scan Ring (During Live Probe)
    const scanRingGeo = new THREE.RingGeometry(globeRadius * 1.01, globeRadius * 1.04, 64);
    const scanRingMat = new THREE.MeshBasicMaterial({
      color: currentStyleConfig.radarColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    const scanRing = new THREE.Mesh(scanRingGeo, scanRingMat);
    scanRing.rotation.x = Math.PI / 2;
    scanRingRef.current = scanRing;
    globeGroup.add(scanRing);

    // Groups for Dynamic Elements
    const nodeMarkersGroup = new THREE.Group();
    nodeMarkersGroupRef.current = nodeMarkersGroup;
    globeGroup.add(nodeMarkersGroup);

    const arcsGroup = new THREE.Group();
    arcsGroupRef.current = arcsGroup;
    globeGroup.add(arcsGroup);

    const pulsesGroup = new THREE.Group();
    pulsesGroupRef.current = pulsesGroup;
    globeGroup.add(pulsesGroup);

    // Handle Window Resize
    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      scene.clear();
    };
  }, []);

  // ==========================================
  // 2. LIVE STYLE SWITCHING EFFECT
  // ==========================================
  useEffect(() => {
    const config = STYLE_CONFIGS[globeStyle];
    if (!config) return;

    // 1. Update Sphere Material & Texture
    if (sphereMatRef.current) {
      if (globeStyle === 'realistic_earth' && rawEarthTextureRef.current) {
        sphereMatRef.current.map = rawEarthTextureRef.current;
        sphereMatRef.current.roughness = config.sphereRoughness;
        sphereMatRef.current.metalness = config.sphereMetalness;
        sphereMatRef.current.needsUpdate = true;
      } else {
        let tex = matrixTexturesCacheRef.current[globeStyle];
        if (!tex) {
          tex = buildTacticalMatrixTexture(globeStyle, baseImgRef.current);
          matrixTexturesCacheRef.current[globeStyle] = tex;
        }
        sphereMatRef.current.map = tex;
        sphereMatRef.current.roughness = config.sphereRoughness;
        sphereMatRef.current.metalness = config.sphereMetalness;
        sphereMatRef.current.needsUpdate = true;
      }
    }

    // 2. Update Atmosphere & Corona
    if (atmosphereMatRef.current) {
      atmosphereMatRef.current.color.setHex(config.atmosphereColor);
      atmosphereMatRef.current.opacity = config.atmosphereOpacity;
    }
    if (coronaMatRef.current) {
      coronaMatRef.current.color.setHex(config.coronaColor);
      coronaMatRef.current.opacity = config.coronaOpacity;
    }

    // 3. Update Grids
    if (gridMatRef.current) {
      gridMatRef.current.color.setHex(config.gridColor);
      gridMatRef.current.opacity = config.gridOpacity;
    }
    if (equatorMatRef.current) {
      equatorMatRef.current.color.setHex(config.equatorColor);
      equatorMatRef.current.opacity = config.equatorOpacity;
    }

    // 4. Update Stars
    if (starMatRef.current) {
      starMatRef.current.color.setHex(config.starColor);
    }

    // 5. Update Sonar & Scan Ring
    if (sonarPingMeshRef.current) {
      (sonarPingMeshRef.current.material as THREE.MeshBasicMaterial).color.setHex(config.radarColor);
    }
    if (scanRingRef.current) {
      (scanRingRef.current.material as THREE.MeshBasicMaterial).color.setHex(config.radarColor);
    }
  }, [globeStyle]);

  // ==========================================
  // 3. BUILD 3D ARCS & TACTICAL NODE MARKERS
  // ==========================================
  useEffect(() => {
    const globeGroup = globeGroupRef.current;
    const arcsGroup = arcsGroupRef.current;
    const nodeMarkersGroup = nodeMarkersGroupRef.current;
    if (!globeGroup || !arcsGroup || !nodeMarkersGroup) return;

    const config = STYLE_CONFIGS[globeStyle] || STYLE_CONFIGS.tactical_stealth;

    // Clear old elements
    while (arcsGroup.children.length > 0) {
      arcsGroup.remove(arcsGroup.children[0]);
    }
    while (nodeMarkersGroup.children.length > 0) {
      nodeMarkersGroup.remove(nodeMarkersGroup.children[0]);
    }

    const globeRadius = 185;
    const nodeMap = new Map<string, GlobeNode>();
    nodes.forEach((n) => nodeMap.set(n.id, n));

    // 🖥️ BUILD 3D NODES ON SPHERE
    nodes.forEach((node) => {
      const isRogue = node.role === 'rogue_attacker';
      const isSelected = selectedNode?.id === node.id;
      const p = latLongToVector3(node.lat, node.lon, globeRadius);

      // Status Color
      let nodeColorHex = config.nodeCompliantColor;
      if (isRogue) {
        nodeColorHex = isRogueIsolated ? 0x64748b : 0xef4444;
      } else if (viewMode === 'heatmap') {
        nodeColorHex = node.score >= 80 ? config.nodeCompliantColor : node.score >= 50 ? config.nodeWarningColor : config.nodeCriticalColor;
      } else if (viewMode === 'vlans') {
        nodeColorHex = node.vlanId === 0 ? 0x38bdf8 : node.vlanId === 100 ? 0x818cf8 : node.vlanId === 1 ? 0x6366f1 : node.vlanId === 1000 ? 0x34d399 : 0xf59e0b;
      } else {
        nodeColorHex = node.status === 'compliant' ? config.nodeCompliantColor : node.status === 'warning' ? config.nodeWarningColor : config.nodeCriticalColor;
      }

      // 1. Tactical Hexagonal Base Anchor on Sphere Surface
      const diskGeo = new THREE.RingGeometry(4.2, 6.8, 6); // Hexagonal radar ring
      const diskMat = new THREE.MeshBasicMaterial({
        color: nodeColorHex,
        transparent: true,
        opacity: isSelected ? 0.95 : 0.7,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      const diskMesh = new THREE.Mesh(diskGeo, diskMat);
      diskMesh.position.copy(p);
      diskMesh.lookAt(new THREE.Vector3(0, 0, 0));
      nodeMarkersGroup.add(diskMesh);

      // 2. Glowing Hardware Core Pin Sphere
      const pinOffset = p.clone().normalize().multiplyScalar(globeRadius + 7.5);
      const pinGeo = new THREE.SphereGeometry(isSelected ? 6.2 : 4.8, 16, 16);
      const pinMat = new THREE.MeshStandardMaterial({
        color: nodeColorHex,
        emissive: nodeColorHex,
        emissiveIntensity: isSelected ? 1.6 : 1.0,
        roughness: 0.2,
        metalness: 0.8
      });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pinOffset);
      (pinMesh as any).nodeData = node;
      nodeMarkersGroup.add(pinMesh);

      // 3. Selection Targeting Crosshair Ring
      if (isSelected) {
        const selRingGeo = new THREE.RingGeometry(8.5, 11.5, 24);
        const selRingMat = new THREE.MeshBasicMaterial({
          color: config.secondaryHex,
          transparent: true,
          opacity: 0.95,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending
        });
        const selRing = new THREE.Mesh(selRingGeo, selRingMat);
        selRing.position.copy(pinOffset);
        selRing.lookAt(new THREE.Vector3(0, 0, 0));
        nodeMarkersGroup.add(selRing);
      }
    });

    // 🚀 BUILD 3D CURVY GREAT-CIRCLE CONNECTING ARCS
    connections.forEach((conn) => {
      const source = nodeMap.get(conn.from);
      const target = nodeMap.get(conn.to);
      if (!source || !target) return;

      const isAttack = conn.type === 'attack';
      if (isAttack && isRogueIsolated) return;

      const p1 = latLongToVector3(source.lat, source.lon, globeRadius);
      const p2 = latLongToVector3(target.lat, target.lon, globeRadius);
      const dist = p1.distanceTo(p2);

      // Elevation Altitude above Sphere Surface
      const arcAltitude = globeRadius + Math.min(75, Math.max(22, dist * 0.28));
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5).normalize().multiplyScalar(arcAltitude);
      const c1 = new THREE.Vector3().lerpVectors(p1, mid, 0.55).normalize().multiplyScalar(arcAltitude * 0.95);
      const c2 = new THREE.Vector3().lerpVectors(p2, mid, 0.55).normalize().multiplyScalar(arcAltitude * 0.95);

      const curve = new THREE.CubicBezierCurve3(p1, c1, c2, p2);

      // Arc Color Scheme
      let arcColor = config.defaultArcColor;
      if (isAttack || conn.type === 'hostile') arcColor = config.attackArcColor;
      else if (conn.type === 'vpn') arcColor = config.vpnArcColor;
      else if (conn.isEncrypted || conn.type === 'secure') arcColor = config.nodeCompliantColor;

      const isSelectedConn = selectedConnection?.id === conn.id;

      // 3D Arched Tube Geometry
      const tubeGeo = new THREE.TubeGeometry(curve, 52, isSelectedConn ? 2.6 : isAttack ? 2.0 : 1.25, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: arcColor,
        emissive: arcColor,
        emissiveIntensity: isSelectedConn ? 1.6 : isAttack ? 1.4 : 0.9,
        roughness: 0.25,
        metalness: 0.7,
        transparent: true,
        opacity: isSelectedConn ? 1.0 : isAttack ? 0.95 : 0.8,
        blending: THREE.AdditiveBlending
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      (tubeMesh as any).connectionData = conn;
      arcsGroup.add(tubeMesh);

      (tubeMesh as any).curve = curve;
      (tubeMesh as any).pulseColor = arcColor;
      (tubeMesh as any).isAttack = isAttack;
    });

  }, [nodes, connections, selectedNode, selectedConnection, isRogueIsolated, viewMode, globeStyle, latLongToVector3]);

  // ==========================================
  // 4. ANIMATION & INTERACTIVE RENDER LOOP
  // ==========================================
  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const globeGroup = globeGroupRef.current;
    const arcsGroup = arcsGroupRef.current;
    const container = containerRef.current;
    if (!scene || !camera || !renderer || !globeGroup || !container) return;

    let animId = 0;
    let pulseProgress = 0;
    let sonarProgress = 0;

    const render = () => {
      // 1. Continuous Non-Stop Spinning
      if (autoSpinRef.current && !isDraggingRef.current) {
        globeGroup.rotation.y += 0.0028;
      }

      // Drag Inertia / Momentum Damping
      if (!isDraggingRef.current) {
        velocityRef.current.x *= 0.94;
        velocityRef.current.y *= 0.94;
        globeGroup.rotation.y += velocityRef.current.x;
        globeGroup.rotation.x = Math.max(-0.65, Math.min(0.65, globeGroup.rotation.x + velocityRef.current.y));
      }

      // 2. Rotating Radar Sweep Beam
      if (radarSweepGroupRef.current) {
        if (isRadarActiveRef.current) {
          radarSweepGroupRef.current.visible = true;
          radarSweepGroupRef.current.rotation.y += 0.024;
        } else {
          radarSweepGroupRef.current.visible = false;
        }
      }

      // 3. Polar Reticles Counter-Rotation
      if (polarRingsGroupRef.current) {
        polarRingsGroupRef.current.rotation.y -= 0.005;
      }

      // 4. Sonar Pulse Ping Waves
      if (sonarPingMeshRef.current && isRadarActiveRef.current) {
        sonarProgress = (sonarProgress + 0.007) % 1;
        sonarPingMeshRef.current.scale.setScalar(1.0 + sonarProgress * 0.06);
        (sonarPingMeshRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, (1 - sonarProgress) * 0.55);
      }

      // 5. Animated Photon Pulses Along Curvy Great-Circle Arcs
      pulseProgress = (pulseProgress + 0.007) % 1;
      const pulsesGroup = pulsesGroupRef.current;
      if (pulsesGroup && arcsGroup && isSimulatingPackets) {
        const tubes = arcsGroup.children as THREE.Mesh[];
        while (pulsesGroup.children.length < tubes.length) {
          const pGeo = new THREE.SphereGeometry(2.8, 12, 12);
          const pMat = new THREE.MeshBasicMaterial({
            color: 0x10b981,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending
          });
          pulsesGroup.add(new THREE.Mesh(pGeo, pMat));
        }
        while (pulsesGroup.children.length > tubes.length) {
          pulsesGroup.remove(pulsesGroup.children[pulsesGroup.children.length - 1]);
        }

        tubes.forEach((tube, idx) => {
          const pulseMesh = pulsesGroup.children[idx] as THREE.Mesh;
          if (!pulseMesh) return;
          const curve = (tube as any).curve as THREE.CubicBezierCurve3;
          if (curve) {
            const offsetProgress = (pulseProgress + (idx * 0.17)) % 1;
            const pt = curve.getPointAt(offsetProgress);
            pulseMesh.position.copy(pt);
            (pulseMesh.material as THREE.MeshBasicMaterial).color.setHex((tube as any).pulseColor || 0x10b981);
            pulseMesh.visible = true;
          } else {
            pulseMesh.visible = false;
          }
        });
      } else if (pulsesGroup) {
        pulsesGroup.children.forEach(c => { c.visible = false; });
      }

      // 6. Live Probe Scanning Ring
      if (scanRingRef.current) {
        if (isScanning) {
          const scanMat = scanRingRef.current.material as THREE.MeshBasicMaterial;
          scanMat.opacity = 0.65;
          scanRingRef.current.rotation.z += 0.04;
          scanRingRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.008) * 0.08);
        } else {
          (scanRingRef.current.material as THREE.MeshBasicMaterial).opacity = 0;
        }
      }

      // 7. Project 3D Node Positions to 2D Screen Space
      const width = container.clientWidth;
      const height = container.clientHeight;
      const badges: ProjectedNodeBadge[] = [];

      nodes.forEach((node) => {
        const globeRadius = 185;
        const p = latLongToVector3(node.lat, node.lon, globeRadius + 10);
        const worldPos = p.clone().applyMatrix4(globeGroup.matrixWorld);

        const normal = p.clone().normalize().applyQuaternion(globeGroup.quaternion);
        const cameraDir = camera.position.clone().sub(worldPos).normalize();
        const dot = normal.dot(cameraDir);

        const isFacing = dot > 0.08;
        if (isFacing) {
          const screenPos = worldPos.clone().project(camera);
          const screenX = (screenPos.x * 0.5 + 0.5) * width;
          const screenY = (-(screenPos.y * 0.5) + 0.5) * height;
          const opacity = Math.min(1, Math.max(0, (dot - 0.08) / 0.28));
          const scale = 0.82 + dot * 0.22;

          badges.push({
            node,
            screenX,
            screenY,
            opacity,
            scale,
            isVisible: true
          });
        }
      });

      setProjectedBadges(badges);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [nodes, isScanning, isSimulatingPackets, latLongToVector3]);

  // Pointer Drag Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    velocityRef.current = { x: 0, y: 0 };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !globeGroupRef.current) return;

    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    velocityRef.current = {
      x: deltaX * 0.005,
      y: deltaY * 0.005
    };

    globeGroupRef.current.rotation.y += velocityRef.current.x;
    globeGroupRef.current.rotation.x = Math.max(
      -0.65,
      Math.min(0.65, globeGroupRef.current.rotation.x + velocityRef.current.y)
    );

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Zoom Controls
  const handleZoom = (direction: 'in' | 'out') => {
    if (!cameraRef.current) return;
    const currentZ = cameraRef.current.position.z;
    const targetZ = direction === 'in' ? Math.max(340, currentZ - 50) : Math.min(780, currentZ + 50);
    cameraRef.current.position.z = targetZ;
  };

  // Reset View to Core Center
  const handleResetView = () => {
    if (!globeGroupRef.current || !cameraRef.current) return;
    globeGroupRef.current.rotation.set(0.12, 0, 0);
    cameraRef.current.position.set(0, 40, 520);
    velocityRef.current = { x: 0, y: 0 };
    setAutoSpin(true);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[780px] rounded-2xl bg-[#01040a] border border-slate-800/80 overflow-hidden select-none cursor-grab active:cursor-grabbing ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* 🧭 3D ON-BALL FLOATING VECTOR LABELS (Front Hemisphere Only) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {projectedBadges.map(({ node, screenX, screenY, opacity, scale }) => {
          const isSelected = selectedNode?.id === node.id;
          const isRogue = node.role === 'rogue_attacker';

          return (
            <div
              key={node.id}
              className="absolute pointer-events-auto transition-transform duration-75 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{
                left: `${screenX}px`,
                top: `${screenY - 26}px`,
                opacity,
                transform: `translate(-50%, -50%) scale(${scale})`,
                zIndex: isSelected ? 30 : 20
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectNode(node);
                onSelectConnection(null);
              }}
            >
              {/* Tactical Monospace Enterprise Device Pill */}
              <div
                className={`px-2.5 py-1 rounded-xl font-mono flex items-center space-x-2 backdrop-blur-xl transition-all shadow-xl ${
                  isSelected
                    ? currentStyleConfig.badgeActive
                    : isRogue
                    ? 'bg-rose-950/90 border border-rose-500/70 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.5)]'
                    : currentStyleConfig.badgeIdle
                }`}
              >
                {/* Status Dot */}
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isRogue
                      ? isRogueIsolated
                        ? 'bg-slate-500'
                        : 'bg-rose-500 animate-ping'
                      : node.score >= 80
                      ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                      : node.score >= 50
                      ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                      : 'bg-rose-500 animate-pulse'
                  }`}
                />

                {/* Device Name & IP */}
                <div className="text-left leading-tight">
                  <div className="text-2xs font-extrabold tracking-tight whitespace-nowrap text-white flex items-center space-x-1.5">
                    <span>{node.name}</span>
                    {showBandwidthPills && (
                      <span className="text-3xs px-1 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono">
                        {node.traffic.split(' ')[0]}
                      </span>
                    )}
                    {showPortLabels && (
                      <span className="text-3xs px-1 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono">
                        {node.openPorts.length}p
                      </span>
                    )}
                  </div>
                  <div className="text-3xs text-slate-400 flex items-center space-x-1.5 whitespace-nowrap">
                    <span>{node.vendor.split(' ')[0]}</span>
                    <span>•</span>
                    <span className={node.score >= 80 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                      {node.score}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🎮 3D SPHERE TELEMETRY OVERLAYS & CONTROLS */}
      {/* Top Left: Active Style & Defense Grid Telemetry */}
      <div className="absolute top-3.5 left-3.5 flex items-center space-x-2.5 z-20 pointer-events-none">
        <div className={`px-3 py-1.5 rounded-xl bg-slate-950/90 border ${currentStyleConfig.badgeClass} text-3xs font-mono flex items-center space-x-2 backdrop-blur-md shadow-lg`}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-extrabold tracking-wider uppercase">{currentStyleConfig.tagline}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">{nodes.length} Monitored Nodes</span>
        </div>
      </div>

      {/* Top Right: Style Switcher, Radar Toggle, Spin & Zoom Controls */}
      <div className="absolute top-3.5 right-3.5 flex items-center space-x-1.5 z-20 bg-slate-950/90 p-1 rounded-xl border border-slate-800 backdrop-blur-md text-3xs font-mono">
        
        {/* 🎨 STYLE SELECTOR DROPDOWN */}
        <div id="globe-style-menu-container" className="relative">
          <button
            onClick={() => setStyleMenuOpen(!styleMenuOpen)}
            className="px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1.5 transition-all cursor-pointer bg-slate-900 border border-slate-700/80 text-white hover:border-emerald-500/60"
            title="Switch 3D Globe Aesthetic Style"
          >
            <Palette className="h-3 w-3 text-emerald-400" />
            <span className="text-2xs font-extrabold">{currentStyleConfig.shortName}</span>
            <ChevronDown className={`h-2.5 w-2.5 text-slate-400 transition-transform ${styleMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {styleMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-64 bg-slate-950/98 border border-slate-800 rounded-xl p-1.5 shadow-2xl backdrop-blur-2xl z-50 text-left">
              <div className="px-2.5 py-1 text-3xs font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-800/80 mb-1">
                Globe Aesthetic Themes
              </div>

              {(Object.keys(STYLE_CONFIGS) as GlobeStyle[]).map((stId) => {
                const cfg = STYLE_CONFIGS[stId];
                const isActive = globeStyle === stId;
                return (
                  <button
                    key={stId}
                    onClick={() => handleSelectStyle(stId)}
                    className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: cfg.primaryHex }}
                      />
                      <div>
                        <div className="text-2xs font-bold leading-tight">{cfg.name}</div>
                        <div className="text-3xs text-slate-500">{cfg.badgeTag}</div>
                      </div>
                    </div>
                    {isActive && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 🛰️ RADAR SWEEP TOGGLE BUTTON */}
        <button
          onClick={handleToggleRadar}
          className={`px-2 py-1 rounded-lg font-bold flex items-center space-x-1 transition-all cursor-pointer ${
            isRadarActive
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Toggle 3D Sweeping Radar Beam"
        >
          <Radar className="h-3 w-3" />
          <span>{isRadarActive ? 'Radar ON' : 'Radar OFF'}</span>
        </button>

        <div className="w-px h-3.5 bg-slate-800" />

        {/* Spin Play/Pause */}
        <button
          onClick={() => setAutoSpin(!autoSpin)}
          className={`px-2 py-1 rounded-lg font-bold flex items-center space-x-1 transition-all cursor-pointer ${
            autoSpin ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'text-slate-400 hover:text-white'
          }`}
          title="Toggle Continuous Non-Stop Spinning"
        >
          {autoSpin ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          <span>{autoSpin ? 'Spinning' : 'Paused'}</span>
        </button>

        {/* Re-Center */}
        <button
          onClick={handleResetView}
          className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
          title="Re-Center Globe on Core Backbone"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>

        <div className="w-px h-3.5 bg-slate-800" />

        {/* Zoom In/Out */}
        <button
          onClick={() => handleZoom('in')}
          className="p-1 text-slate-400 hover:text-white cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={() => handleZoom('out')}
          className="p-1 text-slate-400 hover:text-white cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Bottom Left: Tactical Ops Status Bar */}
      <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-slate-950/85 border border-slate-800/90 text-3xs font-mono text-slate-400 flex items-center space-x-2 backdrop-blur-md pointer-events-none">
        <Crosshair className="h-3 w-3 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
        <span>[TACTICAL RADAR] 360° Defense Grid Active • Left-drag to orbit in 3D • Click any node or conduit for deep telemetry</span>
      </div>
    </div>
  );
};

export default CyberGlobe3D;
