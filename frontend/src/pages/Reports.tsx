import React, { useState } from 'react';
import { ArrowLeft, Download, ShieldCheck, ShieldAlert, Terminal, Copy, Check, AlertTriangle } from 'lucide-react';

interface RuleResult {
  id: string;
  name: string;
  description: string;
  benchmark: string;
  severity: string;
  status: string;
  actual: string;
  expected: string;
  remediation: string;
}

interface DeviceRecord {
  id: string;
  filename?: string;
  device_info: {
    hostname?: string;
    vendor: string;
    model?: string;
    os_version?: string;
    serial_number?: string;
  };
  compliance_score: number;
  passed_rules_count: number;
  failed_rules_count: number;
  total_rules: number;
  timestamp: string;
  results: RuleResult[];
  custom_remediation?: string;
  vendor_mismatch?: {
    chosen_vendor?: string;
    detected_vendor?: string;
    chosen?: string;
    detected?: string;
    message?: string;
  };
}

interface ReportsProps {
  record: DeviceRecord;
  onBack: () => void;
}

const Reports: React.FC<ReportsProps> = ({ record, onBack }) => {
  const [copied, setCopied] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Fail' | 'Pass'>('All');
  const info = record.device_info;

  const handleCopyRemediation = (script: string) => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-rose-400 bg-rose-500/15 border-rose-500/30';
      case 'high': return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
      case 'medium': return 'text-sky-400 bg-sky-500/15 border-sky-500/30';
      default: return 'text-slate-400 bg-slate-500/15 border-slate-500/30';
    }
  };

  const filteredResults = record.results.filter(r => {
    if (filterStatus === 'All') return true;
    return r.status === filterStatus;
  });

  // Compile standard remediation script
  let remediationScript = `! --- AUTOMATED REMEDIATION CLI SCRIPT FOR ${info.vendor.toUpperCase()} ---\n`;
  remediationScript += `! Hostname: ${info.hostname || 'N/A'}\n`;
  remediationScript += `! Generated: 2026-08-27\n\n`;

  if (record.custom_remediation) {
    remediationScript = record.custom_remediation;
  } else {
    const failedRemediationLines = record.results
      .filter(r => r.status === 'Fail' && r.remediation)
      .map(r => r.remediation);

    if (info.vendor.toLowerCase() === 'juniper') {
      remediationScript = remediationScript.replace(/!/g, '#');
      remediationScript += 'configure\n\n';
      failedRemediationLines.forEach(line => {
        remediationScript += `${line}\n`;
      });
      remediationScript += '\ncommit check\n# If check succeeds, execute: commit and-quit\n';
    } else {
      remediationScript += 'configure terminal\n\n';
      failedRemediationLines.forEach(line => {
        remediationScript += `${line}\n`;
      });
      remediationScript += '\nend\nwrite memory\n';
    }
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer glass-pill hover:bg-white/10 px-3 py-1.5 rounded-xl active:scale-95"
        >
          <ArrowLeft className="h-4 w-4 text-cyan-400" />
          <span>Return to Dashboard</span>
        </button>

        <a 
          href={`/api/reports/${record.id}/pdf`}
          download
          className="flex items-center space-x-2 px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-cyan-500/20 active:scale-95"
        >
          <Download className="h-4 w-4" />
          <span>Download PDF Dossier</span>
        </a>
      </div>

      {/* Hero Summary Card */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
          <div className="md:col-span-2 space-y-3.5">
            <div>
              <span className="text-3xs uppercase tracking-wider font-extrabold text-cyan-400 glass-pill px-2.5 py-1 rounded-md border border-cyan-500/30">
                Official Compliance Dossier
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-2 tracking-tight">
                {info.hostname || 'Unknown Hostname'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Source: <span className="glass-pill text-slate-200 px-2 py-0.5 rounded-md">{record.filename || 'live_fetch.cfg'}</span>
              </p>
              {record.vendor_mismatch && (
                <div className="mt-3 p-2.5 bg-amber-500/15 border border-amber-500/30 rounded-xl flex items-center space-x-2 text-3xs text-amber-200">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>
                    <b>Platform Auto-Corrected:</b> Targeted platform was requested as <span className="font-black text-white bg-amber-500/30 px-1.5 py-0.5 rounded border border-amber-400/40">{record.vendor_mismatch.chosen_vendor || record.vendor_mismatch.chosen}</span>, but file syntax was auto-detected as <span className="font-black text-cyan-300 bg-cyan-500/30 px-1.5 py-0.5 rounded border border-cyan-400/40">{record.vendor_mismatch.detected_vendor || record.vendor_mismatch.detected}</span> and evaluated accordingly.
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 border-t border-white/10 pt-3.5">
              <div className="glass-card-subtle p-2.5 rounded-xl">
                <p className="text-4xs text-slate-400 font-extrabold uppercase tracking-widest">Platform</p>
                <p className="text-xs font-black text-white mt-0.5">{info.vendor || 'Generic'}</p>
              </div>
              <div className="glass-card-subtle p-2.5 rounded-xl">
                <p className="text-4xs text-slate-400 font-extrabold uppercase tracking-widest">Hardware</p>
                <p className="text-xs font-black text-white mt-0.5">{info.model || 'Unknown'}</p>
              </div>
              <div className="glass-card-subtle p-2.5 rounded-xl">
                <p className="text-4xs text-slate-400 font-extrabold uppercase tracking-widest">Firmware</p>
                <p className="text-xs font-black text-white mt-0.5">{info.os_version || 'Unknown'}</p>
              </div>
              <div className="glass-card-subtle p-2.5 rounded-xl">
                <p className="text-4xs text-slate-400 font-extrabold uppercase tracking-widest">Timestamp</p>
                <p className="text-xs font-black text-white mt-0.5 font-mono text-3xs">{record.timestamp}</p>
              </div>
            </div>
          </div>

          {/* Glowing Score Badge */}
          <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-white/10 pl-0 md:pl-5 pt-4 md:pt-0">
            <div className={`h-26 w-26 rounded-2xl border-2 flex flex-col items-center justify-center shadow-xl transition-transform hover:scale-105 ${
              record.compliance_score >= 80 
                ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-400 shadow-emerald-500/20' 
                : record.compliance_score >= 50 
                ? 'border-amber-500/60 bg-amber-500/15 text-amber-400 shadow-amber-500/20' 
                : 'border-rose-500/60 bg-rose-500/15 text-rose-400 shadow-rose-500/20'
            }`}>
              <span className="text-3xl font-black tracking-tight">{record.compliance_score}%</span>
              <span className="text-4xs uppercase tracking-widest font-extrabold mt-0.5">POSTURE SCORE</span>
            </div>
            
            <div className="flex space-x-5 mt-3.5 text-center">
              <div>
                <p className="text-sm font-black text-emerald-400">{record.passed_rules_count}</p>
                <p className="text-4xs text-slate-400 uppercase tracking-widest font-extrabold">Passed</p>
              </div>
              <div className="border-l border-white/20"></div>
              <div>
                <p className="text-sm font-black text-rose-400">{record.failed_rules_count}</p>
                <p className="text-4xs text-slate-400 uppercase tracking-widest font-extrabold">Failed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Findings (Left) & CLI Remediation (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Findings List (3 Columns) */}
        <div className="lg:col-span-3 space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white">Compliance Findings</h3>
            
            {/* Filter Pills */}
            <div className="flex items-center space-x-1 glass-pill p-1 rounded-xl">
              {(['All', 'Fail', 'Pass'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-2.5 py-0.5 rounded-lg text-3xs font-bold transition-all cursor-pointer ${
                    filterStatus === status 
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-xs' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {status === 'All' ? `All (${record.results.length})` : status === 'Fail' ? `Deviations (${record.failed_rules_count})` : `Passed (${record.passed_rules_count})`}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredResults.map((res, index) => (
              <div 
                key={index} 
                className={`glass-card rounded-xl p-4 flex items-start space-x-3 transition-all ${
                  res.status === 'Pass' ? '' : 'border-rose-500/30 bg-rose-500/5'
                }`}
              >
                {res.status === 'Pass' ? (
                  <div className="p-1.5 bg-emerald-500/15 text-emerald-400 rounded-lg shrink-0 mt-0.5 border border-emerald-500/30">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                ) : (
                  <div className="p-1.5 bg-rose-500/15 text-rose-400 rounded-lg shrink-0 mt-0.5 border border-rose-500/30">
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                )}
                
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-3xs font-mono font-bold text-cyan-300 glass-pill px-2 py-0.5 rounded-md">
                        {res.id}
                      </span>
                      <span className="text-3xs font-extrabold text-purple-300 uppercase tracking-wide glass-pill px-2 py-0.5 rounded-md">
                        {res.benchmark}
                      </span>
                      <span className={`text-3xs font-extrabold px-2 py-0.5 rounded-md border uppercase ${getSeverityStyle(res.severity)}`}>
                        {res.severity}
                      </span>
                    </div>
                    <span className={`text-3xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      res.status === 'Pass' ? 'text-emerald-400 bg-emerald-500/15' : 'text-rose-400 bg-rose-500/15'
                    }`}>
                      {res.status}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-xs text-white">{res.name}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{res.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-3xs font-mono glass-card-subtle p-2.5 rounded-xl">
                    <div>
                      <span className="text-slate-500 uppercase block font-bold">Requirement</span>
                      <span className="text-slate-300 font-bold block mt-0.5">{res.expected}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase block font-bold">Detected</span>
                      <span className={`font-bold block mt-0.5 ${res.status === 'Pass' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {res.actual}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Remediation script section (2 Columns) */}
        <div className="lg:col-span-2 space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <span>Actionable CLI Fix Script</span>
            </h3>
            <button 
              onClick={() => handleCopyRemediation(remediationScript)}
              className="px-2.5 py-1 glass-pill hover:bg-white/15 text-slate-200 rounded-lg text-3xs font-extrabold flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95 border border-cyan-500/20"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? 'Copied!' : 'Copy Script'}</span>
            </button>
          </div>

          <div className="bg-slate-950/90 backdrop-blur-2xl border border-cyan-500/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
            <div className="bg-slate-900/90 px-3.5 py-2.5 border-b border-white/10 flex items-center justify-between text-3xs font-mono font-bold uppercase tracking-wider text-slate-400">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-rose-500/80"></span>
                <span className="w-2 h-2 rounded-full bg-amber-500/80"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-500/80"></span>
                <span className="text-slate-300 ml-1.5 font-sans font-bold">Remediation Terminal</span>
              </div>
              {record.custom_remediation && <span className="text-cyan-400 font-sans">AI Script</span>}
            </div>
            <pre className="p-4 text-xs font-mono text-cyan-300 overflow-y-auto whitespace-pre-wrap flex-1 scrollbar-thin select-all leading-relaxed">
              {remediationScript}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
