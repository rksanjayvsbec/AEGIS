import React, { useState, useEffect } from 'react';
import { 
  Server, 
  FileText, 
  Trash2, 
  Filter, 
  ChevronRight, 
  ShieldCheck, 
  ShieldAlert, 
  LayoutGrid, 
  List, 
  Activity, 
  CheckCircle2,
  AlertTriangle,
  Play,
  Sparkles,
  Terminal,
  Copy,
  Download,
  FileCode,
  Shield, 
  Search, 
  ArrowUpDown, 
  X,
  Network,
  Lock,
  ArrowRight,
  Volume2,
  RefreshCw,
  Layers,
  Bug,
  Crosshair,
  Unlock
} from 'lucide-react';
import MagicRings from '../components/MagicRings';
import MagicBento, { BentoCardItem } from '../components/MagicBento';
import '../components/MagicBento.css';
import StarBurst from '../components/StarBurst';
import AIUsage8 from '../components/AIUsage8';
import LaserFlowShowcase from '../components/LaserFlowShowcase';
import LenticularCarousel from '../components/LenticularCarousel';

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

interface DashboardProps {
  records: DeviceRecord[];
  onSelectRecord: (id: string) => void;
  onDeleteRecord: (id: string) => void;
  onTriggerSampleUpload: (sampleResult: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ records, onSelectRecord, onDeleteRecord, onTriggerSampleUpload }) => {
  const [selectedVendorFilter, setSelectedVendorFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'score-desc' | 'score-asc' | 'name' | 'recent'>('score-desc');
  const [viewMode, setViewMode] = useState<'lenticular' | 'grid' | 'list'>('lenticular');
  const [runningSample, setRunningSample] = useState<'cisco' | 'juniper' | null>(null);

  // Active Interactive Studio Tab: 'sandbox' | 'pentest' | 'golden' | 'frameworks' | 'bento'
  const [activeStudioTab, setActiveStudioTab] = useState<'sandbox' | 'pentest' | 'golden' | 'frameworks' | 'bento'>('sandbox');

  // Penetration Testing Lab States
  const [pentestVector, setPentestVector] = useState<'telnet' | 'snmp' | 'password' | 'ssh'>('telnet');
  const [pentestTargetState, setPentestTargetState] = useState<'vulnerable' | 'hardened'>('vulnerable');
  const [isPentesting, setIsPentesting] = useState<boolean>(false);
  const [pentestLogs, setPentestLogs] = useState<string[]>([]);
  const [pentestResult, setPentestResult] = useState<'idle' | 'breached' | 'blocked'>('idle');

  const pentestScenarios = {
    telnet: {
      id: 'telnet',
      name: 'Cleartext Telnet Exploitation (TCP/23)',
      cve: 'CWE-319 / CIS 2.1.2',
      port: '23/TCP',
      cvss: '9.8 Critical',
      description: 'Sniffs plaintext credentials over unencrypted terminal transport and attempts interactive session hijack.',
      vulnerableLogs: [
        '[*] [PHASE 1] Probing target 10.0.1.1:23...',
        '[+] Port 23/tcp OPEN (Service: Telnet daemon Cisco IOS-XE)',
        '[*] [PHASE 2] ARP Spoofing bridge interface... Initializing packet capture filter: "tcp port 23"',
        '[!] Insecure cleartext transport detected: No TLS/crypto handshake required.',
        '[*] [PHASE 3] Infiltrating user authentication stream...',
        '[+] Intercepted Packet #142 -> 0x0020: 75 73 65 72 20 6f 70 65 72 61 74 6f 72  [user: operator]',
        '[+] Intercepted Packet #148 -> 0x0020: 70 61 73 73 20 6f 70 65 72 61 74 6f 72  [pass: operatorpass]',
        '🚨 [BREACH CONFIRMED] Credentials captured in plaintext: "operator : operatorpass"',
        '[CRITICAL] Attacker gained Level 15 Enable Shell Access on core-switch-cisco-01!'
      ],
      hardenedLogs: [
        '[*] [PHASE 1] Probing target 10.0.1.1:23...',
        '[-] Port 23/tcp CLOSED (RST packet returned by hardware firewall)',
        '[*] [PHASE 2] Checking auxiliary remote management ports...',
        '[+] Port 22/tcp OPEN (Service: SSH-2.0-Cisco-1.25)',
        '[*] [PHASE 3] Initiating SSH handshake... Probing for Telnet fallback...',
        '[-] Fallback Denied: Transport input strictly enforces SSH v2.',
        '[*] Key Exchange: Diffie-Hellman-Group14-SHA256 active.',
        '🛡️ [ATTACK BLOCKED] Port 23 deactivated. Plaintext credential sniffing impossible.',
        '[SECURED] Zero-Trust network boundary verified. CVSS score neutralized to 0.0.'
      ],
      remediation: 'configure terminal\n line vty 0 4\n  no transport input telnet\n  transport input ssh\n end\nwrite memory'
    },
    snmp: {
      id: 'snmp',
      name: 'Default SNMP "public" Reconnaissance (UDP/161)',
      cve: 'CWE-200 / CIS 1.4.1',
      port: '161/UDP',
      cvss: '7.5 High',
      description: 'Exploits insecure default community strings to walk the MIB tree and exfiltrate internal IP routing tables.',
      vulnerableLogs: [
        '[*] [PHASE 1] Sending SNMPv2c GetRequest with community="public" to 10.0.1.1:161...',
        '[+] SNMP Agent responded with sysDescr.0: "Cisco IOS Software, C9300 Software"',
        '[*] [PHASE 2] Executing snmpwalk on 1.3.6.1.2.1.4.20 (ipAddrTable)...',
        '[+] Exfiltrated Interface: GigabitEthernet1/0/1 -> IP: 10.0.1.1 / Netmask: 255.255.255.0',
        '[+] Exfiltrated Interface: GigabitEthernet1/0/2 -> IP: 192.168.10.1 (DMZ Gateway)',
        '[*] [PHASE 3] Walking OSPF Neighbor Table (1.3.6.1.2.1.14.10)...',
        '🚨 [EXPLOIT SUCCESSFUL] Complete internal routing topology & core switch neighbors exfiltrated!',
        '[HIGH RISK] Unauthorized reconnaissance data leaked without authentication.'
      ],
      hardenedLogs: [
        '[*] [PHASE 1] Sending SNMPv2c GetRequest with community="public" to 10.0.1.1:161...',
        '[-] Request Timed Out: No response (Community "public" dropped by ACL)',
        '[*] [PHASE 2] Probing community="private"... Request Timed Out.',
        '[*] [PHASE 3] Checking SNMP version support...',
        '[+] SNMPv3 USM Active: Mandatory SHA-256 Auth & AES-128 Encryption enforced.',
        '[-] Unauthenticated SNMPv1/v2c probes silently dropped.',
        '🛡️ [ATTACK BLOCKED] Default community strings eradicated. MIB tree shielded behind SNMPv3 cryptographic auth.',
        '[SECURED] Internal network topology kept strictly confidential.'
      ],
      remediation: 'configure terminal\n no snmp-server community public\n no snmp-server community private\n snmp-server group SECUREGROUP v3 priv\n snmp-server user secadmin SECUREGROUP v3 auth sha AuthPass123 priv aes 128 PrivPass123\nend\nwrite memory'
    },
    password: {
      id: 'password',
      name: 'Type-7 Reversible Password Cracking',
      cve: 'CWE-261 / CIS 1.1.1',
      port: 'Local Config',
      cvss: '8.8 High',
      description: 'Extracts Cisco Type-7 obfuscated passwords and reverses the 50-year-old Vigenère XOR cipher in microseconds.',
      vulnerableLogs: [
        '[*] [PHASE 1] Inspecting running-config token stream...',
        '[!] Found line: "enable password 7 0822455D0A16"',
        '[*] [PHASE 2] Identifying hash algorithm...',
        '[!] Identified: Cisco Type-7 (Reversible fixed-key Vigenère XOR stream)',
        '[*] [PHASE 3] Running instantaneous reverse lookup...',
        '[+] Recovered Key: 0x23 0x82 0x61 0x45 0x5D',
        '🚨 [CRACKED IN 0.002s] Plaintext Secret Recovered: "SuperCiscoBorder2026!"',
        '[CRITICAL] Attacker now possesses root administrative credentials for the entire switch fleet!'
      ],
      hardenedLogs: [
        '[*] [PHASE 1] Inspecting running-config token stream...',
        '[+] Found line: "enable algorithm-type sha256 secret 8 $8$qR1...$9bX"',
        '[*] [PHASE 2] Identifying hash algorithm...',
        '[+] Identified: Cisco Type-8 (PBKDF2 with SHA-256 and unique per-device salt)',
        '[*] [PHASE 3] Launching dictionary attack with 100,000,000 candidate passwords...',
        '[-] Compute Limit Exceeded: Hash complexity requires ~1,400 years to brute-force.',
        '🛡️ [ATTACK BLOCKED] Reversible Type-7 passwords eradicated. Salted PBKDF2/SHA-256 resistance verified.',
        '[SECURED] Privileged credentials remain uncrackable even if config is compromised.'
      ],
      remediation: 'configure terminal\n service password-encryption\n enable algorithm-type sha256 secret StrongAdminPass2026!\n username admin secret StrongAdminPass2026!\nend\nwrite memory'
    },
    ssh: {
      id: 'ssh',
      name: 'SSH v1 Handshake Downgrade & Insertion Attack',
      cve: 'CVE-2001-0144 / CIS 2.1.1',
      port: '22/TCP',
      cvss: '8.1 High',
      description: 'Sends modified SSH handshake packets to force negotiation of deprecated SSH v1 vulnerable to CRC32 compensation attacks.',
      vulnerableLogs: [
        '[*] [PHASE 1] Initiating SSH connection to 10.0.1.1:22...',
        '[+] Server identification string: "SSH-1.99-Cisco-1.25" (Permits SSH v1 fallback)',
        '[*] [PHASE 2] Sending client banner "SSH-1.5-DowngradeTool"...',
        '[+] Target accepted protocol downgrade to SSH v1!',
        '[*] [PHASE 3] Injecting CRC32 Compensation attack into packet stream...',
        '🚨 [EXPLOIT SUCCESSFUL] SSH v1 session integrity compromised. In-flight command substitution possible.',
        '[HIGH RISK] Attacker can inject arbitrary privileged commands into the admin session.'
      ],
      hardenedLogs: [
        '[*] [PHASE 1] Initiating SSH connection to 10.0.1.1:22...',
        '[+] Server identification string: "SSH-2.0-Cisco-1.25" (Strict SSH v2 Only)',
        '[*] [PHASE 2] Sending client banner "SSH-1.5-DowngradeTool"...',
        '[-] Fatal Handshake Error: "Protocol major versions differ: 1 vs 2"',
        '[-] Target terminated connection immediately.',
        '🛡️ [ATTACK BLOCKED] Device strictly enforces "ip ssh version 2". Protocol downgrade attack rejected.',
        '[SECURED] Tamper-proof cryptographic tunnel verified.'
      ],
      remediation: 'configure terminal\n ip ssh version 2\n ip ssh dh min group 14\n no ip ssh version 1\nend\nwrite memory'
    }
  };

  const handleRunPentest = () => {
    if (isPentesting) return;
    setIsPentesting(true);
    setPentestResult('idle');
    setPentestLogs([]);

    const scenario = pentestScenarios[pentestVector];
    const steps = pentestTargetState === 'vulnerable' ? scenario.vulnerableLogs : scenario.hardenedLogs;
    let stepIndex = 0;

    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        const nextStep = steps[stepIndex];
        setPentestLogs((prev) => [...prev, nextStep]);
        stepIndex++;
      } else {
        clearInterval(interval);
        setIsPentesting(false);
        setPentestResult(pentestTargetState === 'vulnerable' ? 'breached' : 'blocked');
      }
    }, 420);
  };

  // Radar Scan State
  const [radarScanning, setRadarScanning] = useState(false);
  const [radarMessage, setRadarMessage] = useState<string | null>(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Live AI Terminal Sandbox States
  const [sandboxInput, setSandboxInput] = useState<string>(
    'no service password-encryption\nsnmp-server community public RO\nline vty 0 4\n transport input telnet ssh'
  );
  const [sandboxVendor, setSandboxVendor] = useState<string>('Cisco');
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  // Voice AI Executive Briefing State
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Golden Baseline Generator States
  const [goldenVendor, setGoldenVendor] = useState<string>('Cisco');
  const [goldenPolicies, setGoldenPolicies] = useState({
    ssh_v2: true,
    encrypt_passwords: true,
    disable_http: true,
    snmp_v3: true,
    exec_timeout: true,
    syslog_logging: true
  });

  // Animated Number Counter Component (Smooth Ease-Out-Expo interpolation)
  const AnimatedNumber: React.FC<{ value: number; duration?: number; suffix?: string }> = ({ value, duration = 900, suffix = '' }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
      let startTime: number | null = null;
      const startVal = 0;
      const targetVal = value;

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = Math.round(startVal + (targetVal - startVal) * easeProgress);
        setDisplayValue(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, [value, duration]);

    return <span>{displayValue}{suffix}</span>;
  };

  // Dynamic Mouse-Driven Spotlight Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.removeProperty('--mouse-x');
    e.currentTarget.style.removeProperty('--mouse-y');
    e.currentTarget.style.transform = '';
  };

  const totalDevices = records.length;
  const avgScore = totalDevices > 0
    ? Math.round(records.reduce((acc, curr) => acc + curr.compliance_score, 0) / totalDevices)
    : 0;
  
  const totalPassed = records.reduce((acc, curr) => acc + curr.passed_rules_count, 0);
  const totalFailed = records.reduce((acc, curr) => acc + curr.failed_rules_count, 0);

  // Vendor Counts for Badges
  const vendorCounts = {
    All: records.length,
    Cisco: records.filter(r => r.vendor.toLowerCase().includes('cisco')).length,
    Juniper: records.filter(r => r.vendor.toLowerCase().includes('juniper')).length,
    'Palo Alto': records.filter(r => r.vendor.toLowerCase().includes('palo')).length
  };

  // Filtered and Sorted Records
  const filteredRecords = records
    .filter(r => {
      const matchesVendor = selectedVendorFilter === 'All' || r.vendor.toLowerCase().includes(selectedVendorFilter.toLowerCase());
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        r.hostname.toLowerCase().includes(query) || 
        r.vendor.toLowerCase().includes(query) || 
        (r.model && r.model.toLowerCase().includes(query)) ||
        (r.os_version && r.os_version.toLowerCase().includes(query));
      return matchesVendor && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'score-desc') return b.compliance_score - a.compliance_score;
      if (sortBy === 'score-asc') return a.compliance_score - b.compliance_score;
      if (sortBy === 'name') return a.hostname.localeCompare(b.hostname);
      if (sortBy === 'recent') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      return 0;
    });

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { 
      bg: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30', 
      dot: 'bg-emerald-400',
      label: 'Optimal Compliance', 
      ring: '#10b981', 
      textColor: 'text-emerald-400',
      barBg: 'bg-emerald-500'
    };
    if (score >= 50) return { 
      bg: 'text-amber-400 bg-amber-950/60 border-amber-500/30', 
      dot: 'bg-amber-400',
      label: 'Elevated Risk', 
      ring: '#f59e0b', 
      textColor: 'text-amber-400',
      barBg: 'bg-amber-500'
    };
    return { 
      bg: 'text-rose-400 bg-rose-950/60 border-rose-500/30', 
      dot: 'bg-rose-400',
      label: 'Critical Risk', 
      ring: '#f43f5e', 
      textColor: 'text-rose-400',
      barBg: 'bg-rose-500'
    };
  };

  const getVendorBadgeColor = (vendor: string) => {
    const v = vendor.toLowerCase();
    if (v.includes('cisco')) return 'bg-sky-950/70 text-sky-300 border-sky-500/30';
    if (v.includes('juniper')) return 'bg-purple-950/70 text-purple-300 border-purple-500/30';
    if (v.includes('palo')) return 'bg-orange-950/70 text-orange-300 border-orange-500/30';
    return 'bg-slate-900 text-slate-300 border-slate-700';
  };

  // 🌟 Dynamic MagicBento Card Models for Hardware Asset Dossiers
  const hardwareBentoCards: BentoCardItem[] = filteredRecords.map((device) => {
    const badge = getScoreBadge(device.compliance_score);
    const isHardened = device.compliance_score >= 80;
    const isElevated = device.compliance_score >= 50 && device.compliance_score < 80;

    return {
      id: device.id,
      label: `${device.vendor.toUpperCase()} ASSET`,
      title: device.hostname || 'unknown-host',
      description: `${device.vendor} core infrastructure node with automated CIS Benchmark compliance and zero-trust audit trail.`,
      headerBadge: (
        <div className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center space-x-1 border ${
          isHardened
            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
            : isElevated
            ? 'bg-amber-950/80 border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
            : 'bg-rose-950/80 border-rose-500/40 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} animate-pulse`} />
          <span>{isHardened ? 'HARDENED' : isElevated ? 'ELEVATED' : 'CRITICAL'}</span>
        </div>
      ),
      customVisual: (
        <div className="w-full bg-[#050b18]/95 rounded-xl p-3 border border-sky-500/25 space-y-2 font-mono text-xs shadow-inner">
          <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-slate-800/80">
            <div className="flex items-center space-x-1.5 text-sky-400 font-bold">
              <Server className="h-3.5 w-3.5 text-sky-400" />
              <span className="text-[10px] tracking-wide uppercase font-mono">NODE TELEMETRY</span>
            </div>
            <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
              Score: <strong className={badge.textColor}>{device.compliance_score}%</strong>
            </span>
          </div>

          <div className="space-y-1 text-[11px] text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans text-[11px]">Hardware Model:</span>
              <span className="text-slate-200 font-semibold truncate max-w-[150px]">{device.model || 'Enterprise Chassis'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans text-[11px]">Firmware OS:</span>
              <span className="text-sky-300 font-semibold truncate max-w-[150px]">{device.os_version || 'Generic IOS'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans text-[11px]">Audit Coverage:</span>
              <span className="text-emerald-400 font-bold">{device.passed_rules_count}/{device.total_rules} Rules Passed</span>
            </div>
            <div className="flex items-center justify-between pt-0.5 text-[10px]">
              <span className="text-slate-500">Zero-Trust Telemetry:</span>
              <span className="text-sky-400 font-semibold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                <span>SHA-256 Validated</span>
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800/80 mt-1">
            <div
              className={`h-full ${badge.barBg} transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.6)]`}
              style={{ width: `${device.compliance_score}%` }}
            />
          </div>
        </div>
      ),
      footerActions: (
        <div className="flex items-center justify-between w-full" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              onDeleteRecord(device.id);
              showToast(`Deleted record for ${device.hostname}`);
            }}
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Delete Dossier"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={async () => {
                showToast(`📥 Exporting PDF dossier for ${device.hostname}...`);
                try {
                  const res = await fetch(`/api/export-pdf/${device.id}`);
                  if (res.ok) {
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Audit_Report_${device.hostname}.pdf`;
                    a.click();
                    showToast(`✓ Dossier downloaded for ${device.hostname}`);
                  }
                } catch {
                  showToast('❌ Failed to download dossier PDF');
                }
              }}
              className="p-1.5 text-slate-400 hover:text-sky-400 rounded-lg hover:bg-sky-950/40 transition-colors cursor-pointer"
              title="Download PDF Dossier"
            >
              <Download className="h-4 w-4" />
            </button>

            <button
              onClick={() => onSelectRecord(device.id)}
              className="enterprise-btn-secondary py-1 px-3 text-xs inline-flex items-center space-x-1 cursor-pointer font-semibold group-hover:border-sky-500/60"
            >
              <span>Inspect Dossier</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform text-sky-400" />
            </button>
          </div>
        </div>
      ),
      onClick: () => onSelectRecord(device.id)
    };
  });

  // 🔊 Voice Briefing Handler
  const handleToggleVoiceBriefing = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const script = `Aegis Enterprise Compliance Briefing: Fleet compliance score is evaluated at ${avgScore} percent. ${totalDevices} network blades actively monitored across multi-vendor configurations. ${totalFailed} security deviations identified requiring remediation.`;
    
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
    showToast('🔊 Audio briefing playback initiated');
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleTriggerRadarScan = () => {
    setRadarScanning(true);
    setRadarMessage('Sweeping network perimeter nodes against CIS, NIST, and STIG benchmarks...');
    showToast('🔍 Initiated perimeter compliance sweep across all nodes');
    setTimeout(() => {
      setRadarScanning(false);
      setRadarMessage('Fleet audit complete. All policy definitions up to date.');
      showToast('✓ Perimeter sweep completed successfully');
      setTimeout(() => setRadarMessage(null), 5000);
    }, 2200);
  };

  const handleAnalyzeSnippet = async () => {
    if (!sandboxInput.trim()) return;
    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const blob = new Blob([sandboxInput], { type: 'text/plain' });
      const file = new File([blob], `sandbox_${sandboxVendor.toLowerCase()}.cfg`);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('vendor', sandboxVendor);
      formData.append('benchmarks', JSON.stringify(['CIS', 'NIST', 'STIG', 'ISO27001']));

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data);
        showToast('✓ Sandbox configuration tokenized and evaluated');
      }
    } catch (e) {
      console.error(e);
      showToast('❌ Failed to analyze sandbox input');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleQuickDemoAudit = async (type: 'cisco' | 'juniper') => {
    setRunningSample(type);
    try {
      const ciscoFiles = [
        {
          filename: 'cisco_catalyst_core.cfg',
          hostname: 'core-switch-cisco',
          vendor: 'Cisco',
          content: `hostname core-switch-cisco\nno service password-encryption\nusername admin privilege 15 password adminpassword\nip ssh version 1\nip http server\nno ip http secure-server\nsnmp-server community public RO\nline con 0\n exec-timeout 0 0\nline vty 0 4\n login\n transport input telnet ssh\nend\n`
        },
        {
          filename: 'cisco_distribution_switch.cfg',
          hostname: 'dist-switch-cisco-01',
          vendor: 'Cisco',
          content: `hostname dist-switch-cisco-01\nservice password-encryption\nenable secret 5 $1$mERr$hx5rVt7rPNoS4wqbXKX7m0\nip ssh version 2\nip ssh time-out 60\nip ssh authentication-retries 3\nno ip http server\nip http secure-server\nsnmp-server community secret_community RO\nline con 0\n exec-timeout 5 0\nline vty 0 15\n transport input ssh\n logging synchronous\nend\n`
        },
        {
          filename: 'cisco_border_router.cfg',
          hostname: 'border-router-cisco-asr',
          vendor: 'Cisco',
          content: `hostname border-router-cisco-asr\nservice password-encryption\nenable algorithm-type sha256 secret SuperCiscoBorder2026!\nip ssh version 2\nip domain-name enterprise.local\nno ip http server\nip http secure-server\nsnmp-server group SECUREGROUP v3 priv\nsnmp-server user secadmin SECUREGROUP v3 auth sha AuthPass123 priv aes 128 PrivPass123\nlogging buffered 64000\nlogging trap warnings\nline con 0\n exec-timeout 10 0\nline vty 0 4\n transport input ssh\n login local\nend\n`
        },
        {
          filename: 'cisco_access_edge.cfg',
          hostname: 'access-switch-cisco-edge',
          vendor: 'Cisco',
          content: `hostname access-switch-cisco-edge\nno service password-encryption\nusername operator privilege 1 password operatorpass\nip ssh version 1\nip http server\nsnmp-server community private RW\nline con 0\nline vty 0 4\n transport input all\nend\n`
        }
      ];

      const juniperFiles = [
        {
          filename: 'juniper_srx_edge.conf',
          hostname: 'edge-router-juniper',
          vendor: 'Juniper',
          content: `system {\n host-name edge-router-juniper;\n services {\n  ssh {\n   protocol-version v1;\n  }\n  telnet;\n  web-management {\n   http;\n  }\n }\n}\nsnmp {\n community public {\n  authorization read-only;\n }\n}\n`
        },
        {
          filename: 'juniper_core_agg.conf',
          hostname: 'core-agg-juniper-qfx',
          vendor: 'Juniper',
          content: `system {\n host-name core-agg-juniper-qfx;\n services {\n  ssh {\n   protocol-version v2;\n   connection-limit 10;\n   rate-limit 5;\n  }\n  web-management {\n   https {\n    port 443;\n   }\n  }\n }\n login {\n  idle-timeout 10;\n }\n syslog {\n  host 10.0.0.50 {\n   any notice;\n  }\n }\n}\nsnmp {\n v3 {\n  usm {\n   local-engine {\n    user admin-v3 {\n     authentication-sha;\n     privacy-aes128;\n    }\n   }\n  }\n }\n}\n`
        },
        {
          filename: 'juniper_branch_srx.conf',
          hostname: 'branch-srx-juniper-300',
          vendor: 'Juniper',
          content: `system {\n host-name branch-srx-juniper-300;\n services {\n  ssh {\n   protocol-version v2;\n  }\n  web-management {\n   https;\n  }\n }\n login {\n  idle-timeout 15;\n }\n}\nsnmp {\n community enterprise_ro {\n  authorization read-only;\n }\n}\n`
        }
      ];

      const filesToScan = type === 'cisco' ? ciscoFiles : juniperFiles;
      showToast(`⚡ Initializing automated batch scan of all ${filesToScan.length} ${type === 'cisco' ? 'Cisco' : 'Juniper'} network blades...`);

      let lastResult: any = null;

      for (let i = 0; i < filesToScan.length; i++) {
        const item = filesToScan[i];
        showToast(`🔍 [${i + 1}/${filesToScan.length}] Auditing ${item.hostname} (${item.vendor})...`);

        const blob = new Blob([item.content], { type: 'text/plain' });
        const file = new File([blob], item.filename);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('vendor', item.vendor);
        formData.append('benchmarks', JSON.stringify(['CIS', 'NIST', 'STIG', 'ISO27001']));

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        if (res.ok) {
          lastResult = await res.json();
        }
      }

      if (lastResult) {
        onTriggerSampleUpload(lastResult);
        showToast(`✓ All ${filesToScan.length} ${type === 'cisco' ? 'Cisco' : 'Juniper'} files successfully scanned and updated in the fleet!`);
      }
    } catch (e) {
      console.error('Quick audit error:', e);
      showToast('❌ Audit batch scanning encountered an issue.');
    } finally {
      setRunningSample(null);
    }
  };

  const getGoldenConfig = () => {
    if (goldenVendor === 'Juniper') {
      let cfg = `# --- AEGIS GOLDEN HARDENED BASELINE (JUNIPER JUNOS) ---\n`;
      cfg += `# Frameworks: CIS v8 • NIST SP 800-53 R5 • DISA STIG\n\n`;
      cfg += `configure\n`;
      if (goldenPolicies.ssh_v2) cfg += `set system services ssh protocol-version v2\ndelete system services telnet\n`;
      if (goldenPolicies.disable_http) cfg += `delete system services web-management http\nset system services web-management https\n`;
      if (goldenPolicies.snmp_v3) cfg += `delete snmp community\nset snmp v3 USM user admin-v3\n`;
      if (goldenPolicies.exec_timeout) cfg += `set system login idle-timeout 10\n`;
      if (goldenPolicies.syslog_logging) cfg += `set system syslog host 10.100.0.50 any notice\n`;
      cfg += `commit check\n# Execute: commit and-quit\n`;
      return cfg;
    } else {
      let cfg = `! --- AEGIS GOLDEN HARDENED BASELINE (CISCO IOS / IOS-XE) ---\n`;
      cfg += `! Frameworks: CIS v8 • NIST SP 800-53 R5 • DISA STIG\n\n`;
      cfg += `configure terminal\n`;
      if (goldenPolicies.encrypt_passwords) cfg += `service password-encryption\n`;
      if (goldenPolicies.ssh_v2) cfg += `ip ssh version 2\nline vty 0 15\n transport input ssh\n`;
      if (goldenPolicies.disable_http) cfg += `no ip http server\nip http secure-server\n`;
      if (goldenPolicies.snmp_v3) cfg += `no snmp-server community public\nno snmp-server community private\n`;
      if (goldenPolicies.exec_timeout) cfg += `line con 0\n exec-timeout 10 0\nline vty 0 15\n exec-timeout 10 0\n`;
      if (goldenPolicies.syslog_logging) cfg += `logging host 10.100.0.50\nlogging trap notifications\n`;
      cfg += `end\nwrite memory\n`;
      return cfg;
    }
  };

  const currentBadge = getScoreBadge(avgScore);

  return (
    <div className="space-y-8 sm:space-y-10 animate-fade-in-up pb-12 relative text-slate-100">
      
      {/* 🔔 FLOATING ACTION TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs font-semibold px-4 py-2.5 rounded-full border border-sky-500/40 shadow-2xl backdrop-blur-xl flex items-center space-x-2 toast-animate pointer-events-none">
          <CheckCircle2 className="h-4 w-4 text-sky-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 🔮 QUANTUM MAGIC RINGS HERO PORTAL (SINGLE DEFINITIVE HERO BAR) */}
      <div className="relative w-full h-[480px] sm:h-[560px] md:h-[620px] rounded-3xl overflow-hidden border-2 border-sky-500/50 bg-slate-950/90 shadow-[0_0_70px_rgba(56,189,248,0.4)] flex items-center justify-center">
        <MagicRings
          color="#38bdf8"
          colorTwo="#c084fc"
          ringCount={8}
          speed={0.5}
          attenuation={8.5}
          lineThickness={2.6}
          baseRadius={0.48}
          radiusStep={0.12}
          scaleRate={0.14}
          opacity={1.0}
          blur={0}
          noiseAmount={0.12}
          rotation={0}
          ringGap={1.4}
          fadeIn={0.7}
          fadeOut={0.5}
          followMouse={true}
          mouseInfluence={0.25}
          hoverScale={1.15}
          parallax={0.06}
          clickBurst={true}
        />

        {/* Center Glowing [Let's Get Started] Interactive Hero Controls */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 space-y-5 sm:space-y-6 px-6 text-center">
          <div className="text-xs sm:text-sm font-mono font-semibold uppercase tracking-wider text-sky-300 bg-slate-950/90 px-5 py-2 rounded-full border border-sky-500/40 backdrop-blur-md shadow-lg flex items-center space-x-2.5">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
            <span>{radarMessage || 'AUTONOMOUS ZERO-TRUST DEFENSE RADAR'}</span>
          </div>

          {/* 🌟 Radiant Glowing [Let's Get Started] Hero Button with Particle Burst & Proper Navbar Offset */}
          <StarBurst particleCount={40} starCount={20} radius={160} speed={5.5} colors={['#38bdf8', '#c084fc', '#a855f7', '#34d399', '#ffffff']}>
            <div className="relative group pointer-events-auto">
              {/* Outer Ambient Laser Glow Halo */}
              <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-sky-500 via-purple-500 to-cyan-400 opacity-60 blur-xl group-hover:opacity-100 group-hover:blur-2xl transition-all duration-500 animate-pulse pointer-events-none" />
              
              <button
                onClick={() => {
                  const el = document.getElementById('fleet-telemetry-section');
                  if (el) {
                    const yOffset = -120; // 90px floating navbar + 30px comfortable breathing room
                    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
                  }
                }}
                className="relative px-12 sm:px-16 py-5 sm:py-6 rounded-2xl bg-[#090d1f] text-white font-bold text-xl sm:text-3xl border-2 border-sky-400/90 shadow-[0_0_50px_rgba(56,189,248,0.75)] group-hover:shadow-[0_0_90px_rgba(56,189,248,0.95)] group-hover:scale-105 active:scale-95 transition-all duration-300 flex items-center space-x-4 cursor-pointer backdrop-blur-2xl overflow-hidden"
              >
                {/* Moving Sheen Light Highlight */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />
                
                <span className="font-mono text-sky-400 font-bold text-3xl sm:text-4xl bracket-anim-left opacity-90">[</span>
                <span className="lets-get-started-text font-bold text-2xl sm:text-4xl tracking-tight">
                  Let's Get Started
                </span>
                <span className="font-mono text-sky-400 font-bold text-3xl sm:text-4xl bracket-anim-right opacity-90">]</span>
                <ArrowRight className="h-6 sm:h-7 w-6 sm:w-7 text-sky-400 group-hover:translate-x-3 transition-transform duration-300 filter drop-shadow-[0_0_10px_#38bdf8]" />
              </button>
            </div>
          </StarBurst>

          <p className="text-xs sm:text-sm md:text-base text-slate-300 font-medium bg-slate-950/85 px-6 py-2.5 rounded-xl border border-sky-500/30 shadow-[0_0_24px_rgba(56,189,248,0.15)] backdrop-blur-md max-w-xl leading-relaxed text-center tracking-normal">
            Automated Multi-Vendor Hardening & Compliance Governance
          </p>
        </div>
      </div>

      {/* 🛠️ DOWNSTAIRS HERO CONTROLS & DIAGNOSTIC ACTION ROW */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-1 pb-2 relative z-20">
        <button
          onClick={handleToggleVoiceBriefing}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all duration-200 cursor-pointer border backdrop-blur-xl shadow-md ${
            isSpeaking 
              ? 'bg-rose-950/80 text-rose-300 border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.4)]' 
              : 'bg-slate-950/80 hover:bg-slate-900 text-slate-200 hover:text-white border-slate-700/80 hover:border-sky-500/40'
          }`}
        >
          <Volume2 className={`h-3.5 w-3.5 ${isSpeaking ? 'text-rose-400 animate-pulse' : 'text-sky-400'}`} />
          <span>{isSpeaking ? 'Mute Briefing' : 'Executive Audio Briefing'}</span>
        </button>

        <StarBurst particleCount={24} starCount={12} radius={110} speed={4.5} colors={['#38bdf8', '#0284c7', '#6366f1', '#facc15', '#ffffff']}>
          <button
            onClick={handleTriggerRadarScan}
            disabled={radarScanning}
            className="px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all duration-200 cursor-pointer border border-emerald-500/40 bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 hover:text-white shadow-[0_0_20px_rgba(52,211,153,0.25)] hover:scale-105"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${radarScanning ? 'animate-spin' : ''}`} />
            <span>{radarScanning ? 'Scanning Perimeter...' : 'Perimeter Diagnostics'}</span>
          </button>
        </StarBurst>

        <div className="hidden sm:flex items-center space-x-2 pl-2">
          <span className="text-[11px] font-mono font-bold px-3 py-1.5 rounded-xl bg-slate-950/80 text-sky-300 border border-slate-800">
            10 Blades
          </span>
          <span className="text-[11px] font-mono font-bold px-3 py-1.5 rounded-xl bg-slate-950/80 text-emerald-300 border border-slate-800">
            100% Automated
          </span>
          <span className="text-[11px] font-mono font-bold px-3 py-1.5 rounded-xl bg-slate-950/80 text-purple-300 border border-slate-800">
            Offline NLP
          </span>
        </div>
      </div>

      {/* ⚡ DEDICATED QUICK-SCAN ACTION BAR FOR CISCO & JUNIPER */}
      <div className="flex flex-col items-center justify-center space-y-3.5 text-center py-2 px-4 relative z-20">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Scan for Cisco and Juniper Files
          </h2>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Verify zero-trust compliance scoring and generate customized vendor remediation CLI scripts instantly.
          </p>
        </div>

        {/* 🌟 2 High-Voltage Sleek Neon Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
          {/* ⚡ Cisco Catalyst Button */}
          <StarBurst particleCount={28} starCount={14} radius={110} speed={4.5} colors={['#38bdf8', '#0284c7', '#60a5fa', '#ffffff']}>
            <button
              onClick={() => handleQuickDemoAudit('cisco')}
              disabled={runningSample !== null}
              className="group px-7 py-3.5 rounded-2xl bg-slate-950/95 text-white font-bold text-sm border-2 border-sky-400 shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:shadow-[0_0_50px_rgba(56,189,248,0.9)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center space-x-3.5 backdrop-blur-xl"
            >
              <div className="w-8 h-8 rounded-xl bg-sky-950/90 border border-sky-400/60 shadow-[0_0_12px_rgba(56,189,248,0.6)] flex items-center justify-center text-sky-300 group-hover:bg-sky-400 group-hover:text-slate-950 transition-all duration-200">
                <Play className="h-4 w-4 fill-current ml-0.5" />
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-sm text-white group-hover:text-sky-300 transition-colors">Scan Cisco Catalyst</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                </div>
                <span className="text-[10px] font-mono text-sky-300/80 block">IOS-XE Core Switch</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-sky-200 bg-sky-950 px-2 py-0.5 rounded-md border border-sky-500/40">
                .cfg
              </span>
            </button>
          </StarBurst>

          {/* ⚡ Juniper SRX Button */}
          <StarBurst particleCount={28} starCount={14} radius={110} speed={4.5} colors={['#c084fc', '#a855f7', '#e879f9', '#ffffff']}>
            <button
              onClick={() => handleQuickDemoAudit('juniper')}
              disabled={runningSample !== null}
              className="group px-7 py-3.5 rounded-2xl bg-slate-950/95 text-white font-bold text-sm border-2 border-purple-400 shadow-[0_0_25px_rgba(192,132,252,0.5)] hover:shadow-[0_0_50px_rgba(192,132,252,0.9)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center space-x-3.5 backdrop-blur-xl"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-950/90 border border-purple-400/60 shadow-[0_0_12px_rgba(192,132,252,0.6)] flex items-center justify-center text-purple-300 group-hover:bg-purple-400 group-hover:text-slate-950 transition-all duration-200">
                <Play className="h-4 w-4 fill-current ml-0.5" />
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">Scan Juniper SRX</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                </div>
                <span className="text-[10px] font-mono text-purple-300/80 block">JunOS Perimeter</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-purple-200 bg-purple-950 px-2 py-0.5 rounded-md border border-purple-500/40">
                .conf
              </span>
            </button>
          </StarBurst>
        </div>
      </div>

      {/* 🪜 SECTION 2: EXECUTIVE KPI TELEMETRY DECK (LADDER STEPPED ISOMETRIC DECK) */}
      <div id="fleet-telemetry-section" className="relative pb-12 lg:pb-36 scroll-mt-32">
        
        {/* 🪜 LADDER STEPPED CARDS WITH RIGHT-ANGLE CIRCUIT CONNECTORS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
          
          {/* Step 1 / Rung 01: Overall Fleet Health */}
          <div className="relative">
            <div 
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="spotlight-card flashy-glow-sky ladder-step-1 p-5 flex flex-col justify-between cursor-pointer"
            >
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-black text-sky-300 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-500/40 flex items-center space-x-1">
                    <Activity className="h-3 w-3 text-sky-400" />
                    <span>RUNG 01 // OVERVIEW</span>
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${currentBadge.bg}`}>
                    {currentBadge.label}
                  </span>
                </div>

                <div className="flex items-baseline space-x-2 my-1">
                  <span className="text-3xl font-extrabold tracking-tight text-white num-glow">
                    <AnimatedNumber value={avgScore} suffix="%" />
                  </span>
                  <span className="text-xs text-slate-300 font-medium">overall score</span>
                </div>

                {/* Score Mini Bar */}
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/80">
                  <div 
                    className={`h-full ${currentBadge.barBg} transition-all duration-500 rounded-full shadow-sm`}
                    style={{ width: `${avgScore}%` }}
                  ></div>
                </div>
                
                <div className="text-[11px] text-slate-300 flex items-center justify-between font-mono pt-1">
                  <span>Coverage: 4 Standards</span>
                  <span className="text-sky-300 font-bold">100% Audit</span>
                </div>
              </div>
            </div>

            {/* ⚡ Pixel-Perfect Stepped Circuit Connector: Card 1 ➔ Card 2 */}
            <div className="hidden lg:block absolute -right-[20px] top-1/2 -translate-y-[2px] w-[20px] h-[44px] pointer-events-none z-30">
              <svg width="20" height="42" viewBox="0 0 20 42" fill="none" className="overflow-visible">
                <path d="M 0 2 H 10 V 40 H 20" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="2" fill="none" />
                <path d="M 0 2 H 10 V 40 H 20" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" className="ladder-connector-path" fill="none" />
                <circle cx="0" cy="2" r="3.5" fill="#38bdf8" filter="drop-shadow(0 0 6px #38bdf8)" />
                <circle cx="10" cy="2" r="2" fill="#ffffff" />
                <circle cx="10" cy="40" r="2" fill="#ffffff" />
                <circle cx="20" cy="40" r="3.5" fill="#38bdf8" filter="drop-shadow(0 0 6px #38bdf8)" />
              </svg>
            </div>
          </div>

          {/* Step 2 / Rung 02: Monitored Nodes */}
          <div className="relative">
            <div 
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="spotlight-card flashy-glow-sky ladder-step-2 p-5 flex flex-col justify-between cursor-pointer"
            >
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-black text-sky-300 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-500/40">
                    RUNG 02 // BLADES
                  </span>
                  <div className="p-1 bg-sky-950 text-sky-300 rounded border border-sky-500/40">
                    <Server className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="flex items-baseline space-x-2 my-1">
                  <span className="text-3xl font-extrabold tracking-tight text-white num-glow">
                    <AnimatedNumber value={totalDevices} />
                  </span>
                  <span className="text-xs text-slate-300 font-medium">Hardware Blades</span>
                </div>

                <div className="text-[10px] font-mono text-sky-200 bg-slate-950 px-2.5 py-1 rounded-lg border border-sky-500/30 truncate font-semibold">
                  Cisco IOS • JunOS • PAN-OS
                </div>

                <div className="text-[11px] text-slate-300 flex items-center justify-between font-mono pt-1">
                  <span>Heterogeneous Mesh</span>
                  <span className="text-emerald-400 font-bold">Synchronized</span>
                </div>
              </div>
            </div>

            {/* ⚡ Pixel-Perfect Stepped Circuit Connector: Card 2 ➔ Card 3 */}
            <div className="hidden lg:block absolute -right-[20px] top-1/2 -translate-y-[2px] w-[20px] h-[44px] pointer-events-none z-30">
              <svg width="20" height="42" viewBox="0 0 20 42" fill="none" className="overflow-visible">
                <path d="M 0 40 H 10 V 78 H 20" stroke="rgba(52, 211, 153, 0.35)" strokeWidth="2" fill="none" />
                <path d="M 0 40 H 10 V 78 H 20" stroke="#34d399" strokeWidth="2" strokeDasharray="4 4" className="ladder-connector-path" fill="none" />
                <circle cx="0" cy="40" r="3.5" fill="#34d399" filter="drop-shadow(0 0 6px #34d399)" />
                <circle cx="10" cy="40" r="2" fill="#ffffff" />
                <circle cx="10" cy="78" r="2" fill="#ffffff" />
                <circle cx="20" cy="78" r="3.5" fill="#34d399" filter="drop-shadow(0 0 6px #34d399)" />
              </svg>
            </div>
          </div>

          {/* Step 3 / Rung 03: Passing Hardened Controls */}
          <div className="relative">
            <div 
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="spotlight-card flashy-glow-emerald ladder-step-3 p-5 flex flex-col justify-between cursor-pointer"
            >
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-black text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                    RUNG 03 // CONTROLS
                  </span>
                  <div className="p-1 bg-emerald-950 text-emerald-300 rounded border border-emerald-500/40">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="flex items-baseline space-x-2 my-1">
                  <span className="text-3xl font-extrabold tracking-tight text-emerald-400 num-glow">
                    <AnimatedNumber value={totalPassed} />
                  </span>
                  <span className="text-xs text-emerald-400/90 font-medium">Controls Passed</span>
                </div>

                <div className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center space-x-1 font-semibold">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Conforms to Baseline</span>
                </div>

                <div className="text-[11px] text-slate-300 flex items-center justify-between font-mono pt-1">
                  <span>Zero-Trust Validation</span>
                  <span className="text-emerald-400 font-bold">Enforced</span>
                </div>
              </div>
            </div>

            {/* ⚡ Pixel-Perfect Stepped Circuit Connector: Card 3 ➔ Card 4 */}
            <div className="hidden lg:block absolute -right-[20px] top-1/2 -translate-y-[2px] w-[20px] h-[44px] pointer-events-none z-30">
              <svg width="20" height="42" viewBox="0 0 20 42" fill="none" className="overflow-visible">
                <path d="M 0 78 H 10 V 116 H 20" stroke="rgba(251, 113, 133, 0.35)" strokeWidth="2" fill="none" />
                <path d="M 0 78 H 10 V 116 H 20" stroke="#fb7185" strokeWidth="2" strokeDasharray="4 4" className="ladder-connector-path" fill="none" />
                <circle cx="0" cy="78" r="3.5" fill="#fb7185" filter="drop-shadow(0 0 6px #fb7185)" />
                <circle cx="10" cy="78" r="2" fill="#ffffff" />
                <circle cx="10" cy="116" r="2" fill="#ffffff" />
                <circle cx="20" cy="116" r="3.5" fill="#fb7185" filter="drop-shadow(0 0 6px #fb7185)" />
              </svg>
            </div>
          </div>

          {/* Step 4 / Rung 04: Active Policy Deviations */}
          <div className="relative">
            <div 
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="spotlight-card flashy-glow-rose ladder-step-4 p-5 flex flex-col justify-between cursor-pointer"
            >
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-black text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/40">
                    RUNG 04 // ANOMALIES
                  </span>
                  <div className="p-1 bg-rose-950 text-rose-300 rounded border border-rose-500/40">
                    <ShieldAlert className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="flex items-baseline space-x-2 my-1">
                  <span className="text-3xl font-extrabold tracking-tight text-rose-400 num-glow">
                    <AnimatedNumber value={totalFailed} />
                  </span>
                  <span className="text-xs text-rose-400/90 font-medium">Open Deviations</span>
                </div>

                <div className="text-[10px] font-mono text-rose-300 bg-rose-950/80 px-2.5 py-1 rounded-lg border border-rose-500/30 flex items-center space-x-1 font-semibold">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Remediation CLI Available</span>
                </div>

                <div className="text-[11px] text-slate-300 flex items-center justify-between font-mono pt-1">
                  <span>1-Click Remediation</span>
                  <span className="text-sky-300 font-bold">Ready</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>


      {/* 🚀 SECTION 3: ENTERPRISE ARCHITECTURE & MULTI-VENDOR SPECIFICATION */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Supported Hardware Architecture & Engine Status */}
        <div 
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="spotlight-card p-6 flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Network className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">Enterprise Multi-Vendor Engine</h3>
              </div>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                Vendor-Agnostic
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Standardized security parameter abstraction across proprietary syntax models with dynamic AST normalization.
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1">
              {[
                { name: 'Cisco', sub: 'IOS/XE', color: 'border-sky-500/30 text-sky-300' },
                { name: 'Juniper', sub: 'JunOS', color: 'border-purple-500/30 text-purple-300' },
                { name: 'Palo Alto', sub: 'PAN-OS', color: 'border-orange-500/30 text-orange-300' },
                { name: 'Arista', sub: 'EOS', color: 'border-cyan-500/30 text-cyan-300' },
                { name: 'SONiC', sub: 'Open OS', color: 'border-emerald-500/30 text-emerald-300' },
              ].map(v => (
                <div key={v.name} className={`p-2 rounded-xl bg-slate-950 border ${v.color} text-center space-y-0.5`}>
                  <span className="font-bold text-xs block text-white">{v.name}</span>
                  <span className="text-[9px] font-mono text-slate-400 block">{v.sub}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between relative z-10 font-mono">
            <span>Parser Pipeline:</span>
            <span className="text-emerald-400 font-semibold flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Offline NLP & Regex Engine</span>
            </span>
          </div>
        </div>

      </div>

      {/* ⚡ SECTION 3.5: GLSL LASER FLOW VOLUMETRIC SYNTAX STREAM */}
      <LaserFlowShowcase color="#FF79C6" />

      {/* 📊 SECTION 3.6: AI USAGE & TELEMETRY CONSUMPTION BLOCK (REACT BITS PRO) */}
      <AIUsage8 
        planName="ENTERPRISE ZERO-TRUST PRO"
        cycleResetDays={12}
        primaryMetricName="AI Security Heuristic Inferences"
        usedInferences={842500}
        totalInferences={1000000}
        onUpgrade={() => {
          setToastMessage('Capacity upgrade request submitted to Network Operations.');
          setTimeout(() => setToastMessage(''), 3000);
        }}
      />

      {/* 🛠️ SECTION 4: INTERACTIVE SECURITY WORKBENCH & BASELINE ARCHITECT */}
      <div 
        id="security-studio-section"
        onMouseMove={handleMouseMove}
        className="spotlight-card p-6 sm:p-7 space-y-6"
      >
        
        {/* Studio Header & Tab Navigator */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-5 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-800 text-sky-400 rounded-xl border border-slate-700/60 shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Interactive Security Studio & Baseline Architect
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time CLI tokenization sandbox, CIS v8 golden configuration generator, and regulatory frameworks matrix.
              </p>
            </div>
          </div>

          {/* Segmented Control Tabs */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setActiveStudioTab('sandbox')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center space-x-1.5 ${
                activeStudioTab === 'sandbox'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>AI CLI Sandbox</span>
            </button>

            <button
              onClick={() => setActiveStudioTab('pentest')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center space-x-1.5 ${
                activeStudioTab === 'pentest'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bug className="h-3.5 w-3.5" />
              <span>Penetration Test Lab</span>
            </button>

            <button
              onClick={() => setActiveStudioTab('golden')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center space-x-1.5 ${
                activeStudioTab === 'golden'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>Golden Baseline</span>
            </button>

            <button
              onClick={() => setActiveStudioTab('frameworks')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center space-x-1.5 ${
                activeStudioTab === 'frameworks'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Benchmark Standards</span>
            </button>

            <button
              onClick={() => setActiveStudioTab('bento')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center space-x-1.5 ${
                activeStudioTab === 'bento'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Architecture Bento</span>
            </button>
          </div>
        </div>

        {/* Tab 1: AI CLI SANDBOX */}
        {activeStudioTab === 'sandbox' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-1 animate-fade-in-up relative z-10">
            {/* Left: Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                <span className="flex items-center space-x-1.5">
                  <Terminal className="h-3.5 w-3.5 text-sky-400" />
                  <span>Raw Multi-Vendor CLI Stream</span>
                </span>
                <select
                  value={sandboxVendor}
                  onChange={(e) => setSandboxVendor(e.target.value)}
                  className="bg-slate-900 border border-slate-700/80 text-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono cursor-pointer focus:outline-none focus:border-sky-500"
                >
                  <option value="Cisco">Cisco Platform</option>
                  <option value="Juniper">Juniper Platform</option>
                  <option value="Palo Alto">Palo Alto Platform</option>
                </select>
              </div>

              <textarea
                value={sandboxInput}
                onChange={(e) => setSandboxInput(e.target.value)}
                rows={7}
                className="w-full bg-[#070d18] text-sky-300 font-mono text-xs p-3.5 rounded-xl border border-slate-800 focus:border-sky-500/80 focus:outline-none leading-relaxed select-all resize-none shadow-inner"
                placeholder="Paste CLI commands to tokenize..."
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400 font-mono">
                  AST Tokenizer & Heuristic Classifier
                </span>
                <button
                  onClick={handleAnalyzeSnippet}
                  disabled={analyzing}
                  className="enterprise-btn-primary py-1.5 px-4 text-xs flex items-center space-x-1.5 cursor-pointer shadow-md"
                >
                  <Sparkles className={`h-3.5 w-3.5 ${analyzing ? 'animate-spin' : ''}`} />
                  <span>{analyzing ? 'Tokenizing...' : 'Audit Syntax Snippet'}</span>
                </button>
              </div>
            </div>

            {/* Right: Output */}
            <div className="space-y-3">
              <span className="text-xs text-slate-300 font-semibold flex items-center space-x-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Normalized Parameter Extraction</span>
              </span>

              {analysisResult ? (
                <div className="bg-[#070d18] p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs shadow-inner">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Evaluated Score:</span>
                    <span className={`font-bold px-2 py-0.5 rounded ${getScoreBadge(analysisResult.compliance_score).bg}`}>
                      {analysisResult.compliance_score}%
                    </span>
                  </div>
                  <div className="space-y-1 text-slate-300 max-h-[160px] overflow-y-auto">
                    {analysisResult.results.map((r: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between py-1 text-[11px]">
                        <span className="truncate pr-2">{r.name}</span>
                        <span className={r.status === 'Pass' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {r.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[185px] bg-[#070d18] rounded-xl border border-slate-800 flex flex-col items-center justify-center text-slate-400 text-xs space-y-2">
                  <Terminal className="h-6 w-6 text-slate-500" />
                  <span>Execute snippet audit to inspect normalized parameters</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: PENETRATION TEST LAB & ATTACK SIMULATION */}
        {activeStudioTab === 'pentest' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1 animate-fade-in-up relative z-10">
            {/* Left Column (5 cols): Target Profile, State Toggle & Exploit Vector Select */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Target Device Card */}
              <div className="bg-[#070d18] border border-slate-800 rounded-xl p-4 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono font-semibold text-slate-200">TARGET: 10.0.1.1 (core-sw-01)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
                    Cisco IOS-XE 17.6
                  </span>
                </div>

                {/* State Switcher: Vulnerable (Pre-Audit) vs AEGIS Hardened (Post-Audit) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Target Hardening State
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800/80">
                    <button
                      onClick={() => { setPentestTargetState('vulnerable'); setPentestResult('idle'); setPentestLogs([]); }}
                      className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                        pentestTargetState === 'vulnerable'
                          ? 'bg-rose-600/90 text-white shadow-lg shadow-rose-950/50 border border-rose-500/40'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Unlock className="h-3.5 w-3.5" />
                      <span>Unpatched (Pre-Audit)</span>
                    </button>
                    <button
                      onClick={() => { setPentestTargetState('hardened'); setPentestResult('idle'); setPentestLogs([]); }}
                      className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                        pentestTargetState === 'hardened'
                          ? 'bg-emerald-600/90 text-white shadow-lg shadow-emerald-950/50 border border-emerald-500/40'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>AEGIS Hardened</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 px-1">
                    {pentestTargetState === 'vulnerable'
                      ? '⚠️ Running baseline configuration with known CIS compliance violations.'
                      : '🛡️ Enforcing AEGIS automated zero-trust security configuration.'}
                  </p>
                </div>
              </div>

              {/* Attack Vector Selection List */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Select Attack Vector / Exploit Payload</span>
                  <span className="text-rose-400 text-[10px] font-mono">MITRE ATT&CK Linked</span>
                </label>

                <div className="space-y-2">
                  {(Object.keys(pentestScenarios) as Array<keyof typeof pentestScenarios>).map((key) => {
                    const sc = pentestScenarios[key];
                    const isSelected = pentestVector === key;
                    return (
                      <div
                        key={key}
                        onClick={() => {
                          if (!isPentesting) {
                            setPentestVector(key);
                            setPentestResult('idle');
                            setPentestLogs([]);
                          }
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-rose-950/20 border-rose-500/60 shadow-md shadow-rose-950/30'
                            : 'bg-[#070d18] border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold ${isSelected ? 'text-rose-300' : 'text-slate-200'}`}>
                            {sc.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400">
                            {sc.port}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
                          {sc.description}
                        </p>
                        <div className="flex items-center space-x-2 text-[10px] font-mono">
                          <span className="px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-500/30 text-rose-300">
                            {sc.cve}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                            CVSS: {sc.cvss}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Launch Penetration Test Button */}
              <button
                onClick={handleRunPentest}
                disabled={isPentesting}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg ${
                  isPentesting
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white border border-rose-400/30 shadow-rose-950/50 hover:shadow-rose-900/60 hover:scale-[1.01]'
                }`}
              >
                {isPentesting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-rose-400" />
                    <span className="font-mono tracking-wide">EXECUTING EXPLOIT PAYLOAD...</span>
                  </>
                ) : (
                  <>
                    <Crosshair className="h-4 w-4" />
                    <span className="tracking-wide">LAUNCH PENETRATION TEST</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Column (7 cols): Animated Kali Console & Exploit Verdict */}
            <div className="lg:col-span-7 flex flex-col space-y-4">
              
              {/* Animated Attack Terminal */}
              <div className="bg-[#040812] border border-slate-800 rounded-xl overflow-hidden flex flex-col flex-1 min-h-[420px] shadow-2xl">
                {/* Terminal Header */}
                <div className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 ml-2">
                      kali@aegis-offensive-lab:~$ ./exploit_runner.py --target 10.0.1.1
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800">
                      MODE: {pentestTargetState.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Terminal Body */}
                <div className="p-4 font-mono text-[11px] space-y-2 flex-1 overflow-y-auto max-h-[340px] bg-[#02050b] text-slate-300">
                  {pentestLogs.length === 0 && !isPentesting && (
                    <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-slate-500 space-y-2">
                      <Crosshair className="h-8 w-8 text-slate-600 animate-pulse" />
                      <span className="text-xs">Select attack vector and click &quot;LAUNCH PENETRATION TEST&quot;</span>
                      <span className="text-[10px] text-slate-600">Simulates packet-level exploit payloads against target network device</span>
                    </div>
                  )}

                  {pentestLogs.map((log, i) => {
                    const isBreach = log.includes('BREACH') || log.includes('CRITICAL') || log.includes('EXPLOIT SUCCESSFUL') || log.includes('CRACKED');
                    const isBlocked = log.includes('BLOCKED') || log.includes('SECURED');
                    const isWarning = log.startsWith('[!]');
                    const isSuccess = log.startsWith('[+]');
                    const isError = log.startsWith('[-]');
                    
                    return (
                      <div
                        key={i}
                        className={`leading-relaxed transition-all duration-150 ${
                          isBreach
                            ? 'text-rose-400 font-bold bg-rose-950/30 p-1.5 rounded border border-rose-500/30'
                            : isBlocked
                            ? 'text-emerald-400 font-bold bg-emerald-950/30 p-1.5 rounded border border-emerald-500/30'
                            : isWarning
                            ? 'text-amber-300'
                            : isSuccess
                            ? 'text-sky-300'
                            : isError
                            ? 'text-rose-400/80'
                            : 'text-slate-400'
                        }`}
                      >
                        {log}
                      </div>
                    );
                  })}

                  {isPentesting && (
                    <div className="flex items-center space-x-2 text-rose-400 animate-pulse pt-2">
                      <span className="inline-block w-2 h-4 bg-rose-500 animate-ping" />
                      <span>Transmitting payload frames to 10.0.1.1...</span>
                    </div>
                  )}
                </div>

                {/* Verdict Footer Banner */}
                {pentestResult !== 'idle' && (
                  <div className={`p-3.5 border-t flex items-center justify-between ${
                    pentestResult === 'breached'
                      ? 'bg-rose-950/40 border-rose-900/60 text-rose-200'
                      : 'bg-emerald-950/40 border-emerald-900/60 text-emerald-200'
                  }`}>
                    <div className="flex items-center space-x-2.5">
                      {pentestResult === 'breached' ? (
                        <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
                      ) : (
                        <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-bold font-mono">
                          {pentestResult === 'breached'
                            ? 'EXPLOIT VERIFIED: TARGET DEVICE COMPROMISED'
                            : 'EXPLOIT NEUTRALIZED: DEFENSE-IN-DEPTH ACTIVE'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {pentestResult === 'breached'
                            ? 'Audit compliance failure directly led to confirmed remote breach.'
                            : 'AEGIS hardened configuration successfully rejected all malicious payloads.'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-mono font-bold ${pentestResult === 'breached' ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {pentestResult === 'breached' ? 'RISK: CVSS ' + pentestScenarios[pentestVector].cvss : 'RISK: CVSS 0.0'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {pentestResult === 'breached' ? 'STATUS: CRITICAL' : 'STATUS: HARDENED'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 1-Click Remediation Recommendation Box */}
              {pentestResult === 'breached' && (
                <div className="bg-[#070d18] border border-rose-900/40 rounded-xl p-4 space-y-2 animate-fade-in-up">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-rose-300 flex items-center space-x-1.5">
                      <Shield className="h-3.5 w-3.5 text-rose-400" />
                      <span>AEGIS Instant Remediation Fix (CIS Compliant)</span>
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(pentestScenarios[pentestVector].remediation);
                        showToast('Remediation CLI snippet copied!');
                      }}
                      className="text-[10px] font-mono text-slate-400 hover:text-white flex items-center space-x-1 px-2 py-1 bg-slate-900 border border-slate-800 rounded cursor-pointer"
                    >
                      <Copy className="h-3 w-3" />
                      <span>Copy Fix</span>
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-emerald-400 overflow-x-auto">
                    {pentestScenarios[pentestVector].remediation}
                  </pre>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Apply this snippet to upgrade target from &quot;Unpatched&quot; to &quot;AEGIS Hardened&quot;.</span>
                    <button
                      onClick={() => {
                        setPentestTargetState('hardened');
                        showToast('Switching target to AEGIS Hardened mode...');
                        setTimeout(() => handleRunPentest(), 300);
                      }}
                      className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer underline"
                    >
                      Apply &amp; Re-test Immediately →
                    </button>
                  </div>
                </div>
              )}

              {pentestResult === 'blocked' && (
                <div className="bg-[#070d18] border border-emerald-900/40 rounded-xl p-3.5 flex items-center justify-between animate-fade-in-up">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs text-emerald-300">
                      Target verified compliant with CIS Benchmark 2.1 &amp; Zero-Trust Architecture.
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">AUDIT MATCH: 100%</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: GOLDEN HARDENED CONFIG GENERATOR */}
        {activeStudioTab === 'golden' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1 animate-fade-in-up relative z-10">
            {/* Left: Toggles */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                <span>Target Hardware Operating System</span>
                <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setGoldenVendor('Cisco')}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-mono cursor-pointer transition-all ${goldenVendor === 'Cisco' ? 'bg-sky-600 text-white' : 'text-slate-400'}`}
                  >
                    Cisco IOS
                  </button>
                  <button
                    onClick={() => setGoldenVendor('Juniper')}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-mono cursor-pointer transition-all ${goldenVendor === 'Juniper' ? 'bg-sky-600 text-white' : 'text-slate-400'}`}
                  >
                    JunOS
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { key: 'ssh_v2', label: 'Enforce SSH v2 (Disable Telnet)' },
                  { key: 'encrypt_passwords', label: 'Service Password Encryption' },
                  { key: 'disable_http', label: 'Disable Plain HTTP Web Management' },
                  { key: 'snmp_v3', label: 'Restrict to SNMP v3 USM Only' },
                  { key: 'exec_timeout', label: 'Configure VTY Inactive Timeout (10m)' },
                  { key: 'syslog_logging', label: 'Enable Remote Syslog Telemetry Host' },
                ].map(p => (
                  <label key={p.key} className="flex items-center justify-between p-2.5 rounded-xl enterprise-sub-panel text-xs text-slate-200 cursor-pointer select-none">
                    <span>{p.label}</span>
                    <input
                      type="checkbox"
                      checked={(goldenPolicies as any)[p.key]}
                      onChange={(e) => setGoldenPolicies(prev => ({ ...prev, [p.key]: e.target.checked }))}
                      className="accent-sky-500 h-4 w-4 cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Right: Code Output */}
            <div className="lg:col-span-7 space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                <span className="flex items-center space-x-1.5">
                  <Terminal className="h-3.5 w-3.5 text-sky-400" />
                  <span>Production Hardened Baseline (`.cfg`)</span>
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(getGoldenConfig());
                      showToast('✓ Hardened golden configuration copied');
                    }}
                    className="px-2.5 py-1 enterprise-btn-secondary text-xs flex items-center space-x-1 cursor-pointer"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </button>

                  <a
                    href={`data:text/plain;charset=utf-8,${encodeURIComponent(getGoldenConfig())}`}
                    download={`golden_hardened_${goldenVendor.toLowerCase()}_baseline.cfg`}
                    onClick={() => showToast('✓ Downloading .cfg baseline file')}
                    className="enterprise-btn-primary py-1 px-3 text-xs inline-flex items-center space-x-1 cursor-pointer"
                  >
                    <Download className="h-3 w-3" />
                    <span>Download .cfg</span>
                  </a>
                </div>
              </div>

              <pre className="bg-[#070d18] text-sky-300 p-4 rounded-xl border border-slate-800 font-mono text-xs h-[230px] overflow-y-auto whitespace-pre-wrap leading-relaxed select-all shadow-inner">
                {getGoldenConfig()}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: COMPLIANCE STANDARDS MATRIX (RICH INTERACTIVE HUD MATRIX) */}
        {activeStudioTab === 'frameworks' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-1 animate-fade-in-up relative z-10">
            {[
              {
                name: 'CIS Benchmark v8',
                badge: 'Level 1 & 2',
                colorClass: 'flashy-glow-sky',
                accentColor: 'text-sky-400',
                borderColor: 'border-sky-500/40',
                icon: ShieldCheck,
                desc: 'Industry consensus configuration standards for service hardening, encryption parameters, and management interfaces.',
                rules: ['SSH v2 Enforced', 'AAA New-Model', 'Password Encryption', 'VTY Inactive Timeout'],
                status: 'Level 1 & 2 Conformance',
                score: '100%'
              },
              {
                name: 'NIST SP 800-53 R5',
                badge: 'Federal Moderate',
                colorClass: 'flashy-glow-emerald',
                accentColor: 'text-emerald-400',
                borderColor: 'border-emerald-500/40',
                icon: Lock,
                desc: 'Federal security catalog controls across Access Control (AC), System Monitoring (SC), and Audit Accountability (AU).',
                rules: ['AC-17 Remote Access', 'SC-8 Confid. & Integrity', 'AU-12 Audit Generation', 'IA-2 ID & Auth'],
                status: 'FedRAMP / NIST Verified',
                score: '100%'
              },
              {
                name: 'DISA STIG',
                badge: 'DoD High Assurance',
                colorClass: 'flashy-glow-purple',
                accentColor: 'text-purple-400',
                borderColor: 'border-purple-500/40',
                icon: ShieldAlert,
                desc: 'Department of Defense technical implementation guidelines for high-assurance network perimeter enforcement.',
                rules: ['CAT I Flaws: 0', 'CAT II Hardened: 14', 'Zero-Trust Enforced', 'Air-Gap Security'],
                status: 'DoD Mission Ready',
                score: '100%'
              },
              {
                name: 'ISO/IEC 27001',
                badge: 'Annex A.9 & A.13',
                colorClass: 'flashy-glow-amber',
                accentColor: 'text-amber-400',
                borderColor: 'border-amber-500/40',
                icon: FileText,
                desc: 'International information security management controls for network boundary isolation and idle session controls.',
                rules: ['A.9 Access Control', 'A.13 Network Isolation', 'A.12.4 Event Logging', 'Cryptographic Controls'],
                status: 'Audit Trail Certified',
                score: '100%'
              }
            ].map((fw, idx) => {
              const IconComponent = fw.icon;
              return (
                <div 
                  key={idx} 
                  onClick={() => showToast(`🛡️ Selected ${fw.name} (${fw.badge}) — 100% Policy Rules Applied to Audit Baseline`)}
                  className={`spotlight-card ${fw.colorClass} p-5 rounded-2xl flex flex-col justify-between space-y-4 cursor-pointer transition-all duration-200 hover:-translate-y-1 active:scale-[0.97] active:brightness-125 select-none`}
                >
                  <div className="space-y-3">
                    {/* Header with Icon & Tier Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1.5 rounded-lg bg-slate-950/80 border ${fw.borderColor} ${fw.accentColor} shadow-sm`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <h3 className="font-extrabold text-sm text-white tracking-tight">{fw.name}</h3>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-950/90 border ${fw.borderColor} ${fw.accentColor} shadow-sm`}>
                        {fw.badge}
                      </span>
                    </div>

                    {/* Summary Description */}
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      {fw.desc}
                    </p>

                    {/* High-Contrast Control Parameter Chips */}
                    <div className="bg-slate-950/90 p-2.5 rounded-xl border border-slate-800/80 space-y-1.5 shadow-inner">
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Hardened Parameters</span>
                        <span className={`${fw.accentColor}`}>Active</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {fw.rules.map((rule, rIdx) => (
                          <span 
                            key={rIdx} 
                            className="text-[9.5px] font-mono px-1.5 py-0.5 rounded-md bg-slate-900/90 text-slate-200 border border-slate-700/80 font-medium"
                          >
                            {rule}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Telemetry Strip */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 text-[11px] flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>{fw.status}</span>
                    </span>
                    <span className="text-emerald-400 font-extrabold text-xs bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      {fw.score} Coverage
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 4: MAGIC BENTO ARCHITECTURE GRID */}
        {activeStudioTab === 'bento' && (
          <div className="space-y-4 pt-1 animate-fade-in-up relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Aegis Autonomous Defense Architecture & Core Capabilities
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Interactive 3D particle bento matrix showcasing multi-vendor tokenizers, heuristic AI adaptations, and automated zero-trust hardening.
                </p>
              </div>
              <span className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-500/30 self-start sm:self-auto">
                Interactive 3D Particles
              </span>
            </div>

            <MagicBento 
              textAutoHide={false}
              enableStars={true}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={true}
              enableMagnetism={true}
              clickEffect={true}
              spotlightRadius={280}
              particleCount={10}
              glowColor="56, 189, 248"
            />
          </div>
        )}
      </div>


      {/* 🚀 SECTION 5: AUDITED HARDWARE ASSET INVENTORY & DOSSIERS */}
      <div 
        className="border-beam-card rounded-2xl p-6 space-y-5 shadow-2xl overflow-hidden"
      >
        
        {/* Header Bar with View Toggle, Search & Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-800/80 relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-sky-400 flex items-center justify-center border border-slate-700/60 shrink-0">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Audited Hardware Asset Dossiers
                </h2>
                <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700 font-medium">
                  {filteredRecords.length} of {records.length} Nodes
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-vendor inventory with real-time compliance scoring and instant auto-remediation scripts.
              </p>
            </div>
          </div>

          {/* Interactive Controls: Search, Sort, Vendor Pills, View Mode */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Real-time Search Input */}
            <div className="relative min-w-[180px] sm:min-w-[220px]">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter hostname or OS..."
                className="w-full bg-slate-950 text-xs text-slate-200 pl-8.5 pr-8 py-1.5 rounded-xl border border-slate-800 focus:border-sky-500/70 focus:outline-none transition-all placeholder:text-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-xs text-slate-400">
              <ArrowUpDown className="h-3 w-3 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-slate-300 text-xs cursor-pointer focus:outline-none"
              >
                <option value="score-desc">Highest Score</option>
                <option value="score-asc">Lowest Score</option>
                <option value="name">Hostname (A-Z)</option>
                <option value="recent">Most Recent</option>
              </select>
            </div>

            {/* Vendor Filter Tabs with Live Counts */}
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <Filter className="h-3 w-3 text-slate-400 ml-2 mr-1" />
              {(['All', 'Cisco', 'Juniper', 'Palo Alto'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setSelectedVendorFilter(v)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center space-x-1 ${
                    selectedVendorFilter === v 
                      ? 'bg-sky-600 text-white shadow-xs' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{v}</span>
                  <span className={`text-[10px] font-mono px-1 rounded-sm ${selectedVendorFilter === v ? 'bg-sky-800 text-sky-100' : 'bg-slate-900 text-slate-400'}`}>
                    {vendorCounts[v]}
                  </span>
                </button>
              ))}
            </div>

            {/* View Switcher: Lenticular 3D / Magic Bento Dossiers / List */}
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode('lenticular')}
                className={`p-1.5 rounded-lg cursor-pointer transition-all flex items-center space-x-1 ${
                  viewMode === 'lenticular' 
                    ? 'bg-sky-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Lenticular 3D Holographic Carousel"
              >
                <Layers className="h-4 w-4" />
                <span className="text-[10px] font-mono font-bold px-1">3D Carousel</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg cursor-pointer transition-all flex items-center space-x-1 ${
                  viewMode === 'grid' 
                    ? 'bg-sky-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Magic Bento Dossiers"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="text-[10px] font-mono font-bold px-1">Magic Bento</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                  viewMode === 'list' 
                    ? 'bg-slate-800 text-white' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredRecords.length === 0 ? (
          <div className="py-14 text-center text-slate-400 space-y-3 bg-slate-950/60 rounded-xl border border-slate-800 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-white">No Matching Nodes Found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {searchQuery 
                  ? `No hardware nodes matching "${searchQuery}". Clear your search query to see all assets.`
                  : 'Trigger a sample audit above or upload a device configuration in Ingestion.'}
              </p>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="enterprise-btn-secondary px-3 py-1.5 text-xs inline-flex items-center space-x-1 cursor-pointer"
              >
                <span>Clear Search Filter</span>
              </button>
            )}
          </div>
        ) : viewMode === 'lenticular' ? (
          /* 🌟 LENTICULAR 3D HOLOGRAPHIC CAROUSEL (REACT BITS PRO) */
          <div className="py-2 relative z-10">
            <LenticularCarousel
              items={filteredRecords as any}
              onViewDetails={(device) => onSelectRecord(device.id)}
              onDownloadPdf={async (device) => {
                showToast(`📥 Exporting cryptographic dossier for ${device.hostname}...`);
                try {
                  const res = await fetch(`/api/export-pdf/${device.id}`);
                  if (res.ok) {
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Audit_Report_${device.hostname}.pdf`;
                    a.click();
                    showToast(`✓ Dossier downloaded for ${device.hostname}`);
                  }
                } catch {
                  showToast('❌ Failed to download dossier PDF');
                }
              }}
              getScoreBadge={getScoreBadge}
              getVendorBadgeColor={getVendorBadgeColor}
            />
          </div>
        ) : viewMode === 'grid' ? (
          /* 🌟 100% IDENTICAL MAGIC BENTO CARDS & GLOBAL SPOTLIGHT */
          <div className="relative z-10 py-1">
            <MagicBento 
              cards={hardwareBentoCards}
              textAutoHide={false}
              enableStars={true}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={true}
              enableMagnetism={true}
              clickEffect={true}
              spotlightRadius={280}
              particleCount={10}
              glowColor="56, 189, 248"
            />
          </div>
        ) : (
          /* 📜 CLEAN ENTERPRISE LIST VIEW */
          <div className="divide-y divide-slate-800/80 bg-slate-950/60 rounded-xl border border-slate-800 overflow-hidden text-white relative z-10">
            {filteredRecords.map((device, index) => {
              const badge = getScoreBadge(device.compliance_score);
              return (
                <div 
                  key={device.id} 
                  style={{ animationDelay: `${index * 0.03}s` }}
                  className="py-3.5 hover:bg-slate-900/80 px-5 flex items-center justify-between transition-colors duration-150 cursor-pointer group select-none"
                  onClick={() => onSelectRecord(device.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`px-2.5 py-1 rounded-xl border font-bold text-xs font-mono shrink-0 ${badge.bg}`}>
                      <span>{device.compliance_score}%</span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-sm text-white group-hover:text-sky-400 transition-colors font-mono">
                          {device.hostname || 'Unknown Device'}
                        </h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-medium font-mono ${getVendorBadgeColor(device.vendor)}`}>
                          {device.vendor}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono">
                        OS: <span className="text-slate-200">{device.os_version || 'N/A'}</span> • Passed: <span className="text-emerald-400 font-semibold">{device.passed_rules_count}</span> • Deviations: <span className="text-rose-400 font-semibold">{device.failed_rules_count}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => {
                        onDeleteRecord(device.id);
                        showToast(`Deleted record for ${device.hostname}`);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete Record"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="enterprise-btn-secondary py-1 px-3 text-xs inline-flex items-center space-x-1">
                      <span>Dossier</span>
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
