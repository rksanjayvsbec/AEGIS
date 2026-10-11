import React, { useState, useEffect } from 'react';
import { Cpu, RefreshCw, Plus, CheckCircle, Database, ArrowRight, Sparkles, Layers, Trash2 } from 'lucide-react';

interface UnrecognizedCmd {
  command: string;
  vendor: string;
  suggested_parameter: string;
}

interface MappedRule {
  command_pattern: string;
  parameter: string;
  value: any;
  vendor: string;
}

interface TrainingProps {
  onMappingApplied: () => void;
}

const PARAMETER_OPTIONS = [
  { value: 'ssh_enabled', label: 'SSH Server Enabled (bool)' },
  { value: 'ssh_version', label: 'SSH Protocol Version (string)' },
  { value: 'telnet_disabled', label: 'Telnet Access Disabled (bool)' },
  { value: 'http_disabled', label: 'Insecure HTTP Server Disabled (bool)' },
  { value: 'https_enabled', label: 'Secure HTTPS Server Enabled (bool)' },
  { value: 'password_encryption_enabled', label: 'Local Passwords Encrypted (bool)' },
  { value: 'min_password_length', label: 'Minimum Password Length (number)' },
  { value: 'exec_timeout_seconds', label: 'Administrative Session Timeout (seconds)' },
  { value: 'snmp_v3_only', label: 'SNMP v3 Restricted Only (bool)' },
  { value: 'banner_configured', label: 'Warning Login Banner Enabled (bool)' },
  { value: 'logging_enabled', label: 'Central Syslog Enabled (bool)' },
  { value: 'acl_configured', label: 'Access Control Lists Configured (bool)' }
];

