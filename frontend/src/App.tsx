import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Ingestion from './pages/Ingestion';
import Training from './pages/Training';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import HistoryPage from './pages/HistoryPage';
import TopologyMap from './pages/TopologyMap';
import BackgroundThemeManager from './components/BackgroundThemeManager';
import Navigation13 from './components/Navigation13';
import NeonSplashIntro from './components/NeonSplashIntro';

interface DeviceRecord {
  id: string;
  hostname: string;
  vendor: string;
  model: string;
  os_version: string;
  compliance_score: number;
  passed_rules_count: number;
  failed_rules_count: number;
  total_rules: number;
  timestamp: string;
}

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

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [records, setRecords] = useState<DeviceRecord[]>([]);
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [selectedRecordDetails, setSelectedRecordDetails] = useState<any | null>(null);
  const [unrecognizedCount, setUnrecognizedCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [showSplash, setShowSplash] = useState<boolean>(true);

  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/records');
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      }
    } catch (e) {
      console.error('Failed to load records:', e);
    }
  };

  const fetchUnrecognizedCount = async () => {
    try {
      const response = await fetch('/api/training/unrecognized');
      if (response.ok) {
        const data = await response.json();
        setUnrecognizedCount(data.length);
      }
    } catch (e) {
      console.error('Failed to load unrecognized count:', e);
    }
  };

  const fetchDbStatus = async () => {
    try {
      const response = await fetch('/api/db/status');
      if (response.ok) {
        const data = await response.json();
        setDbStatus(data);
      }
    } catch (e) {
      console.error('Failed to load database status:', e);
    }
  };

  const refreshAll = () => {
    fetchRecords();
    fetchUnrecognizedCount();
    fetchDbStatus();
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleSelectRecord = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/records/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedRecordDetails(data);
        setSelectedRecordId(id);
      }
    } catch (e) {
      console.error('Failed to load record details:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this audit report?')) return;
    try {
      const response = await fetch(`/api/records/${id}`, { method: 'DELETE' });
      if (response.ok) {
        if (selectedRecordId === id) {
          setSelectedRecordId(null);
          setSelectedRecordDetails(null);
        }
        refreshAll();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAuditComplete = (result: any) => {
    refreshAll();
    setSelectedRecordDetails(result);
    setSelectedRecordId(result.id);
    setActiveTab('dashboard');
  };

  const handleBackToDashboard = () => {
    setSelectedRecordId(null);
    setSelectedRecordDetails(null);
    refreshAll();
  };

  const handleQuickAuditFromTopology = async (type: 'cisco' | 'juniper') => {
    try {
      let content = '';
      let filename = '';
      let vendor = '';

      if (type === 'cisco') {
        filename = 'cisco_catalyst_core.cfg';
        vendor = 'Cisco';
        content = `hostname core-switch-cisco\nno service password-encryption\nusername admin privilege 15 password adminpassword\nip ssh version 1\nip http server\nno ip http secure-server\nsnmp-server community public RO\nline con 0\n exec-timeout 0 0\nline vty 0 4\n login\n transport input telnet ssh\nend\n`;
      } else {
        filename = 'juniper_srx_edge.conf';
        vendor = 'Juniper';
        content = `system {\n host-name edge-router-juniper;\n services {\n  ssh {\n   protocol-version v1;\n  }\n  telnet;\n  web-management {\n   http;\n  }\n }\n}\nsnmp {\n community public {\n  authorization read-only;\n }\n}\n`;
      }

      const blob = new Blob([content], { type: 'text/plain' });
      const file = new File([blob], filename);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('vendor', vendor);
      formData.append('benchmarks', JSON.stringify(['CIS', 'NIST', 'STIG', 'ISO27001']));

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const result = await res.json();
        handleAuditComplete(result);
      }
    } catch (e) {
      console.error('Topology audit error:', e);
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative text-slate-100 selection:bg-purple-500/30 selection:text-white">
      {/* 🌟 APP OPENING SPLASH INTRO WITH NEON REVEAL (REACT BITS PRO) */}
      {showSplash && (
        <NeonSplashIntro 
          onComplete={() => setShowSplash(false)}
          brandName="AEGIS"
          subtitle="AUTONOMOUS ZERO-TRUST DEFENSE SYSTEM"
          duration={3.4}
        />
      )}

      {/* 🛡️ Atmospheric Cyber Canvas (Default: Minimalist Dark Obsidian Slate) */}
      <BackgroundThemeManager />

      {/* 🧭 NAVIGATION 13: EDITORIAL SPLIT NAVBAR (REACT BITS PRO) */}
      <Navigation13 
        activeTab={selectedRecordId ? 'reports' : activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSelectedRecordId(null);
        }}
        unrecognizedCount={unrecognizedCount}
        totalDevices={records.length}
        avgComplianceScore={
          records.length > 0
            ? Math.round(records.reduce((acc, curr) => acc + curr.compliance_score, 0) / records.length)
            : 92
        }
        openDeviationsCount={records.reduce((acc, curr) => acc + curr.failed_rules_count, 0)}
        dbStatus={dbStatus}
        onLogoClick={() => setShowSplash(true)}
      />

      {/* Main Content Area — Full-width canvas layout */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-8 py-8 sm:py-10 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-80 space-y-4">
            <div className="relative">
              <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-600 rounded-full animate-spin"></div>
              <Shield className="h-4 w-4 text-blue-600 absolute inset-0 m-auto" />
            </div>
            <span className="text-xs font-semibold text-slate-500">Processing Security Baseline...</span>
          </div>
        ) : selectedRecordId && selectedRecordDetails ? (
          <Reports 
            record={selectedRecordDetails} 
            onBack={handleBackToDashboard} 
          />
        ) : (
          <div>
            {activeTab === 'dashboard' && (
              <Dashboard 
                records={records} 
                onSelectRecord={handleSelectRecord} 
                onDeleteRecord={handleDeleteRecord} 
                onTriggerSampleUpload={handleAuditComplete}
              />
            )}
            {activeTab === 'topology' && (
              <TopologyMap 
                records={records} 
                onSelectRecord={handleSelectRecord}
                onTriggerQuickAudit={handleQuickAuditFromTopology}
              />
            )}
            {activeTab === 'ingestion' && (
              <Ingestion 
                onAuditComplete={handleAuditComplete} 
              />
            )}
            {activeTab === 'history' && (
              <HistoryPage 
                onSelectRecord={handleSelectRecord}
                onRecordsChange={refreshAll}
                onNavigateToIngestion={() => setActiveTab('ingestion')}
              />
            )}
            {activeTab === 'training' && (
              <Training 
                onMappingApplied={refreshAll} 
              />
            )}
            {activeTab === 'settings' && (
              <Settings 
                onDbStatusChange={fetchDbStatus} 
                onNavigateToHistory={() => setActiveTab('history')}
              />
            )}
          </div>
        )}
      </main>

      {/* Full-Width Sleek Footer */}
      <footer className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 py-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">AEGIS Network Security Compliance</span>
            <span>•</span>
            <span className="font-medium text-slate-500">NTRO • SIH 2026</span>
          </div>
          <div className="mt-1 sm:mt-0 flex items-center space-x-3 font-mono text-xs">
            <span className="text-sky-400 font-bold">CIS v8</span>
            <span>•</span>
            <span className="text-purple-400 font-bold">NIST SP 800-53</span>
            <span>•</span>
            <span className="text-amber-400 font-bold">DISA STIG</span>
            <span>•</span>
            <span className="text-orange-400 font-bold">ISO 27001</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
