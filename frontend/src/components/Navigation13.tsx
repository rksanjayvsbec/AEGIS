import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Network, 
  UploadCloud, 
  Cpu, 
  Settings as SettingsIcon, 
  History as HistoryIcon,
  Menu, 
  X, 
  ShieldCheck, 
  ArrowUpRight,
  Server,
  ShieldAlert,
  Database
} from 'lucide-react';
import './Navigation13.css';

export interface Navigation13Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unrecognizedCount?: number;
  totalDevices?: number;
  avgComplianceScore?: number;
  openDeviationsCount?: number;
  dbStatus?: {
    connected: boolean;
    mode?: string;
    latency_ms?: number | null;
  } | null;
  onLogoClick?: () => void;
}

export const Navigation13: React.FC<Navigation13Props> = ({
  activeTab,
  onTabChange,
  unrecognizedCount = 0,
  totalDevices = 10,
  avgComplianceScore = 92,
  openDeviationsCount = 2,
  dbStatus,
  onLogoClick
}) => {
  const [curtainOpen, setCurtainOpen] = useState(false);

  // Close curtain on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCurtainOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body scroll when curtain is active
  useEffect(() => {
    if (curtainOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [curtainOpen]);

  // 🌟 Primary operational items kept directly in the visible navbar
  const primaryNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, index: '01', desc: 'Real-time compliance radar & multi-vendor deviation telemetry' },
    { id: 'topology', label: 'Topology', icon: Network, index: '02', desc: 'Interactive NOC network topology & physical link forensics' },
    { id: 'ingestion', label: 'Ingestion', icon: UploadCloud, index: '03', desc: 'Automated multi-vendor config parser & baseline auditor' }
  ];

  // 🏛️ Secondary administrative suite stored inside the menu
  const secondaryNavItems = [
    { 
      id: 'history', 
      label: 'History', 
      icon: HistoryIcon, 
      index: '04',
      desc: 'Ingestion audit trail, historical compliance drift & JSON records'
    },
    { 
      id: 'training', 
      label: 'AI Studio', 
      icon: Cpu, 
      badge: unrecognizedCount > 0 ? unrecognizedCount : undefined,
      index: '05',
      desc: 'Air-gapped NLP classifier & unrecognized command mapper'
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: SettingsIcon, 
      index: '06',
      desc: 'MongoDB database cluster, golden baselines & security thresholds'
    }
  ];

  // Check if current active tab is one of the secondary items
  const activeSecondaryItem = secondaryNavItems.find(item => item.id === activeTab);

  return (
    <>
      {/* 🧭 EDITORIAL SPLIT NAVBAR (NAVIGATION 13) */}
      <header className="nav-13-header">
        <div className="nav-13-bar">
          
          {/* LEFT SECTION: Only Important Core Operations */}
          <div className="nav-13-left">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`nav-13-link group ${isActive ? 'is-active' : ''}`}
                >
                  <Icon className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100 transition-opacity text-sky-400" />
                  {/* Text Roll-Up Animation Container */}
                  <span className="nav-13-rollup">
                    <span className="nav-13-rollup-primary">{item.label}</span>
                    <span className="nav-13-rollup-secondary">{item.label}</span>
                  </span>
                  {isActive && <span className="nav-13-active-dot" />}
                </button>
              );
            })}
          </div>

          {/* CENTER SECTION: Luxury Centered Wordmark (Clean - No Shield) */}
          <div 
            onClick={onLogoClick}
            className="nav-13-center group cursor-pointer select-none"
          >
            <div className="flex items-center space-x-2">
              <span className="nav-13-wordmark">
                AEGIS
              </span>
              <span className="nav-13-wordmark">
                ENTERPRISE
              </span>
            </div>
          </div>

          {/* RIGHT SECTION: Active Secondary Context, Curtain Menu Trigger & MongoDB Symbol */}
          <div className="nav-13-right">
            {/* If currently viewing a secondary tab (History, AI Studio, Settings), show contextual pill */}
            {activeSecondaryItem && (
              <button
                onClick={() => onTabChange(activeSecondaryItem.id)}
                className="nav-13-link is-active group"
                title={`Currently in ${activeSecondaryItem.label}`}
              >
                <activeSecondaryItem.icon className="h-3.5 w-3.5 text-sky-400" />
                <span className="nav-13-rollup">
                  <span className="nav-13-rollup-primary">{activeSecondaryItem.label}</span>
                  <span className="nav-13-rollup-secondary">{activeSecondaryItem.label}</span>
                </span>
                {activeSecondaryItem.badge !== undefined && (
                  <span className="nav-13-badge animate-pulse">
                    {activeSecondaryItem.badge}
                  </span>
                )}
                <span className="nav-13-active-dot" />
              </button>
            )}

            {/* Full-Screen Curtain Menu Trigger Button */}
            <button
              onClick={() => setCurtainOpen(true)}
              className="nav-13-curtain-btn group"
              title="Open Navigation Deck, Database & Settings"
              aria-label="Open Navigation Curtain"
            >
              <Menu className="h-4 w-4 text-sky-300 group-hover:rotate-90 transition-transform duration-300" />
              <span className="nav-13-curtain-btn-label">MENU</span>
              {unrecognizedCount > 0 && !activeSecondaryItem && (
                <span className="nav-13-badge animate-pulse">{unrecognizedCount}</span>
              )}
            </button>

            {/* 🍃 MongoDB Symbol at the very last position of the menu bar */}
            <button
              onClick={() => onTabChange('settings')}
              className="nav-13-mongo-btn group cursor-pointer"
              title={dbStatus?.connected 
                ? `MongoDB Cluster Connected (${dbStatus.latency_ms ?? 0}ms) — Click to open database settings` 
                : 'MongoDB in Local File Mode — Click to configure connection URI'}
              aria-label="MongoDB Settings & Status"
            >
              <div className="relative flex items-center justify-center">
                {/* Official Multi-Tone MongoDB Leaf SVG */}
                <svg 
                  className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(0,237,100,0.5)]" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Left Darker Leaf Half */}
                  <path 
                    d="M12 2C12 2 6.5 7.5 6.5 13.5C6.5 17.5 9 20.8 12 22.2V2Z" 
                    fill="#00684A" 
                  />
                  {/* Right Bright Neon Green Leaf Half */}
                  <path 
                    d="M12 2C12 2 17.5 7.5 17.5 13.5C17.5 17.5 15 20.8 12 22.2V2Z" 
                    fill="#00ED64" 
                  />
                  {/* Central Vein Line */}
                  <path 
                    d="M12 3V21.5" 
                    stroke="#001E2B" 
                    strokeWidth="0.8" 
                    strokeLinecap="round" 
                  />
                  {/* Inner organic highlight curve */}
                  <path 
                    d="M12 6C13.8 9.5 14.5 12.5 13.2 16" 
                    stroke="#A3E635" 
                    strokeWidth="0.6" 
                    strokeLinecap="round" 
                    opacity="0.8" 
                  />
                </svg>

                {/* Status Dot */}
                <span 
                  className={`absolute -top-1 -right-1 w-2 h-2 rounded-full border border-slate-900 ${
                    dbStatus?.connected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400'
                  }`} 
                />
              </div>
            </button>
          </div>

        </div>
      </header>

      {/* 🎭 FULL-SCREEN CURTAIN MENU OVERLAY */}
      <div className={`nav-13-curtain-overlay ${curtainOpen ? 'is-open' : ''}`}>
        
        {/* Ambient Grid Backdrop */}
        <div className="nav-13-curtain-grid" />

        {/* Top Dismiss Bar */}
        <div className="nav-13-curtain-top">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-sky-950/80 border border-sky-500/40 text-sky-400 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <span className="text-sm font-black tracking-wider text-white">AEGIS GOVERNANCE SYSTEM</span>
              <span className="text-[10px] font-mono text-sky-400 block">ZERO-TRUST SECURITY & ADMINISTRATION DIRECTORY</span>
            </div>
          </div>

          <button
            onClick={() => setCurtainOpen(false)}
            className="nav-13-curtain-close group"
            aria-label="Close Curtain Menu"
          >
            <span className="text-xs font-mono font-bold text-slate-300 group-hover:text-white mr-2">CLOSE [ESC]</span>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 group-hover:border-sky-500 text-sky-400 transition-all">
              <X className="h-4 w-4" />
            </div>
          </button>
        </div>

        {/* Main Curtain Content: Editorial Navigation + Telemetry Deck */}
        <div className="nav-13-curtain-content">
          
          {/* Left: Categorized Navigation Links */}
          <div className="nav-13-curtain-links">
            
            {/* Section 1: Core Operations */}
            <div className="nav-13-section-group">
              <span className="nav-13-section-badge">
                // CORE OPERATIONS
              </span>
              {primaryNavItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setCurtainOpen(false);
                    }}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                    className={`nav-13-curtain-item group ${isActive ? 'is-active' : ''}`}
                  >
                    <span className="nav-13-curtain-num font-mono">{item.index}</span>
                    <Icon className="h-5 w-5 text-slate-400 group-hover:text-sky-400 transition-colors shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="nav-13-curtain-title">{item.label}</span>
                      <span className="nav-13-curtain-desc">{item.desc}</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-sky-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all ml-auto shrink-0" />
                  </button>
                );
              })}
            </div>

            {/* Section 2: Administrative & Repository Suite */}
            <div className="nav-13-section-group">
              <span className="nav-13-section-badge">
                // ADMINISTRATION & REPOSITORY SUITE
              </span>
              {secondaryNavItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setCurtainOpen(false);
                    }}
                    style={{ animationDelay: `${(idx + 3) * 0.05}s` }}
                    className={`nav-13-curtain-item group ${isActive ? 'is-active' : ''}`}
                  >
                    <span className="nav-13-curtain-num font-mono">{item.index}</span>
                    <Icon className="h-5 w-5 text-slate-400 group-hover:text-sky-400 transition-colors shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="nav-13-curtain-title">{item.label}</span>
                        {item.badge !== undefined && (
                          <span className="nav-13-badge animate-pulse">{item.badge} unmapped</span>
                        )}
                      </div>
                      <span className="nav-13-curtain-desc">{item.desc}</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-sky-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all ml-auto shrink-0" />
                  </button>
                );
              })}
            </div>

          </div>

          {/* Right: Database Hub & Executive Telemetry Panel */}
          <div className="nav-13-curtain-right-stack">
            
            {/* Database Cluster Status Card */}
            <div className="nav-13-curtain-db-card space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <span className="text-3xs font-mono font-extrabold uppercase tracking-widest text-sky-400 flex items-center space-x-1.5">
                  <Database className="h-3.5 w-3.5 text-sky-400" />
                  <span>// PERSISTENCE ENGINE</span>
                </span>
                <span className={`text-3xs font-mono font-bold px-2 py-0.5 rounded border ${
                  dbStatus?.connected 
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' 
                    : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                }`}>
                  {dbStatus?.connected ? 'ONLINE' : 'FALLBACK'}
                </span>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white font-mono flex items-center space-x-1.5">
                    <span className={`w-2 h-2 rounded-full ${dbStatus?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    <span>{dbStatus?.connected ? 'MongoDB Cluster Connected' : 'Local File Fallback Mode'}</span>
                  </h4>
                  <p className="text-2xs text-slate-400 font-sans mt-0.5">
                    {dbStatus?.connected 
                      ? 'Enterprise persistence for audit records, dynamic heuristics & ingested values' 
                      : 'Audit records saved locally in data/ directory. Connect MongoDB in Settings.'}
                  </p>
                </div>
                {dbStatus?.latency_ms !== undefined && dbStatus.latency_ms !== null && (
                  <div className="text-right font-mono shrink-0 ml-3">
                    <span className="text-3xs text-slate-500 uppercase block">Ping Latency</span>
                    <span className="text-xs font-bold text-sky-400">{dbStatus.latency_ms}ms</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  onTabChange('settings');
                  setCurtainOpen(false);
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-sky-300 border border-sky-500/30 hover:border-sky-500/60 text-xs font-mono font-bold flex items-center justify-between transition-all cursor-pointer"
              >
                <span>Manage Database & URI in Settings</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-sky-400" />
              </button>
            </div>

            {/* Live Executive Telemetry Panel */}
            <div className="nav-13-curtain-telemetry space-y-4">
              <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-sky-400 block">
                // LIVE TELEMETRY SNAPSHOT
              </span>

              {/* Stat 1: Fleet Compliance */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Fleet Compliance Index</span>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                    OPTIMAL
                  </span>
                </div>
                <div className="text-3xl font-black text-white font-mono">{avgComplianceScore}%</div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${avgComplianceScore}%` }} />
                </div>
              </div>

              {/* Stat 2: Blade Mesh */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
                    <Server className="h-3.5 w-3.5 text-sky-400" />
                    <span>Monitored</span>
                  </div>
                  <div className="text-xl font-extrabold text-white font-mono">{totalDevices} Blades</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
                    <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                    <span>Deviations</span>
                  </div>
                  <div className="text-xl font-extrabold text-rose-400 font-mono">{openDeviationsCount} Open</div>
                </div>
              </div>

              {/* Quick Framework Tags */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                <span className="text-[11px] font-mono text-slate-400 block font-semibold">Active Benchmark Profiles</span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-950 text-sky-300 border border-sky-500/30">CIS v8</span>
                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-950 text-emerald-300 border border-emerald-500/30">NIST SP 800-53</span>
                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-950 text-purple-300 border border-purple-500/30">DISA STIG</span>
                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-950 text-amber-300 border border-amber-500/30">ISO 27001</span>
                </div>
              </div>

              {/* Bottom System Pulse */}
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-3 border-t border-slate-800">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Multi-Vendor Mesh Online</span>
                </span>
                <span className="text-sky-400 font-semibold">v2.4 Enterprise</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </>
  );
};

export default Navigation13;
