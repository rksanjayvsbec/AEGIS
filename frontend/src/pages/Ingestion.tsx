import React, { useState } from 'react';
import { Upload, Network, ShieldCheck, FileCode, AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import MagicRings from '../components/MagicRings';

interface IngestionProps {
  onAuditComplete: (result: any) => void;
}

const detectVendorFromContent = (text: string): string => {
  const lower = text.toLowerCase();

  // Palo Alto checks
  if (lower.includes('<config') || lower.includes('<devices>') || lower.includes('pan-os') || lower.includes('paloalto')) {
    return 'Palo Alto';
  }

  // Juniper checks
  if (
    lower.includes('junos') ||
    lower.includes('juniper') ||
    lower.includes('system {') ||
    lower.includes('set system') ||
    lower.includes('set interfaces') ||
    lower.includes('root-authentication')
  ) {
    return 'Juniper';
  }

  // SONiC checks
  if (lower.includes('sonic-cli') || lower.includes('sonic') || lower.includes('sonic_version')) {
    return 'SONiC';
  }

  // Arista checks
  if (lower.includes('arista') || lower.includes('eos') || lower.includes('boot-config')) {
    return 'Arista';
  }

  // Cisco checks
  if (
    lower.includes('cisco') ||
    lower.includes('boot system flash') ||
    lower.includes('service password-encryption') ||
    lower.includes('line vty') ||
    lower.includes('line con') ||
    lower.includes('spanning-tree') ||
    lower.includes('transport input')
  ) {
    return 'Cisco';
  }

  const lines = text.split('\n').slice(0, 50);
  if (lines.some(l => l.trim().startsWith('set '))) {
    return 'Juniper';
  }
  if (lines.slice(0, 25).some(l => l.trim().startsWith('!'))) {
    return 'Cisco';
  }

  return 'Generic';
};

const Ingestion: React.FC<IngestionProps> = ({ onAuditComplete }) => {
  const [selectedVendor, setSelectedVendor] = useState<string>('Generic');
  const [platformMismatch, setPlatformMismatch] = useState<{
    chosen: string;
    detected: string;
  } | null>(null);
  const [benchmarks, setBenchmarks] = useState({
    CIS: true,
    NIST: true,
    STIG: true,
    ISO27001: true
  });
  
  // Upload States
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Live Connection States
  const [liveReq, setLiveReq] = useState({
    host: '',
    username: '',
    password: '',
    device_type: 'cisco_ios',
    port: 22
  });
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const handleBenchmarkToggle = (key: keyof typeof benchmarks) => {
    setBenchmarks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploadError(null);
    const file = files[0];

    try {
      // Read content to verify vendor syntax against targeted platform
      const text = await file.text();
      const detected = detectVendorFromContent(text);

      let vendorToSend = selectedVendor;

      // Platform Mismatch Detection
      if (
        selectedVendor !== 'Generic' &&
        detected !== 'Generic' &&
        detected.toLowerCase() !== selectedVendor.toLowerCase()
      ) {
        const chosenVendor = selectedVendor;
        // 1. Show that the platform chosen is wrong
        setPlatformMismatch({
          chosen: chosenVendor,
          detected: detected,
        });

        // 2. Automatically change it to generic
        setSelectedVendor('Generic');
        vendorToSend = 'Generic';

        // Brief delay (2.5s) to allow user to clearly view the wrong platform warning
        // and watch the dropdown smoothly change to "Generic"
        setUploading(true);
        await new Promise(resolve => setTimeout(resolve, 2500));
      } else {
        setPlatformMismatch(null);
        setUploading(true);
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('vendor', vendorToSend);
      
      const activeBenchmarks = Object.entries(benchmarks)
        .filter(([_, active]) => active)
        .map(([name]) => name);
      formData.append('benchmarks', JSON.stringify(activeBenchmarks));

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Upload and parse failed');
      }

      const result = await response.json();
      onAuditComplete(result);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
      // Reset file input so user can re-upload or test different files repeatedly
      e.target.value = '';
    }
  };

  const handleLiveConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveReq.host || !liveReq.username || !liveReq.password) {
      setConnectError('Please fill out all connection fields');
      return;
    }

    setConnecting(true);
    setConnectError(null);

    try {
      const response = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(liveReq),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to connect and fetch configurations');
      }

      const result = await response.json();
      onAuditComplete(result);
    } catch (err: any) {
      setConnectError(err.message || 'Live network connection failed');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <div className="inline-flex items-center space-x-1.5 glass-pill px-3 py-1 rounded-full text-xs font-bold text-cyan-400 mb-2 border border-cyan-500/30">
          <FileCode className="h-3.5 w-3.5 text-cyan-400" />
          <span>Universal Ingestion Gateway</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Device Configuration Ingestion
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
          Upload offline multi-vendor CLI text dumps, or perform active SSH credentialed audits against live network hardware.
        </p>
      </div>

      {/* Benchmark Checklists Selection */}
      <div className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
              <ShieldCheck className="h-4.5 w-4.5 text-cyan-400" />
              <span>Target Compliance Frameworks</span>
            </h3>
            <p className="text-3xs text-slate-400 mt-0.5">Select standards to evaluate against this ingestion cycle.</p>
          </div>
          <span className="text-3xs font-mono font-bold text-cyan-400 glass-pill px-2.5 py-1 rounded-lg border border-cyan-500/30">
            {Object.values(benchmarks).filter(Boolean).length} Frameworks Active
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(benchmarks).map(([name, active]) => (
            <label 
              key={name} 
              className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                active 
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-white shadow-md shadow-cyan-500/10' 
                  : 'glass-card-subtle text-slate-400 hover:border-slate-600'
              }`}
            >
              <div>
                <span className="font-extrabold text-xs tracking-tight block text-white">{name}</span>
                <span className="text-4xs text-slate-400 block font-medium">
                  {name === 'CIS' ? 'CIS Benchmarks v8' : name === 'NIST' ? 'NIST SP 800-53 R5' : name === 'STIG' ? 'DoD DISA STIGs' : 'ISO/IEC 27001'}
                </span>
              </div>
              <input 
                type="checkbox" 
                checked={active} 
                onChange={() => handleBenchmarkToggle(name as keyof typeof benchmarks)}
                className="sr-only"
              />
              <span className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${active ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-xs' : 'border-slate-700 bg-slate-900/60'}`}>
                {active && <span className="text-3xs font-black">✓</span>}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: File Upload */}
        <div className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-white flex items-center space-x-2">
                <Upload className="h-4.5 w-4.5 text-cyan-400" />
                <span>Offline Configuration Upload</span>
              </h2>
              <span className="text-3xs font-mono font-bold glass-pill text-slate-300 px-2 py-0.5 rounded-md">
                100% Offline
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Upload raw network command configuration files from local storage.</p>

            <div className="mt-4 space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-3xs font-extrabold uppercase tracking-wider text-slate-400">
                    Target Vendor Platform
                  </label>
                  {platformMismatch && (
                    <span className="text-4xs font-black uppercase tracking-wider text-amber-400 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center space-x-1 animate-pulse">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Auto-Reset to Generic</span>
                    </span>
                  )}
                </div>
                <select 
                  value={selectedVendor} 
                  onChange={(e) => {
                    setSelectedVendor(e.target.value);
                    if (platformMismatch) setPlatformMismatch(null);
                  }}
                  className={`w-full glass-input rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-200 focus:outline-none transition-all cursor-pointer ${
                    platformMismatch ? 'border-amber-500/60 ring-2 ring-amber-500/30' : ''
                  }`}
                >
                  <option value="Generic">Generic (Auto-Detect Vendor)</option>
                  <option value="Cisco">Cisco IOS / IOS-XE / Nexus</option>
                  <option value="Juniper">Juniper JunOS (Curly / Set Syntax)</option>
                  <option value="Palo Alto">Palo Alto PAN-OS XML / CLI</option>
                  <option value="Arista">Arista EOS</option>
                  <option value="SONiC">SONiC Open Disaggregated OS</option>
                </select>
              </div>

              {/* ⚠️ Wrong Platform Alert Banner */}
              {platformMismatch && (
                <div className="p-3.5 bg-gradient-to-r from-amber-950/80 to-rose-950/60 border-2 border-amber-500/50 rounded-2xl shadow-xl shadow-amber-950/40 animate-fadeIn relative">
                  <button 
                    onClick={() => setPlatformMismatch(null)}
                    className="absolute top-2.5 right-2.5 text-amber-400 hover:text-white transition-colors cursor-pointer"
                    title="Dismiss alert"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <div className="flex items-start space-x-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0 mt-0.5">
                      <AlertTriangle className="h-4 w-4 animate-bounce" />
                    </div>
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-black text-amber-300 tracking-wide uppercase">
                          Wrong Platform Selected!
                        </span>
                      </div>
                      <p className="text-3xs text-amber-200/90 leading-relaxed">
                        You selected <span className="font-black text-white px-1.5 py-0.5 rounded bg-amber-500/30 border border-amber-400/40">{platformMismatch.chosen}</span>, but the uploaded configuration belongs to <span className="font-black text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-500/30 border border-cyan-400/40">{platformMismatch.detected}</span>.
                      </p>
                      <div className="flex items-center space-x-1.5 text-3xs font-bold text-amber-300 pt-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>Platform chosen was wrong — automatically changed to <span className="text-emerald-300 font-mono font-black bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">Generic (Auto-Detect)</span>.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-2 border-dashed border-cyan-500/30 hover:border-cyan-400 bg-slate-950/60 rounded-2xl p-7 text-center transition-all relative cursor-pointer group overflow-hidden">
                {/* Ambient MagicRings Scanner Background Effect */}
                <div className="absolute inset-0 pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity">
                  <MagicRings
                    color="#0284c7"
                    colorTwo="#38bdf8"
                    ringCount={5}
                    speed={0.8}
                    attenuation={12}
                    lineThickness={1.5}
                    baseRadius={0.3}
                    radiusStep={0.12}
                    opacity={0.7}
                    followMouse={true}
                    hoverScale={1.2}
                    clickBurst={true}
                  />
                </div>

                <input 
                  type="file" 
                  onChange={handleFileUpload} 
                  disabled={uploading}
                  className="absolute inset-0 opacity-0 cursor-pointer z-20"
                  accept=".cfg,.conf,.txt,.xml,.set"
                />
                <div className="relative z-10">
                  <div className="p-3 glass-pill w-12 h-12 rounded-xl mx-auto flex items-center justify-center group-hover:scale-110 transition-all text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/10">
                    <Upload className="h-6 w-6" />
                  </div>
                  <p className="font-extrabold text-xs text-white mt-2.5 group-hover:text-cyan-400 transition-colors">
                    {uploading ? 'Parsing & Normalizing...' : 'Drop Configuration File Here'}
                  </p>
                  <p className="text-4xs text-slate-400 mt-0.5">or click to browse from device</p>
                  
                  {/* Supported Formats Chips */}
                  <div className="flex items-center justify-center space-x-1.5 mt-3">
                    {['.cfg', '.conf', '.set', '.txt', '.xml'].map(ext => (
                      <span key={ext} className="text-4xs font-mono font-bold glass-pill text-slate-300 px-1.5 py-0.5 rounded-md">
                        {ext}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {uploadError && (
            <div className="mt-3.5 p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-semibold">
              <b>Error:</b> {uploadError}
            </div>
          )}

          {uploading && (
            <div className={`mt-3.5 p-3 rounded-xl text-xs font-semibold animate-pulse flex items-center space-x-2 border ${
              platformMismatch 
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' 
                : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-ping ${platformMismatch ? 'bg-amber-400' : 'bg-cyan-400'}`}></span>
              <span>
                {platformMismatch 
                  ? `Correcting target platform to Generic (Auto-Detect)... analyzing as ${platformMismatch.detected}...`
                  : 'Running NLP Normalization & Compliance Heuristics...'}
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Live Netmiko Discovery */}
        <div className="glass-card rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-white flex items-center space-x-2">
              <Network className="h-4.5 w-4.5 text-cyan-400" />
              <span>Live SSH Network Discovery</span>
            </h2>
            <span className="text-3xs font-mono font-bold glass-pill text-cyan-400 px-2 py-0.5 rounded-md border border-cyan-500/30">
              Netmiko Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Audit running devices live by querying configurations through SSH protocol.</p>

          <form onSubmit={handleLiveConnectSubmit} className="mt-4 space-y-3.5">
            <div className="grid grid-cols-3 gap-2.5">
              <div className="col-span-2">
                <label className="text-3xs font-extrabold uppercase tracking-wider text-slate-400 block mb-1">IP / Hostname</label>
                <input 
                  type="text" 
                  value={liveReq.host} 
                  onChange={(e) => setLiveReq(prev => ({ ...prev, host: e.target.value }))}
                  placeholder="e.g. 192.168.10.1"
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs font-semibold placeholder-slate-500"
                />
              </div>
              <div>
                <label className="text-3xs font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Port</label>
                <input 
                  type="number" 
                  value={liveReq.port} 
                  onChange={(e) => setLiveReq(prev => ({ ...prev, port: parseInt(e.target.value) || 22 }))}
                  placeholder="22"
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-3xs font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Username</label>
                <input 
                  type="text" 
                  value={liveReq.username} 
                  onChange={(e) => setLiveReq(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="admin"
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs font-semibold placeholder-slate-500"
                />
              </div>
              <div>
                <label className="text-3xs font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Password</label>
                <input 
                  type="password" 
                  value={liveReq.password} 
                  onChange={(e) => setLiveReq(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs font-semibold placeholder-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="text-3xs font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Device Driver</label>
              <select 
                value={liveReq.device_type} 
                onChange={(e) => setLiveReq(prev => ({ ...prev, device_type: e.target.value }))}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs font-bold text-slate-200 cursor-pointer"
              >
                <option value="cisco_ios">Cisco IOS / IOS-XE (cisco_ios)</option>
                <option value="juniper_junos">Juniper JunOS (juniper_junos)</option>
                <option value="paloalto_panos">Palo Alto PAN-OS (paloalto_panos)</option>
                <option value="arista_eos">Arista EOS (arista_eos)</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={connecting}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer active:scale-98"
            >
              <Network className="h-4 w-4" />
              <span>{connecting ? 'Querying Live Shell...' : 'Connect & Audit Hardware'}</span>
            </button>
          </form>

          {connectError && (
            <div className="mt-3.5 p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-semibold">
              <b>Error:</b> {connectError}
            </div>
          )}

          {connecting && (
            <div className="mt-3.5 p-3 bg-cyan-500/15 border border-cyan-500/30 rounded-xl text-xs text-cyan-300 font-semibold animate-pulse flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>Establishing SSH session to network switch...</span>
            </div>
          )}

          <div className="mt-3.5 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-3xs text-cyan-300 font-medium">
            <span className="font-bold text-cyan-200 block mb-0.5">💡 Demo Tip for Judges</span>
            Use host <b>127.0.0.1</b> or username <b>mock</b> to simulate an interactive SSH shell session!
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ingestion;