const Training: React.FC<TrainingProps> = ({ onMappingApplied }) => {
  const [unrecognized, setUnrecognized] = useState<UnrecognizedCmd[]>([]);
  const [mappings, setMappings] = useState<MappedRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Form mapping states
  const [mappingForm, setMappingForm] = useState({
    command_pattern: '',
    parameter: 'ssh_enabled',
    value_type: 'bool',
    bool_val: 'true',
    text_val: '',
    vendor: 'Generic'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resUnrecognized, resMappings] = await Promise.all([
        fetch('/api/training/unrecognized'),
        fetch('/api/training/mappings')
      ]);
      const dataUnrecognized = await resUnrecognized.json();
      const dataMappings = await resMappings.json();
      setUnrecognized(Array.isArray(dataUnrecognized) ? dataUnrecognized : []);
      setMappings(Array.isArray(dataMappings) ? dataMappings : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectCommandToMap = (cmd: UnrecognizedCmd) => {
    setMappingForm({
      command_pattern: escapeRegex(cmd.command),
      parameter: cmd.suggested_parameter !== 'None' ? cmd.suggested_parameter : 'ssh_enabled',
      value_type: cmd.suggested_parameter.includes('timeout') || cmd.suggested_parameter.includes('length') ? 'number' : 'bool',
      bool_val: 'true',
      text_val: '',
      vendor: cmd.vendor
    });
  };

  const escapeRegex = (str: string) => {
    return str.replace(/[\^$*+?.()|[\]{}]/g, '\\$&')
              .replace(/\d+/g, '(\\d+)');
  };

  const handleDismissCommand = async (command: string) => {
    try {
      await fetch('/api/training/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      fetchData();
      onMappingApplied();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMapping = async (command_pattern: string, parameter: string) => {
    try {
      await fetch('/api/training/mappings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command_pattern, parameter })
      });
      setMessage('Heuristic rule removed. Re-auditing configurations...');
      fetchData();
      onMappingApplied();
      setTimeout(() => setMessage(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mappingForm.command_pattern) return;

    let finalValue: string = mappingForm.bool_val;
    if (mappingForm.value_type === 'number' || mappingForm.value_type === 'string') {
      finalValue = mappingForm.text_val;
    }

    try {
      const response = await fetch('/api/training/map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command_pattern: mappingForm.command_pattern,
          parameter: mappingForm.parameter,
          value: finalValue,
          vendor: mappingForm.vendor
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save mapping');
      }

      setMessage('Dynamic Heuristic mapping saved! All configurations re-analyzed in real time.');
      
      setMappingForm({
        command_pattern: '',
        parameter: 'ssh_enabled',
        value_type: 'bool',
        bool_val: 'true',
        text_val: '',
        vendor: 'Generic'
      });

      fetchData();
      onMappingApplied();
      setTimeout(() => setMessage(null), 5000);

    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <div className="inline-flex items-center space-x-1.5 glass-pill px-3 py-1 rounded-full text-xs font-bold text-cyan-400 mb-2 border border-cyan-500/30">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>Zero-Code Adaptive Training Loop</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Interactive AI Heuristics Studio
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
          Train the normalization engine dynamically on unseen vendor CLI syntaxes without modifying source code or redeploying the backend.
        </p>
      </div>

      {/* Visual Workflow Flowchart Banner */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white rounded-xl shadow-md shadow-cyan-500/20">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-white">How the Dynamic Adaptation Loop Works:</p>
              <p className="text-3xs text-slate-400">Extracts unmapped commands &gt; NLP categorizes field &gt; Saves to local heuristics database &gt; Instant re-audit</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 font-mono text-3xs font-bold">
            <span className="glass-pill text-slate-300 px-2.5 py-1 rounded-lg">Raw CLI</span>
            <ArrowRight className="h-3.5 w-3.5 text-cyan-400" />
            <span className="bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-lg">NLP Classifier</span>
            <ArrowRight className="h-3.5 w-3.5 text-cyan-400" />
            <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg">Standard Schema</span>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-300 flex items-center space-x-2.5 shadow-sm">
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left 2 Columns: Unrecognized Commands list */}
        <div className="md:col-span-2 space-y-4">
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-950/40">
              <div>
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Database className="h-4 w-4 text-cyan-400" />
                  <span>Unrecognized Command Queue ({unrecognized.length})</span>
                </h3>
                <p className="text-3xs text-slate-400 mt-0.5">Discovered command lines lacking explicit parsing logic in the security baseline.</p>
              </div>
              <button 
                onClick={fetchData} 
                className="p-1.5 glass-pill text-slate-400 hover:text-cyan-400 rounded-lg transition-all"
                title="Refresh List"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {unrecognized.length === 0 ? (
              <div className="p-14 text-center text-slate-400 text-xs">
                <div className="w-12 h-12 glass-pill text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <p className="font-bold text-slate-200 text-sm">All Configuration Lines Mapped!</p>
                <p className="text-3xs mt-1 text-slate-400 max-w-xs mx-auto">Upload proprietary or third-party hardware configs to discover new unmapped commands.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5 max-h-[460px] overflow-y-auto scrollbar-thin">
                {unrecognized.map((cmd, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 hover:bg-white/5 flex items-center justify-between transition-colors group"
                  >
                    <div className="space-y-1.5 pr-4 flex-1">
                      <code className="text-xs bg-slate-950 px-3 py-1.5 rounded-xl text-cyan-300 break-all block font-mono border border-cyan-500/20 shadow-inner">
                        {cmd.command}
                      </code>
                      <div className="flex items-center space-x-3 text-3xs text-slate-400 font-medium">
                        <span>Vendor: <b className="text-slate-200">{cmd.vendor}</b></span>
                        <span>•</span>
                        <span>NLP Suggestion: <b className="text-cyan-300 glass-pill px-1.5 py-0.5 rounded">{cmd.suggested_parameter}</b></span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleDismissCommand(cmd.command)}
                        className="px-2.5 py-1.5 glass-pill text-slate-400 hover:text-rose-400 hover:border-rose-500/30 rounded-xl text-3xs font-bold transition-all cursor-pointer"
                        title="Dismiss from queue"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => selectCommandToMap(cmd)}
                        className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-cyan-500/20 cursor-pointer active:scale-95"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Map Rule</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Heuristics List Card */}
          <div className="glass-card rounded-2xl overflow-hidden mt-5">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-950/40">
              <div>
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <span>Active Learned Heuristics ({mappings.length})</span>
                </h3>
                <p className="text-3xs text-slate-400 mt-0.5">Dynamically trained regex rules actively normalizing network configs.</p>
              </div>
            </div>

            {mappings.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <p className="font-medium text-slate-300">No Custom Heuristic Mappings Yet</p>
                <p className="text-3xs mt-1 text-slate-500">Map an unrecognized command above to create your dynamic heuristic rule.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto scrollbar-thin">
                {mappings.map((m, idx) => (
                  <div key={idx} className="p-3.5 hover:bg-white/5 flex items-center justify-between transition-colors group">
                    <div className="space-y-1 pr-3 flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <code className="text-3xs bg-slate-950 px-2 py-0.5 rounded-lg text-emerald-300 font-mono border border-emerald-500/20 truncate block max-w-md">
                          {m.command_pattern}
                        </code>
                        <span className="text-4xs glass-pill px-1.5 py-0.5 rounded text-cyan-300 font-bold">
                          {m.vendor}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-3xs text-slate-400">
                        <span>Maps to: <b className="text-slate-200 font-mono">{m.parameter}</b></span>
                        <span>=</span>
                        <span className="font-bold font-mono text-emerald-400">{String(m.value)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteMapping(m.command_pattern, m.parameter)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 glass-pill hover:border-rose-500/30 rounded-lg transition-all cursor-pointer shrink-0"
                      title="Delete this heuristic rule"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Training Form */}
        <div className="glass-card rounded-2xl p-5 h-fit">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 glass-pill text-cyan-400 rounded-xl">
              <Cpu className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Low-Code Rule Builder</h3>
              <p className="text-3xs text-slate-400">Map regex patterns to compliance targets</p>
            </div>
          </div>

          <form onSubmit={handleMapSubmit} className="space-y-3.5">
            <div>
              <label className="text-3xs font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Command Matcher (Regex)</label>
              <textarea 
                value={mappingForm.command_pattern}
                onChange={(e) => setMappingForm(prev => ({ ...prev, command_pattern: e.target.value }))}
                placeholder="e.g. exec-timeout (\d+) (\d+)"
                rows={2}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs font-bold font-mono focus:outline-none"
              />
              <span className="text-4xs text-slate-500 mt-1 block">Supports regex. Numbers are converted to (\d+) automatically.</span>
            </div>

            <div>
              <label className="text-3xs font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Target Baseline Parameter</label>
              <select
                value={mappingForm.parameter}
                onChange={(e) => {
                  const param = e.target.value;
                  const type = param.includes('timeout') || param.includes('length') ? 'number' : 'bool';
                  setMappingForm(prev => ({ ...prev, parameter: param, value_type: type }));
                }}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs font-bold text-slate-200 cursor-pointer"
              >
                {PARAMETER_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-3xs font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Data Type</label>
              <div className="flex space-x-1.5">
                {['bool', 'number', 'string'].map(type => (
                  <label 
                    key={type}
                    className={`flex-1 py-1.5 rounded-lg text-center border text-3xs font-extrabold capitalize cursor-pointer transition-all ${
                      mappingForm.value_type === type 
                        ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold shadow-xs' 
                        : 'glass-card-subtle text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="value_type"
                      checked={mappingForm.value_type === type}
                      onChange={() => setMappingForm(prev => ({ ...prev, value_type: type }))}
                      className="sr-only"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-3xs font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Normalized Value</label>
              {mappingForm.value_type === 'bool' ? (
                <div className="flex space-x-2">
                  {['true', 'false'].map(val => (
                    <label 
                      key={val}
                      className={`flex-1 py-1.5 rounded-lg text-center border text-xs font-black uppercase cursor-pointer transition-all ${
                        mappingForm.bool_val === val 
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold shadow-xs' 
                          : 'glass-card-subtle text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="bool_val"
                        checked={mappingForm.bool_val === val}
                        onChange={() => setMappingForm(prev => ({ ...prev, bool_val: val }))}
                        className="sr-only"
                      />
                      {val}
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  value={mappingForm.text_val}
                  onChange={(e) => setMappingForm(prev => ({ ...prev, text_val: e.target.value }))}
                  placeholder={mappingForm.value_type === 'number' ? 'e.g. 600' : 'e.g. v2'}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs font-bold text-slate-200"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-3xs font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Vendor Scope</label>
                <select
                  value={mappingForm.vendor}
                  onChange={(e) => setMappingForm(prev => ({ ...prev, vendor: e.target.value }))}
                  className="w-full glass-input rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-200 cursor-pointer"
                >
                  <option value="Generic" className="bg-slate-900">Generic</option>
                  <option value="Cisco" className="bg-slate-900">Cisco</option>
                  <option value="Juniper" className="bg-slate-900">Juniper</option>
                  <option value="Palo Alto" className="bg-slate-900">Palo Alto</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={!mappingForm.command_pattern}
                  className="w-full py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-cyan-500/20 cursor-pointer active:scale-95"
                >
                  Save & Re-Audit
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Training;
