import React, { useState, useEffect, useRef } from 'react';
import { 
  Key, 
  Shield, 
  CheckCircle, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Layers, 
  Activity,
  History,
  X,
  Trash2
} from 'lucide-react';

interface DbStatus {
  connected: boolean;
  mode: string;
  database: string;
  uri_masked?: string;
  latency_ms?: number | null;
  stats?: {
    records_count: number;
    heuristics_count: number;
  };
  last_error?: string | null;
}

interface SettingsProps {
  onDbStatusChange?: () => void;
  onNavigateToHistory?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onDbStatusChange, onNavigateToHistory }) => {
  // Gemini AI state
  const [apiKey, setApiKey] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [savingGemini, setSavingGemini] = useState(false);
  const [geminiSuccess, setGeminiSuccess] = useState(false);

  // MongoDB State
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);
  const [mongoUri, setMongoUri] = useState('');
  const [dbName, setDbName] = useState('aegis_auditor');
  const [showPassword, setShowPassword] = useState(false);
  
  // 🗝️ Remembered Connection URIs & Autocomplete State
  const STORAGE_KEY = 'aegis_remembered_mongo_uris';
  const DEFAULT_REMEMBERED_URIS = [
    'mongodb://127.0.0.1:27017',
    'mongodb://localhost:27017',
    'mongodb://127.0.0.1:27017/aegis_auditor',
    'mongodb+srv://admin:password@cluster0.mongodb.net/aegis_auditor'
  ];

  const [rememberedUris, setRememberedUris] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Failed to load remembered URIs from localStorage:", e);
    }
    return DEFAULT_REMEMBERED_URIS;
  });

  const [showUriSuggestions, setShowUriSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Helper to remember a URI into history
  const rememberUri = (uriToSave: string) => {
    const trimmed = uriToSave.trim();
    if (!trimmed) return;
    setRememberedUris((prev) => {
      const filtered = prev.filter((u) => u.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 10);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save remembered URIs:", e);
      }
      return updated;
    });
  };

  // Helper to remove an individual URI from history
  const removeRememberedUri = (uriToRemove: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRememberedUris((prev) => {
      const updated = prev.filter((u) => u !== uriToRemove);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to update remembered URIs:", err);
      }
      return updated;
    });
  };

  // Helper to clear all remembered URIs
  const clearAllRememberedUris = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRememberedUris([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("Failed to clear remembered URIs:", err);
    }
  };

  // Suggestions filtered by what user is typing in the input
  const filteredUris = rememberedUris.filter((uri) => 
    !mongoUri.trim() || uri.toLowerCase().includes(mongoUri.toLowerCase().trim())
  );

  // Click outside and ESC listener for suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowUriSuggestions(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowUriSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // MongoDB Actions State
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latency_ms?: number } | null>(null);
  const [savingMongo, setSavingMongo] = useState(false);
  const [mongoSuccess, setMongoSuccess] = useState<string | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{ success: boolean; message: string } | null>(null);
  const [refreshingDb, setRefreshingDb] = useState(false);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setApiKey(data.gemini_api_key || '');
        setIsActive(data.is_gemini_active);
        if (data.mongodb) {
          setDbStatus(data.mongodb);
          if (data.mongodb.database) {
            setDbName(data.mongodb.database);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
  };

  const fetchDbStatus = async () => {
    setRefreshingDb(true);
    try {
      const response = await fetch('/api/db/status');
      if (response.ok) {
        const data = await response.json();
        setDbStatus(data);
        if (data.database) {
          setDbName(data.database);
        }
        if (onDbStatusChange) {
          onDbStatusChange();
        }
      }
    } catch (e) {
      console.error("Failed to load DB status:", e);
    } finally {
      setRefreshingDb(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save Gemini AI settings
  const handleSaveGemini = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGemini(true);
    setGeminiSuccess(false);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gemini_api_key: apiKey }),
      });

      if (response.ok) {
        setIsActive(!!apiKey);
        setGeminiSuccess(true);
        setTimeout(() => setGeminiSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingGemini(false);
    }
  };

  // Test MongoDB Connection
  const handleTestConnection = async () => {
    const targetUri = mongoUri.trim() || 'mongodb://127.0.0.1:27017';
    rememberUri(targetUri);
    setTestingConnection(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/db/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri: targetUri }),
      });
      const data = await response.json();
      setTestResult(data);
    } catch (e: any) {
      setTestResult({
        success: false,
        message: `Network error testing connection: ${e.message}`
      });
    } finally {
      setTestingConnection(false);
    }
  };

  // Save & Apply MongoDB Configuration
  const handleSaveMongo = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetUri = mongoUri.trim() || 'mongodb://127.0.0.1:27017';
    rememberUri(targetUri);
    setSavingMongo(true);
    setMongoSuccess(null);

    try {
      const response = await fetch('/api/db/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          uri: targetUri,
          database: dbName.trim() || 'aegis_auditor'
        }),
      });

      const data = await response.json();
      if (data.status) {
        setDbStatus(data.status);
      }
      setMongoSuccess(data.message || 'MongoDB configuration applied.');
      if (onDbStatusChange) {
        onDbStatusChange();
      }
      setTimeout(() => setMongoSuccess(null), 4000);
    } catch (e: any) {
      setMongoSuccess(`Error saving MongoDB configuration: ${e.message}`);
    } finally {
      setSavingMongo(false);
    }
  };

  // Migrate local JSON files into MongoDB
  const handleMigrate = async () => {
    if (!confirm("This will copy existing local audit records and heuristics from files into your connected MongoDB database. Proceed?")) {
      return;
    }
    setMigrating(true);
    setMigrationResult(null);

    try {
      const response = await fetch('/api/db/migrate', {
        method: 'POST',
      });
      const data = await response.json();
      setMigrationResult(data);
      // Refresh status after migration to update document counts
      fetchDbStatus();
    } catch (e: any) {
      setMigrationResult({
        success: false,
        message: `Migration request failed: ${e.message}`
      });
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-black text-white">System Settings & Infrastructure</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-0.5">Configure database persistence, AI engines, and compliance governance parameters.</p>
      </div>

      {/* ==================================================================== */}
      {/* 🍃 MONGODB BACKEND CLUSTER & STORAGE */}
      {/* ==================================================================== */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 relative overflow-hidden border border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center space-x-2">
                <span>MongoDB Backend Cluster</span>
              </h2>
              <p className="text-2xs text-slate-400">Enterprise persistence for audit records, dynamic heuristics, and configuration history</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-center">
            <button
              onClick={fetchDbStatus}
              disabled={refreshingDb}
              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 transition-all cursor-pointer text-xs flex items-center space-x-1"
              title="Refresh connection status"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshingDb ? 'animate-spin text-cyan-400' : ''}`} />
              <span className="text-3xs font-semibold hidden sm:inline">Refresh</span>
            </button>

            {dbStatus?.connected ? (
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-3xs font-extrabold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>MongoDB Connected ({dbStatus.latency_ms ?? 0}ms)</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-3xs font-extrabold">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Local File Fallback Active</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-3xs text-slate-500 uppercase font-mono block">Storage Mode</span>
            <span className="text-xs font-extrabold text-slate-200 mt-0.5 block font-mono">
              {dbStatus?.connected ? 'MongoDB Cluster' : 'Local File Fallback'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-3xs text-slate-500 uppercase font-mono block">Database Target</span>
            <span className="text-xs font-extrabold text-cyan-400 mt-0.5 block font-mono truncate">
              {dbStatus?.database || dbName}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-3xs text-slate-500 uppercase font-mono block">Audit Records</span>
            <span className="text-xs font-extrabold text-emerald-400 mt-0.5 block font-mono">
              {dbStatus?.stats?.records_count ?? 0} documents
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-3xs text-slate-500 uppercase font-mono block">Learned Heuristics</span>
            <span className="text-xs font-extrabold text-purple-400 mt-0.5 block font-mono">
              {dbStatus?.stats?.heuristics_count ?? 0} rules
            </span>
          </div>
        </div>

        {/* Error Alert if Disconnected */}
        {dbStatus && !dbStatus.connected && dbStatus.last_error && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block">Operating in Resilient File Fallback Mode</span>
              <p className="text-2xs text-amber-200/80 font-mono">
                {dbStatus.last_error.length > 120 ? dbStatus.last_error.slice(0, 120) + '...' : dbStatus.last_error}
              </p>
            </div>
          </div>
        )}

        {/* MongoDB Connection Form */}
        <form onSubmit={handleSaveMongo} className="space-y-4">
          {/* MongoDB Connection URI with Key Suggestions */}
          <div className="relative" ref={suggestionsRef}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-2">
                <label className="text-3xs font-extrabold uppercase tracking-wider text-slate-400">
                  MongoDB Connection URI
                </label>
                {/* 🔑 Small Key Button beside the URI tab */}
                <button
                  type="button"
                  onClick={() => setShowUriSuggestions(!showUriSuggestions)}
                  className={`px-2 py-0.5 rounded-md border transition-all cursor-pointer flex items-center space-x-1.5 text-3xs font-mono font-bold ${
                    showUriSuggestions 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.35)]' 
                      : 'bg-slate-900/90 text-amber-400/90 border-slate-700 hover:border-amber-400/50 hover:text-amber-300'
                  }`}
                  title="Click to view remembered connection URIs"
                  aria-label="Toggle URI History Suggestions"
                >
                  <Key className="h-3 w-3 text-amber-400" />
                  <span>Keys ({rememberedUris.length})</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-3xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  <span>{showPassword ? 'Hide URI' : 'Reveal URI'}</span>
                </button>
              </div>
            </div>

            {/* Input with Search / Suggestion triggers */}
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                value={mongoUri}
                onChange={(e) => {
                  setMongoUri(e.target.value);
                  setShowUriSuggestions(true);
                }}
                onFocus={() => setShowUriSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    rememberUri(mongoUri);
                    setShowUriSuggestions(false);
                  }
                }}
                placeholder="mongodb://127.0.0.1:27017 or mongodb+srv://user:pass@cluster0..."
                className="w-full glass-input rounded-xl pl-9 pr-10 py-2 text-xs font-semibold placeholder-slate-500 font-mono"
              />
              
              {/* Left Key Symbol inside the bar */}
              <button
                type="button"
                onClick={() => setShowUriSuggestions(!showUriSuggestions)}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 text-amber-400/80 hover:text-amber-300 transition-colors cursor-pointer"
                title="Toggle Remembered URIs"
              >
                <Key className="h-3.5 w-3.5 text-amber-400" />
              </button>

              {/* Right Clear or Dropdown Chevron */}
              {mongoUri && (
                <button
                  type="button"
                  onClick={() => setMongoUri('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
                  title="Clear input"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* 🔍 Interactive Search-Bar Style Suggestions Dropdown */}
            {showUriSuggestions && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl bg-slate-950/95 border border-sky-500/30 backdrop-blur-2xl shadow-[0_20px_45px_rgba(0,0,0,0.85)] p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-800/80 text-3xs font-mono">
                  <div className="flex items-center space-x-1.5 text-slate-400 font-bold uppercase tracking-wider">
                    <Key className="h-3 w-3 text-amber-400" />
                    <span>Remembered Connection URIs ({filteredUris.length})</span>
                  </div>
                  {rememberedUris.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAllRememberedUris}
                      className="text-slate-500 hover:text-rose-400 transition-colors flex items-center space-x-1 cursor-pointer"
                      title="Clear all saved history"
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                      <span>Clear All</span>
                    </button>
                  )}
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1 py-1 pr-1 custom-scrollbar">
                  {filteredUris.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-500 font-mono">
                      No matching remembered URIs. Type a new URI and click Save to remember it.
                    </div>
                  ) : (
                    filteredUris.map((uri, idx) => {
                      const isCurrent = mongoUri.trim().toLowerCase() === uri.trim().toLowerCase();
                      const isAtlas = uri.startsWith('mongodb+srv');
                      const isLocal = uri.includes('127.0.0.1') || uri.includes('localhost');
                      
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            setMongoUri(uri);
                            rememberUri(uri);
                            setShowUriSuggestions(false);
                          }}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all text-xs font-mono group ${
                            isCurrent 
                              ? 'bg-sky-500/15 border border-sky-500/40 text-sky-200' 
                              : 'bg-slate-900/60 hover:bg-slate-900 border border-transparent hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                            <Database className={`h-3.5 w-3.5 shrink-0 ${isCurrent ? 'text-sky-400' : 'text-slate-500 group-hover:text-amber-400'}`} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold truncate text-slate-200 group-hover:text-white">
                                  {showPassword ? uri : (uri.length > 40 ? uri.slice(0, 32) + '••••' : uri)}
                                </span>
                                {isCurrent && (
                                  <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-3xs font-bold shrink-0">
                                    Active
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 text-3xs text-slate-500 mt-0.5">
                                <span className={isAtlas ? 'text-purple-400' : isLocal ? 'text-emerald-400' : 'text-sky-400'}>
                                  {isAtlas ? 'MongoDB Atlas' : isLocal ? 'Local Instance' : 'Remote Cluster'}
                                </span>
                                <span>•</span>
                                <span>Click to select</span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => removeRememberedUri(uri, e)}
                            className="p-1 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors ml-2 shrink-0 cursor-pointer"
                            title="Forget this URI"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="px-2.5 py-1 bg-slate-900/50 rounded-lg text-3xs font-mono text-slate-500 flex items-center justify-between">
                  <span>💡 Press Enter or click Save to remember new URIs automatically</span>
                  <span>ESC to close</span>
                </div>
              </div>
            )}

            <p className="text-3xs text-slate-500 mt-1.5">
              Supports local MongoDB servers (<code className="text-cyan-400 font-mono">mongodb://127.0.0.1:27017</code>) or MongoDB Atlas (<code className="text-cyan-400 font-mono">mongodb+srv://...</code>).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-3xs font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                Database Name
              </label>
              <input 
                type="text"
                value={dbName}
                onChange={(e) => setDbName(e.target.value)}
                placeholder="aegis_auditor"
                className="w-full glass-input rounded-xl px-3.5 py-2 text-xs font-semibold placeholder-slate-500 font-mono"
              />
            </div>

            <div>
              <label className="text-3xs font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                Active Cluster Status
              </label>
              <div className="glass-input rounded-xl px-3.5 py-2 text-xs font-mono text-slate-300 flex items-center justify-between">
                <span>{dbStatus?.connected ? 'Cluster Live & Healthy' : 'Fallback Storage'}</span>
                <span className="text-3xs text-slate-500">
                  {dbStatus?.latency_ms ? `${dbStatus.latency_ms}ms ping` : 'offline'}
                </span>
              </div>
            </div>
          </div>

          {/* Test & Save Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 active:scale-95"
            >
              {testingConnection ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Testing Connection...</span>
                </>
              ) : (
                <>
                  <Activity className="h-3.5 w-3.5" />
                  <span>Test Latency & Ping</span>
                </>
              )}
            </button>

            <button 
              type="submit"
              disabled={savingMongo}
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer flex items-center justify-center space-x-1.5 active:scale-95"
            >
              {savingMongo ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Save & Connect Cluster</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Test Result Message */}
        {testResult && (
          <div className={`mt-3.5 p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
            testResult.success 
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
          }`}>
            {testResult.success ? (
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Save Result Message */}
        {mongoSuccess && (
          <div className="mt-3.5 p-3 bg-cyan-500/15 border border-cyan-500/30 rounded-xl text-xs font-semibold text-cyan-300 flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>{mongoSuccess}</span>
          </div>
        )}

        {/* Local Files to MongoDB Migration Tool */}
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-extrabold text-white flex items-center space-x-1.5">
                <Layers className="h-3.5 w-3.5 text-cyan-400" />
                <span>Sync Local Files to MongoDB</span>
              </span>
              <p className="text-2xs text-slate-400">
                Seamlessly import records from <code className="text-slate-300">records.json</code> and <code className="text-slate-300">heuristics.json</code> directly into your MongoDB cluster.
              </p>
            </div>

            <button
              type="button"
              onClick={handleMigrate}
              disabled={migrating || !dbStatus?.connected}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto shrink-0 ${
                dbStatus?.connected 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95' 
                  : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
              }`}
              title={dbStatus?.connected ? 'Migrate local data to MongoDB' : 'Connect MongoDB first to enable data migration'}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${migrating ? 'animate-spin' : ''}`} />
              <span>{migrating ? 'Migrating...' : 'Migrate to MongoDB'}</span>
            </button>
          </div>

          {migrationResult && (
            <div className={`mt-3 p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
              migrationResult.success
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
            }`}>
              {migrationResult.success ? (
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
              )}
              <span>{migrationResult.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 📜 INGESTION HISTORY QUICK PORTAL (UNCONGESTED GATEWAY) */}
      {/* ==================================================================== */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white flex items-center space-x-2">
              <span>Audited Ingestion History & Extracted Parameters</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-3xs font-extrabold">
                Dedicated Section
              </span>
            </h2>
            <p className="text-2xs text-slate-400 mt-0.5">
              Access the complete historical ledger of audited devices, parameter matrices, raw config files, and dynamic heuristics.
            </p>
          </div>
        </div>

        {onNavigateToHistory && (
          <button
            onClick={onNavigateToHistory}
            className="px-4 py-2 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-500/20 cursor-pointer flex items-center space-x-1.5 shrink-0 active:scale-95 self-start sm:self-center"
          >
            <span>Open Ingestion History</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 🤖 GOOGLE GEMINI AI INTEGRATION */}
      {/* ==================================================================== */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-800/80">
        <h2 className="text-sm font-extrabold text-white flex items-center space-x-2 mb-2">
          <Key className="h-4.5 w-4.5 text-cyan-400" />
          <span>Google Gemini AI Integration</span>
        </h2>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Connect your Google Gemini API Key. Enabling Gemini activates advanced generative security normalization of complex multi-vendor structures, and generates custom device-specific CLI remediation scripts.
        </p>

        <form onSubmit={handleSaveGemini} className="space-y-3.5">
          <div>
            <label className="text-3xs font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Gemini API Key</label>
            <input 
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={isActive ? "••••••••••••••••••••••••••••••••••••" : "AIzaSy..."}
              className="w-full glass-input rounded-xl px-3.5 py-2 text-xs font-semibold placeholder-slate-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400 text-3xs font-bold uppercase">Engine:</span>
              {isActive ? (
                <span className="font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30 text-3xs">Gemini AI Active</span>
              ) : (
                <span className="font-bold text-slate-300 glass-pill px-2 py-0.5 rounded-md text-3xs">Offline NLP Engine Active</span>
              )}
            </div>

            <button 
              type="submit"
              disabled={savingGemini}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-500/20 cursor-pointer active:scale-95"
            >
              {savingGemini ? 'Saving...' : 'Save Gemini Settings'}
            </button>
          </div>
        </form>

        {geminiSuccess && (
          <div className="mt-3.5 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs font-semibold text-emerald-300 flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Settings saved successfully.</span>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 🛡️ SECURITY COMPLIANCE FRAMEWORKS INFO */}
      {/* ==================================================================== */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-800/80">
        <h2 className="text-sm font-extrabold text-white flex items-center space-x-2 mb-2">
          <Shield className="h-4.5 w-4.5 text-cyan-400" />
          <span>Security Compliance Frameworks Info</span>
        </h2>
        <div className="space-y-2.5 mt-3 text-xs text-slate-300">
          <div className="p-3 glass-card-subtle rounded-xl">
            <b className="text-cyan-400 block mb-0.5">CIS Benchmarks (Center for Internet Security)</b>
            System-level hardening requirements mapping SSH versions, secure password constraints, web interfaces disabling rules, and inactivity timeouts.
          </div>
          <div className="p-3 glass-card-subtle rounded-xl">
            <b className="text-cyan-400 block mb-0.5">NIST SP 800-53 (Revision 5)</b>
            Federal information security control parameters covering warn banners requirements (AC-8), logging hosts configurations (AU-12), and firewall access restrictions (AC-4).
          </div>
          <div className="p-3 glass-card-subtle rounded-xl">
            <b className="text-cyan-400 block mb-0.5">DISA STIGs (Defense Information Systems Agency)</b>
            Department of Defense (DoD) hardening standards focusing on SNMP security and removing default read/write communities (STIG-NET-001).
          </div>
          <div className="p-3 glass-card-subtle rounded-xl">
            <b className="text-cyan-400 block mb-0.5">ISO/IEC 27001:2022</b>
            Information security governance constraints governing telemetry, access control lists (A.8.20), and identity verification.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
