import React, { useState, useEffect } from 'react';
import { 
  History, 
  Clock, 
  FileText, 
  Trash2, 
  Download, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  ExternalLink, 
  Filter, 
  Sparkles, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Layers, 
  Database,
  ArrowRight
} from 'lucide-react';

export interface IngestedParamValue {
  rule_id: string;
  name: string;
  description: string;
  benchmark: string;
  severity: string;
  actual: string;
  expected: string;
  status: string;
  remediation?: string;
}

export interface IngestedRecord {
  id: string;
  filename: string;
  timestamp: string;
  device_info: {
    hostname?: string;
    vendor?: string;
    model?: string;
    os_version?: string;
    serial_number?: string;
  };
  compliance_score: number;
  passed_rules_count: number;
  failed_rules_count: number;
  total_rules: number;
  unrecognized_commands: string[];
  param_values: IngestedParamValue[];
  raw_config: string;
  raw_config_lines: number;
}

export interface IngestedHeuristic {
  command_pattern: string;
  parameter: string;
  value: any;
  vendor: string;
}

export interface IngestionHistoryData {
  records: IngestedRecord[];
  heuristics: IngestedHeuristic[];
  summary: {
    total_records: number;
    total_heuristics: number;
    unique_vendors: string[];
    storage_mode: string;
    database_connected: boolean;
    database_name: string;
  };
}

