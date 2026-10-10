import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  ArrowUpRight, 
  Clock, 
  AlertCircle,
  BarChart3
} from 'lucide-react';
import './AIUsage8.css';

export interface MetricMeter {
  label: string;
  current: number;
  max: number;
  unit?: string;
  color: string;
  icon?: React.ElementType;
}

export interface AIUsage8Props {
  planName?: string;
  cycleResetDays?: number;
  primaryMetricName?: string;
  usedInferences?: number;
  totalInferences?: number;
  sparklineData?: number[];
  secondaryMeters?: MetricMeter[];
  onUpgrade?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_SPARKLINE = [42, 58, 45, 62, 78, 65, 84, 92, 75, 88, 104, 118, 95, 124];

const DEFAULT_METERS: MetricMeter[] = [
  {
    label: 'AST Syntax Tokenizer',
    current: 4.6,
    max: 5.0,
    unit: 'M Nodes',
    color: '#38bdf8', // Sky
    icon: Cpu
  },
  {
    label: 'NLP Heuristic Learning',
    current: 680,
    max: 1000,
    unit: 'Rules',
    color: '#c084fc', // Purple
    icon: Sparkles
  },
  {
    label: 'Netmiko SSH Scans',
    current: 450,
    max: 1000,
    unit: 'Sweeps',
    color: '#34d399', // Emerald
    icon: ShieldCheck
  }
];

export const AIUsage8: React.FC<AIUsage8Props> = ({
  planName = 'ENTERPRISE ZERO-TRUST PRO',
  cycleResetDays = 12,
  primaryMetricName = 'AI Security Heuristic Inferences',
  usedInferences = 842500,
  totalInferences = 1000000,
  sparklineData = DEFAULT_SPARKLINE,
  secondaryMeters = DEFAULT_METERS,
  onUpgrade,
  className = '',
  style = {}
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const usagePercent = Math.min(100, Math.round((usedInferences / totalInferences) * 100));

  // Sparkline coordinates calculation
  const minVal = Math.min(...sparklineData);
  const maxVal = Math.max(...sparklineData);
  const range = maxVal - minVal || 1;

  const svgWidth = 280;
  const svgHeight = 56;
  const padding = 6;

  const points = sparklineData.map((val, idx) => {
    const x = padding + (idx / (sparklineData.length - 1)) * (svgWidth - padding * 2);
    const y = svgHeight - padding - ((val - minVal) / range) * (svgHeight - padding * 2);
    return { x, y, val };
  });

  const pathD = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`, '');
  const areaD = `${pathD} L ${points[points.length - 1].x},${svgHeight} L ${points[0].x},${svgHeight} Z`;

  return (
    <div 
      className={`ai-usage-8-card ${className}`}
      style={style}
    >
      {/* 1. Header: Plan & Cycle Reset Telemetry */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-sky-950/80 border border-sky-500/40 text-sky-400 shadow-sm">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black tracking-wider text-white">
                {planName}
              </span>
              <span className="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Autonomous AI Telemetry & Multi-Vendor Engine
            </p>
          </div>
        </div>

        <div className="text-right flex items-center space-x-1 text-[10.5px] font-mono text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
          <Clock className="h-3 w-3 text-sky-400" />
          <span>Resets in <strong className="text-white">{cycleResetDays}d</strong></span>
        </div>
      </div>

      {/* 2. Primary Metric & Dynamic SVG Sparkline */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center py-2">
        {/* Left Stats */}
        <div className="md:col-span-6 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span>{primaryMetricName}</span>
            <span className="text-sky-400 font-mono font-bold">{usagePercent}%</span>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white tracking-tight num-glow">
              {usedInferences.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              / {totalInferences.toLocaleString()}
            </span>
          </div>

          {/* Primary Progress Bar */}
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/90 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${usagePercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10.5px] font-mono text-slate-400 pt-0.5">
            <span className="text-emerald-400 flex items-center space-x-1">
              <TrendingUp className="h-3 w-3" />
              <span>+18.4% this cycle</span>
            </span>
            <span>{(totalInferences - usedInferences).toLocaleString()} remaining</span>
          </div>
        </div>

        {/* Right: Sparkline Chart */}
        <div className="md:col-span-6 bg-slate-950/90 p-3 rounded-xl border border-slate-800/80 space-y-1 shadow-inner relative overflow-hidden">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center space-x-1 text-slate-300 font-semibold">
              <BarChart3 className="h-3 w-3 text-sky-400" />
              <span>14-DAY AUDIT VELOCITY</span>
            </span>
            <span className="text-sky-300 font-bold">
              {hoveredPoint !== null ? `${sparklineData[hoveredPoint]} queries/hr` : 'Peak: 124/hr'}
            </span>
          </div>

          {/* SVG Sparkline Graph */}
          <div className="w-full relative h-[56px]">
            <svg 
              className="w-full h-full overflow-visible" 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="aiUsageGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area Fill */}
              <path d={areaD} fill="url(#aiUsageGradient)" />

              {/* Sparkline Line */}
              <path 
                d={pathD} 
                fill="none" 
                stroke="#38bdf8" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />

              {/* Data points */}
              {points.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredPoint === i ? 4.5 : 2}
                  className="cursor-pointer transition-all duration-200"
                  fill={hoveredPoint === i ? '#ffffff' : '#38bdf8'}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                  onMouseEnter={() => setHoveredPoint(i)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Secondary Telemetry Meters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
        {secondaryMeters.map((meter, idx) => {
          const MeterIcon = meter.icon || Cpu;
          const pct = Math.min(100, Math.round((meter.current / meter.max) * 100));
          return (
            <div 
              key={idx} 
              className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2 transition-all hover:border-slate-700"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5 text-slate-300 font-semibold truncate">
                  <MeterIcon className="h-3.5 w-3.5 shrink-0" style={{ color: meter.color }} />
                  <span className="truncate">{meter.label}</span>
                </div>
                <span className="font-mono text-[11px] font-bold text-white shrink-0">
                  {pct}%
                </span>
              </div>

              {/* Micro bar */}
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800/60">
                <div 
                  className="h-full rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: `${pct}%`, backgroundColor: meter.color }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>{meter.current} / {meter.max} {meter.unit}</span>
                <span style={{ color: meter.color }} className="font-semibold">Optimal</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Upgrade / Capacity Expansion Callout Banner */}
      <div className="mt-2 p-3.5 rounded-xl bg-gradient-to-r from-sky-950/70 via-indigo-950/60 to-purple-950/70 border border-sky-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-300 shrink-0">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center space-x-2">
              <span>Approaching Enterprise High-Assurance Limit (84%)</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Scale to Unlimited AST Parsing & Dedicated Air-Gapped Model Instances with instant provisioning.
            </p>
          </div>
        </div>

        <button 
          onClick={onUpgrade}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-extrabold flex items-center space-x-1.5 cursor-pointer shrink-0 transition-all duration-200 shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:shadow-[0_0_30px_rgba(56,189,248,0.7)] hover:scale-[1.02]"
        >
          <span>Expand Capacity</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default AIUsage8;