interface HistoryPageProps {
  onSelectRecord?: (id: string) => void;
  onRecordsChange?: () => void;
  onNavigateToIngestion?: () => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ 
  onSelectRecord, 
  onRecordsChange,
  onNavigateToIngestion 
}) => {
  const [historyData, setHistoryData] = useState<IngestionHistoryData | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [historyTab, setHistoryTab] = useState<'records' | 'heuristics'>('records');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'compliant' | 'warning' | 'critical'>('all');
  const [expandedRecordIds, setExpandedRecordIds] = useState<Set<string>>(new Set());
  const [expandedConfigIds, setExpandedConfigIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clearingHistory, setClearingHistory] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [historyFeedback, setHistoryFeedback] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch('/api/history/ingested');
      if (response.ok) {
        const data = await response.json();
        setHistoryData(data);
      }
    } catch (e) {
      console.error('Failed to load ingestion history:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const toggleExpandRecord = (id: string) => {
    setExpandedRecordIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleExpandAll = () => {
    if (!historyData?.records) return;
    if (expandedRecordIds.size === historyData.records.length) {
      setExpandedRecordIds(new Set());
    } else {
      setExpandedRecordIds(new Set(historyData.records.map(r => r.id)));
    }
  };

  const toggleExpandConfig = (id: string) => {
    setExpandedConfigIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopyConfig = (id: string, config: string) => {
    navigator.clipboard.writeText(config);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleExportHistory = () => {
    if (!historyData) return;
    const blob = new Blob([JSON.stringify(historyData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegis_ingested_values_history_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ingested audit record?')) return;
    setDeletingId(id);
    try {
      const response = await fetch(`/api/records/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setHistoryFeedback('Record removed from history.');
        fetchHistory();
        if (onRecordsChange) onRecordsChange();
        setTimeout(() => setHistoryFeedback(null), 3000);
      }
    } catch (e: any) {
      setHistoryFeedback(`Error deleting record: ${e.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearHistoryConfirm = async () => {
    setClearingHistory(true);
    setShowClearConfirm(false);
    try {
      const response = await fetch('/api/history/clear', { method: 'DELETE' });
      if (response.ok) {
        setHistoryFeedback('All ingestion history has been cleared.');
        fetchHistory();
        if (onRecordsChange) onRecordsChange();
        setTimeout(() => setHistoryFeedback(null), 4000);
      }
    } catch (e: any) {
      setHistoryFeedback(`Error clearing history: ${e.message}`);
    } finally {
      setClearingHistory(false);
    }
  };

  const filteredRecords = (historyData?.records || []).filter(r => {
    if (vendorFilter !== 'all' && (r.device_info.vendor || '').toLowerCase() !== vendorFilter.toLowerCase()) {
      return false;
    }
    if (statusFilter === 'compliant' && r.compliance_score < 80) return false;
    if (statusFilter === 'warning' && (r.compliance_score < 50 || r.compliance_score >= 80)) return false;
    if (statusFilter === 'critical' && r.compliance_score >= 50) return false;

    if (!historySearch.trim()) return true;
    const q = historySearch.toLowerCase();
    const matchMeta = 
      (r.filename || '').toLowerCase().includes(q) ||
      (r.device_info.hostname || '').toLowerCase().includes(q) ||
      (r.device_info.vendor || '').toLowerCase().includes(q) ||
      (r.device_info.model || '').toLowerCase().includes(q) ||
      (r.id || '').toLowerCase().includes(q) ||
      (r.timestamp || '').toLowerCase().includes(q);
    
    if (matchMeta) return true;

    return r.param_values.some(p => 
      p.name.toLowerCase().includes(q) || 
      p.actual.toLowerCase().includes(q) ||
      p.expected.toLowerCase().includes(q) ||
      p.rule_id.toLowerCase().includes(q)
    );
  });

  const filteredHeuristics = (historyData?.heuristics || []).filter(h => {
    if (vendorFilter !== 'all' && (h.vendor || '').toLowerCase() !== vendorFilter.toLowerCase()) {
      return false;
    }
    if (!historySearch.trim()) return true;
    const q = historySearch.toLowerCase();
    return h.command_pattern.toLowerCase().includes(q) ||
      h.parameter.toLowerCase().includes(q) ||
      String(h.value).toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      
      {/* 🧭 PAGE HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 glass-pill px-3 py-1 rounded-full text-xs font-bold text-cyan-400 mb-2 border border-cyan-500/30">
            <History className="h-3.5 w-3.5 text-cyan-400" />
            <span>Immutable Audit & Ingestion Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Ingestion History & Extracted Parameters
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5 max-w-2xl">
            Detailed historical ledger of all ingested network device configurations, extracted security baseline parameters, and dynamic heuristics.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center space-x-2 self-start sm:self-center">
          <button
            onClick={fetchHistory}
            disabled={loadingHistory}
            className="p-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 transition-all cursor-pointer text-xs flex items-center space-x-2 border border-slate-700/60 shadow-sm"
            title="Refresh ingestion history"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingHistory ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="font-semibold text-xs">Sync Data</span>
          </button>

          <button
            onClick={handleExportHistory}
            disabled={!historyData || historyData.records.length === 0}
            className="p-2 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 transition-all cursor-pointer text-xs flex items-center space-x-2 border border-sky-500/30 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            title="Download complete history as JSON"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="font-semibold text-xs">Export JSON</span>
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            disabled={clearingHistory || !historyData || historyData.records.length === 0}
            className="p-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all cursor-pointer text-xs flex items-center space-x-2 border border-rose-500/30 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            title="Purge all ingested records"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="font-semibold text-xs">Clear All</span>
          </button>
        </div>
      </div>

      {/* Feedback banner */}
      {historyFeedback && (
        <div className="p-3.5 bg-cyan-500/15 border border-cyan-500/30 rounded-2xl text-xs font-semibold text-cyan-300 flex items-center space-x-2.5 animate-fadeIn">
          <CheckCircle className="h-4 w-4 text-cyan-400 shrink-0" />
          <span>{historyFeedback}</span>
        </div>
      )}

      {/* Clear All Confirmation Modal/Banner */}
      {showClearConfirm && (
        <div className="p-4 bg-rose-950/80 border border-rose-500/40 rounded-2xl space-y-2.5 animate-fadeIn shadow-2xl shadow-rose-950/50">
          <div className="flex items-center space-x-2 text-rose-300 text-sm font-bold">
            <AlertTriangle className="h-4.5 w-4.5 text-rose-400 shrink-0" />
            <span>Are you sure you want to delete ALL ingested records and audit history?</span>
          </div>
          <p className="text-xs text-rose-200/80 max-w-3xl leading-relaxed">
            This action cannot be undone. All audit reports, extracted parameter histories, and generated PDF records in MongoDB and local storage will be permanently erased.
          </p>
          <div className="flex items-center space-x-2.5 pt-1">
            <button
              onClick={handleClearHistoryConfirm}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all shadow-md shadow-rose-600/30"
            >
              Yes, Purge Everything
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 📊 INGESTION METRICS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="glass-card rounded-2xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-3xs uppercase font-mono tracking-wider font-bold">Ingested Configs</span>
            <FileText className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {historyData?.summary.total_records ?? 0}
          </div>
          <span className="text-3xs text-slate-500 font-mono mt-0.5 block">Audited device records</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-3xs uppercase font-mono tracking-wider font-bold">Dynamic Heuristics</span>
            <Sparkles className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400 font-mono">
            {historyData?.summary.total_heuristics ?? 0}
          </div>
          <span className="text-3xs text-slate-500 font-mono mt-0.5 block">Learned CLI rules</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-3xs uppercase font-mono tracking-wider font-bold">Monitored Platforms</span>
            <Layers className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-sm font-black text-slate-200 mt-1 truncate" title={historyData?.summary.unique_vendors.join(', ')}>
            {historyData?.summary.unique_vendors.length ? historyData.summary.unique_vendors.join(', ') : 'None'}
          </div>
          <span className="text-3xs text-slate-500 font-mono mt-0.5 block">Multi-vendor CLI syntaxes</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-3xs uppercase font-mono tracking-wider font-bold">Storage Cluster</span>
            <Database className="h-4 w-4 text-emerald-400" />
          </div>
          <div className={`text-sm font-black mt-1 flex items-center space-x-1.5 ${
            historyData?.summary.database_connected ? 'text-emerald-400' : 'text-amber-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${historyData?.summary.database_connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{historyData?.summary.database_connected ? 'MongoDB Cluster' : 'Local Fallback'}</span>
          </div>
          <span className="text-3xs text-slate-500 font-mono mt-0.5 block truncate">
            {historyData?.summary.database_name || 'aegis_auditor'}
          </span>
        </div>
      </div>

      {/* 🔍 FILTER & TAB NAVIGATION TOOLBAR */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800/80 space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Main View Tabs */}
          <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setHistoryTab('records')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-2 ${
                historyTab === 'records'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Audited Files & Values</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-3xs text-cyan-400 font-mono">
                {historyData?.records.length ?? 0}
              </span>
            </button>

            <button
              onClick={() => setHistoryTab('heuristics')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-2 ${
                historyTab === 'heuristics'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Dynamic Heuristics</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-3xs text-purple-400 font-mono">
                {historyData?.heuristics.length ?? 0}
              </span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Search hostname, filename, rule ID, or extracted value..."
              className="w-full glass-input rounded-xl pl-9 pr-8 py-2 text-xs placeholder-slate-500 font-mono"
            />
            {historySearch && (
              <button
                onClick={() => setHistorySearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Expand/Collapse All Button */}
          {historyTab === 'records' && historyData && historyData.records.length > 0 && (
            <button
              onClick={toggleExpandAll}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs font-bold flex items-center space-x-1.5 border border-slate-700/60 cursor-pointer transition-all self-start md:self-auto"
            >
              {expandedRecordIds.size === historyData.records.length ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  <span>Collapse All</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  <span>Expand All Values</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Vendor & Status Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-slate-800/70">
          <div className="flex items-center space-x-1.5 text-slate-400 text-3xs font-mono uppercase font-bold mr-1">
            <Filter className="h-3 w-3 text-cyan-400" />
            <span>Platform:</span>
          </div>

          {['all', ...(historyData?.summary.unique_vendors || [])].map((v) => (
            <button
              key={v}
              onClick={() => setVendorFilter(v)}
              className={`px-2.5 py-1 rounded-lg text-3xs font-bold uppercase transition-all cursor-pointer ${
                vendorFilter.toLowerCase() === v.toLowerCase()
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {v}
            </button>
          ))}

          {historyTab === 'records' && (
            <>
              <span className="text-slate-700 mx-1">|</span>
              <div className="text-slate-400 text-3xs font-mono uppercase font-bold mr-1">
                <span>Compliance:</span>
              </div>
              {(['all', 'compliant', 'warning', 'critical'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-lg text-3xs font-bold uppercase transition-all cursor-pointer ${
                    statusFilter === s
                      ? 'bg-slate-700 text-white border border-slate-500'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* ⏳ LOADING STATE */}
      {loadingHistory && (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400 text-xs">
          <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
          <span className="font-semibold">Loading historical ingestions and parameter matrices...</span>
        </div>
      )}

      {/* 📋 RECORDS VIEW */}
      {!loadingHistory && historyTab === 'records' && (
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 p-8 space-y-3">
              <FileText className="h-10 w-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">No Ingested Records Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {historySearch || vendorFilter !== 'all' || statusFilter !== 'all'
                  ? 'No historical audit matches your current search filters. Try clearing your search.'
                  : 'No configuration audits have been recorded yet.'}
              </p>
              {onNavigateToIngestion && (
                <button
                  onClick={onNavigateToIngestion}
                  className="px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-500/20 cursor-pointer inline-flex items-center space-x-1.5 mt-2"
                >
                  <span>Upload & Ingest First Configuration</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ) : (
            filteredRecords.map((record) => {
              const isExpanded = expandedRecordIds.has(record.id);
              const isConfigExpanded = expandedConfigIds.has(record.id);
              const score = record.compliance_score;

              return (
                <div
                  key={record.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isExpanded 
                      ? 'bg-slate-900/90 border-cyan-500/40 shadow-xl shadow-cyan-950/20' 
                      : 'bg-slate-950/60 hover:bg-slate-900/60 border-slate-800/90'
                  }`}
                >
                  {/* Record Card Header */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                    
                    {/* Left: Device & Ingest Info */}
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2.5 flex-wrap gap-y-1.5">
                        <span className="font-mono font-black text-sm text-white tracking-tight">
                          {record.device_info.hostname || 'UNNAMED-DEVICE'}
                        </span>
                        
                        <span className="text-3xs font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 border border-slate-700 font-mono">
                          {record.device_info.vendor || 'Generic'}
                        </span>

                        <span className="text-3xs font-mono text-slate-400 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 flex items-center space-x-1">
                          <FileText className="h-3 w-3 text-slate-500" />
                          <span>{record.filename}</span>
                        </span>

                        <span className="text-3xs text-slate-500 font-mono flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{record.timestamp}</span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-3.5 text-xs text-slate-400">
                        <span className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="font-semibold text-emerald-400">{record.passed_rules_count} Passed</span>
                        </span>
                        <span className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-400" />
                          <span className="font-semibold text-rose-400">{record.failed_rules_count} Deviations</span>
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="font-mono text-slate-400">{record.param_values.length} Extracted Ingested Values</span>
                      </div>
                    </div>

                    {/* Right: Score Pill & Action Buttons */}
                    <div className="flex items-center space-x-2.5 self-start sm:self-center">
                      
                      {/* Score Pill */}
                      <div className={`px-3 py-1.5 rounded-xl border font-mono font-black text-xs flex items-center space-x-2 ${
                        score >= 80 ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300' :
                        score >= 50 ? 'bg-amber-950/70 border-amber-500/40 text-amber-300' :
                        'bg-rose-950/70 border-rose-500/40 text-rose-300'
                      }`}>
                        <span>{score}%</span>
                        <span className="text-3xs opacity-80 uppercase tracking-wider">
                          {score >= 80 ? 'Compliant' : score >= 50 ? 'Warning' : 'Critical'}
                        </span>
                      </div>

                      {/* Direct Dossier Link (if prop provided) */}
                      {onSelectRecord && (
                        <button
                          onClick={() => onSelectRecord(record.id)}
                          className="px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 transition-all cursor-pointer text-xs font-bold flex items-center space-x-1.5"
                          title="Inspect full AST audit dossier"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Dossier</span>
                        </button>
                      )}

                      {/* Expand / Collapse Ingested Values */}
                      <button
                        onClick={() => toggleExpandRecord(record.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 cursor-pointer transition-all border ${
                          isExpanded
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700'
                        }`}
                      >
                        <span>{isExpanded ? 'Hide Values' : `Values (${record.param_values.length})`}</span>
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>

                      {/* Delete Single Record */}
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        disabled={deletingId === record.id}
                        className="p-2 rounded-xl bg-slate-800/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-500/40 transition-all cursor-pointer"
                        title="Delete this record from database"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Drawer: All Ingested Values & Details */}
                  {isExpanded && (
                    <div className="border-t border-slate-800/80 p-4 sm:p-5 bg-slate-950/80 space-y-4">
                      
                      {/* Device Telemetry Header Strip */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/70">
                          <span className="text-3xs text-slate-500 uppercase block">Platform Model</span>
                          <span className="font-bold text-slate-200 truncate block mt-0.5">
                            {record.device_info.model || 'Unknown Model'} — {record.device_info.os_version || 'Firmware Auto'}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/70">
                          <span className="text-3xs text-slate-500 uppercase block">Serial / Hardware ID</span>
                          <span className="font-bold text-slate-200 truncate block mt-0.5">
                            {record.device_info.serial_number || 'N/A (Virtual / Lab)'}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/70">
                          <span className="text-3xs text-slate-500 uppercase block">Audit Record ID</span>
                          <span className="font-bold text-cyan-400 truncate block mt-0.5" title={record.id}>
                            {record.id}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/70 flex items-center justify-between">
                          <div>
                            <span className="text-3xs text-slate-500 uppercase block">Config Size</span>
                            <span className="font-bold text-slate-200 mt-0.5 block">
                              {record.raw_config_lines} lines ({Math.round((record.raw_config.length || 0) / 1024 * 10) / 10} KB)
                            </span>
                          </div>
                          {record.raw_config && (
                            <button
                              onClick={() => toggleExpandConfig(record.id)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-2xs font-extrabold border border-slate-700 cursor-pointer"
                            >
                              {isConfigExpanded ? 'Hide Raw' : 'View Raw'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Raw Config Box (if toggled) */}
                      {isConfigExpanded && record.raw_config && (
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                            <span className="font-bold uppercase text-cyan-400 flex items-center space-x-1.5">
                              <FileText className="h-3.5 w-3.5" />
                              <span>Raw Ingested Configuration File ({record.filename})</span>
                            </span>
                            <button
                              onClick={() => handleCopyConfig(record.id, record.raw_config)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center space-x-1.5 cursor-pointer text-2xs"
                            >
                              {copiedId === record.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                              <span>{copiedId === record.id ? 'Copied' : 'Copy Config'}</span>
                            </button>
                          </div>
                          <pre className="max-h-60 overflow-y-auto p-3 rounded-xl bg-slate-900 text-slate-300 font-mono text-xs leading-relaxed border border-slate-800/80 select-all">
                            {record.raw_config}
                          </pre>
                        </div>
                      )}

                      {/* Extracted Ingested Values Table */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs uppercase tracking-wider font-extrabold text-slate-300 flex items-center space-x-2">
                            <Layers className="h-4 w-4 text-cyan-400" />
                            <span>Extracted Security Parameter Values & Baselines</span>
                          </h3>
                          <span className="text-3xs font-mono text-slate-500">
                            {record.param_values.length} parameters evaluated
                          </span>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-900/50">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-slate-800 bg-slate-900/90 text-3xs font-mono uppercase text-slate-400">
                                <th className="py-2.5 px-3.5">Rule & Parameter</th>
                                <th className="py-2.5 px-3">Standard</th>
                                <th className="py-2.5 px-3">Severity</th>
                                <th className="py-2.5 px-3.5 text-cyan-300">Ingested Actual Value</th>
                                <th className="py-2.5 px-3 text-slate-300">Expected Value</th>
                                <th className="py-2.5 px-3.5 text-right">Evaluation</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                              {record.param_values.map((param, pIdx) => {
                                const isPass = param.status === 'Pass';
                                return (
                                  <tr 
                                    key={pIdx} 
                                    className={`hover:bg-slate-850/50 transition-colors ${
                                      !isPass ? 'bg-rose-950/10' : ''
                                    }`}
                                  >
                                    {/* Rule Name & ID */}
                                    <td className="py-2.5 px-3.5">
                                      <div className="font-bold text-slate-200 text-xs font-sans">
                                        {param.name}
                                      </div>
                                      <div className="text-3xs text-slate-500 font-mono mt-0.5">
                                        {param.rule_id}
                                      </div>
                                    </td>

                                    {/* Benchmark */}
                                    <td className="py-2.5 px-3">
                                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-3xs font-bold">
                                        {param.benchmark}
                                      </span>
                                    </td>

                                    {/* Severity */}
                                    <td className="py-2.5 px-3">
                                      <span className={`px-2 py-0.5 rounded text-3xs font-extrabold uppercase ${
                                        param.severity === 'Critical' ? 'bg-rose-950 text-rose-300 border border-rose-500/40' :
                                        param.severity === 'High' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                                        param.severity === 'Medium' ? 'bg-sky-950 text-sky-300 border border-sky-500/40' :
                                        'bg-slate-800 text-slate-300 border border-slate-700'
                                      }`}>
                                        {param.severity}
                                      </span>
                                    </td>

                                    {/* Ingested Actual Value */}
                                    <td className="py-2.5 px-3.5">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded font-extrabold text-xs border ${
                                        isPass
                                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                                          : 'bg-rose-950/80 text-rose-300 border-rose-500/50 animate-pulse'
                                      }`}>
                                        {param.actual}
                                      </span>
                                    </td>

                                    {/* Expected Value */}
                                    <td className="py-2.5 px-3 text-slate-400 font-semibold text-xs">
                                      {param.expected}
                                    </td>

                                    {/* Evaluation Status */}
                                    <td className="py-2.5 px-3.5 text-right">
                                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-3xs font-extrabold uppercase ${
                                        isPass
                                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                      }`}>
                                        {isPass ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                                        <span>{param.status}</span>
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 🧠 DYNAMIC HEURISTICS VIEW */}
      {!loadingHistory && historyTab === 'heuristics' && (
        <div className="space-y-4">
          {filteredHeuristics.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 p-8 space-y-3">
              <Sparkles className="h-10 w-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">No Dynamic Heuristics Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Train unrecognized CLI syntax commands in the AI Studio to dynamically learn normalization heuristics.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-900/40 shadow-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-3xs font-mono uppercase text-slate-400">
                    <th className="py-3 px-4">Dynamic Regex / CLI Command Pattern</th>
                    <th className="py-3 px-4">Target Security Parameter</th>
                    <th className="py-3 px-4">Ingested / Mapped Value</th>
                    <th className="py-3 px-4 text-right">Vendor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                  {filteredHeuristics.map((heuristic, hIdx) => (
                    <tr key={hIdx} className="hover:bg-slate-850/40 transition-colors">
                      <td className="py-2.5 px-4">
                        <code className="text-cyan-300 font-extrabold bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-xs font-mono">
                          {heuristic.command_pattern}
                        </code>
                      </td>
                      <td className="py-2.5 px-4 text-slate-200 font-semibold">
                        {heuristic.parameter}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                          {String(heuristic.value)}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-2xs font-bold">
                          {heuristic.vendor || 'Generic'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default HistoryPage;
