import React, { useState, useEffect, useRef } from 'react';
import { 
  Network, 
  Zap, 
  ExternalLink, 
  ShieldAlert, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Eye, 
  Crosshair, 
  RefreshCw,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Activity,
  Terminal,
  Copy,
  Check,
  RotateCcw,
  Radio,
  Globe,
  Layers,
  X
} from 'lucide-react';
import CyberGlobe3D from '../components/CyberGlobe3D';

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

interface TopologyMapProps {
  records: DeviceRecord[];
  onSelectRecord: (id: string) => void;
  onTriggerQuickAudit: (type: 'cisco' | 'juniper') => void;
}

interface NodeInterface {
  name: string;
  ip: string;
  status: 'up' | 'down' | 'compromised';
  speed: string;
  mtu: number;
  mac: string;
  acl?: string;
}

interface NodeNeighbor {
  device: string;
  localPort: string;
  remotePort: string;
  protocol: 'CDP' | 'LLDP' | 'BGP';
}

interface TopologyNode {
  id: string;
  name: string;
  ip: string;
  role: 'wan_gateway' | 'firewall' | 'core_switch' | 'dist_switch' | 'access_switch' | 'datacenter' | 'auth_server' | 'rogue_attacker';
  vendor: string;
  model: string;
  score: number;
  status: 'compliant' | 'warning' | 'critical' | 'hostile' | 'isolated';
  traffic: string;
  vlan: string;
  vlanId: number;
  zone: string;
  openPorts: string[];
  vulnerabilities: string[];
  interfaces: NodeInterface[];
  neighbors: NodeNeighbor[];
  remediationCommands: string[];
  x: number;
  y: number;
  lat: number;
  lon: number;
  recordId?: string;
  isMisusing?: boolean;
}

interface TopologyConnection {
  id: string;
  from: string;
  to: string;
  fromPort: string;
  toPort: string;
  media: string;
  speed: string;
  bandwidth: string;
  type: 'normal' | 'secure' | 'hostile' | 'attack' | 'vpn';
  latency: string;
  protocol: string;
  isEncrypted: boolean;
  saturation: number;
}

const TopologyMap: React.FC<TopologyMapProps> = ({ records, onSelectRecord, onTriggerQuickAudit }) => {
  const ciscoRecord = records.find(r => r.vendor.toLowerCase().includes('cisco'));
  const juniperRecord = records.find(r => r.vendor.toLowerCase().includes('juniper'));

  // Realistic Initial Nodes Setup with Authentic Interface Matrices
  const initialNodes: TopologyNode[] = [
    {
      id: 'node-inet',
      name: 'Tier-1 ISP Gateway (WAN)',
      ip: '198.51.100.254/24',
      role: 'wan_gateway',
      vendor: 'Carrier BGP Border Router',
      model: 'Cisco ASR 9904 (IOS-XR)',
      score: 100,
      status: 'compliant',
      traffic: '4.8 Gbps Inbound',
      vlan: 'WAN / Public BGP AS64512',
      vlanId: 0,
      zone: 'Zone 0: Perimeter WAN & Ingress',
      openPorts: ['443/HTTPS', '179/BGP'],
      vulnerabilities: ['None (Hardened Carrier Uplink with BGP MD5 Authentication)'],
      interfaces: [
        { name: 'HundredGigE0/0/0/0', ip: '198.51.100.254/24', status: 'up', speed: '100 Gbps', mtu: 9216, mac: '00:1A:2B:AA:01:00' },
        { name: 'TenGigE0/0/0/1', ip: '198.51.100.253/24', status: 'up', speed: '10 Gbps', mtu: 1500, mac: '00:1A:2B:AA:01:01', acl: 'BGP_BORDER_FILTER' }
      ],
      neighbors: [
        { device: 'edge-router-juniper', localPort: 'TenGigE0/0/0/1', remotePort: 'ge-0/0/0', protocol: 'BGP' }
      ],
      remediationCommands: [
        '! Carrier edge is already hardened to CIS Level 2 standard',
        'show bgp summary',
        'show interfaces TenGigE0/0/0/1 brief'
      ],
      x: 600,
      y: 75,
      lat: 56,
      lon: 0
    },
    {
      id: 'node-juniper',
      name: juniperRecord ? juniperRecord.hostname : 'edge-router-juniper',
      ip: '198.51.100.1 (Perimeter Gateway)',
      role: 'firewall',
      vendor: 'Juniper Networks',
      model: 'JunOS SRX-345 Services Gateway',
      score: juniperRecord ? juniperRecord.compliance_score : 13.3,
      status: juniperRecord ? (juniperRecord.compliance_score >= 80 ? 'compliant' : juniperRecord.compliance_score >= 50 ? 'warning' : 'critical') : 'critical',
      traffic: '2.4 Gbps DPI Inspection',
      vlan: 'VLAN 100 (Perimeter DMZ)',
      vlanId: 100,
      zone: 'Zone 1: DMZ & Security Perimeter',
      openPorts: ['22/SSH (v1 active)', '80/HTTP (insecure)', '161/SNMP (v1/v2c)'],
      vulnerabilities: [
        'SSH Protocol v1 Enabled (Protocol Downgrade Attack Vector)',
        'Insecure HTTP Web-Management Service Active',
        'Default SNMP Community "public" readable without ACL restriction'
      ],
      interfaces: [
        { name: 'ge-0/0/0', ip: '198.51.100.1/24', status: 'up', speed: '1 Gbps', mtu: 1500, mac: '00:05:85:12:34:56' },
        { name: 'ge-0/0/1', ip: '10.0.0.2/24', status: 'up', speed: '1 Gbps', mtu: 1500, mac: '00:05:85:12:34:57' },
        { name: 'ge-0/0/2', ip: '10.10.1.254/24', status: 'up', speed: '1 Gbps', mtu: 1500, mac: '00:05:85:12:34:58' }
      ],
      neighbors: [
        { device: 'Tier-1 ISP Gateway (WAN)', localPort: 'ge-0/0/0', remotePort: 'TenGigE0/0/0/1', protocol: 'BGP' },
        { device: 'core-switch-cisco', localPort: 'ge-0/0/1', remotePort: 'TenGigE1/0/1', protocol: 'LLDP' }
      ],
      remediationCommands: [
        'set system services ssh protocol-version v2',
        'delete system services web-management http',
        'set system services web-management https system-generated-certificate',
        'delete snmp community public',
        'set snmp v3 usm local-engine user secadmin authentication-sha',
        'commit comment "AEGIS Automated Compliance Hardening"'
      ],
      x: 600,
      y: 205,
      lat: 32,
      lon: -15,
      recordId: juniperRecord ? juniperRecord.id : undefined
    },
    {
      id: 'node-cisco',
      name: ciscoRecord ? ciscoRecord.hostname : 'core-switch-cisco',
      ip: '10.0.0.1 (Core Backbone)',
      role: 'core_switch',
      vendor: 'Cisco Systems',
      model: 'Cisco Catalyst 9500 (IOS-XE)',
      score: ciscoRecord ? ciscoRecord.compliance_score : 26.7,
      status: ciscoRecord ? (ciscoRecord.compliance_score >= 80 ? 'compliant' : ciscoRecord.compliance_score >= 50 ? 'warning' : 'critical') : 'critical',
      traffic: '10.2 Gbps Core Backbone',
      vlan: 'VLAN 1 (Management Backbone)',
      vlanId: 1,
      zone: 'Zone 2: Campus Core Backbone',
      openPorts: ['23/Telnet (Misused by Adversary)', '22/SSH (v1)', '80/HTTP', '161/SNMP'],
      vulnerabilities: [
        'Telnet Server Active on VTY Lines (Credentials Transmitted in Cleartext)',
        'Global Password Encryption Inactive (Passwords Stored in Plaintext)',
        'Console & VTY Exec-Timeout set to 0 (Infinite Unattended Administrative Session)',
        'Insecure HTTP Server Enabled on Management Port'
      ],
      interfaces: [
        { name: 'TenGigE1/0/1', ip: '10.0.0.1/24', status: 'up', speed: '10 Gbps', mtu: 1500, mac: '00:1E:F7:88:99:01' },
        { name: 'TenGigE1/0/2', ip: '10.0.1.1/24', status: 'up', speed: '10 Gbps', mtu: 1500, mac: '00:1E:F7:88:99:02' },
        { name: 'TenGigE1/0/3', ip: '10.20.1.254/24', status: 'up', speed: '10 Gbps', mtu: 1500, mac: '00:1E:F7:88:99:03' },
        { name: 'HundredGigE1/0/48', ip: '10.100.0.254/24', status: 'up', speed: '100 Gbps', mtu: 9216, mac: '00:1E:F7:88:99:48' }
      ],
      neighbors: [
        { device: 'edge-router-juniper', localPort: 'TenGigE1/0/1', remotePort: 'ge-0/0/1', protocol: 'CDP' },
        { device: 'dist-switch-cisco-01', localPort: 'TenGigE1/0/2', remotePort: 'TenGigE1/0/24', protocol: 'CDP' },
        { device: 'internal-access-arista', localPort: 'TenGigE1/0/3', remotePort: 'Ethernet48/1', protocol: 'CDP' },
        { device: 'secure-datacenter-sonic', localPort: 'HundredGigE1/0/48', remotePort: 'Ethernet1/1', protocol: 'LLDP' }
      ],
      remediationCommands: [
        'configure terminal',
        'service password-encryption',
        'ip ssh version 2',
        'no ip http server',
        'ip http secure-server',
        'line vty 0 15',
        ' transport input ssh',
        ' exec-timeout 10 0',
        'end',
        'write memory'
      ],
      x: 600,
      y: 365,
      lat: 6,
      lon: 0,
      recordId: ciscoRecord ? ciscoRecord.id : undefined
    },
    {
      id: 'node-dist-cisco',
      name: 'dist-switch-cisco-01',
      ip: '10.0.1.1 (Aggregated Distribution)',
      role: 'dist_switch',
      vendor: 'Cisco Systems',
      model: 'Cisco Catalyst 9300-48P',
      score: 85.0,
      status: 'compliant',
      traffic: '3.6 Gbps LAN Trunk',
      vlan: 'VLAN 10, 20, 30',
      vlanId: 10,
      zone: 'Zone 3: Distribution & Campus Edge',
      openPorts: ['22/SSH (v2)', '443/HTTPS'],
      vulnerabilities: ['Minor: SNMP Read-Only string not strictly restricted by Access Control List'],
      interfaces: [
        { name: 'TenGigE1/0/24', ip: '10.0.1.2/24', status: 'up', speed: '10 Gbps', mtu: 1500, mac: '00:1E:F7:55:44:24' },
        { name: 'GigabitEthernet1/0/1', ip: '10.10.1.1/24', status: 'up', speed: '1 Gbps', mtu: 1500, mac: '00:1E:F7:55:44:01' }
      ],
      neighbors: [
        { device: 'core-switch-cisco', localPort: 'TenGigE1/0/24', remotePort: 'TenGigE1/0/2', protocol: 'CDP' },
        { device: 'branch-srx-juniper-300', localPort: 'GigabitEthernet1/0/1', remotePort: 'ge-0/0/0', protocol: 'LLDP' }
      ],
      remediationCommands: [
        'configure terminal',
        'ip access-list standard SNMP_ACCESS',
        ' permit 10.0.0.50',
        'snmp-server community <SECURE_STRING> RO SNMP_ACCESS',
        'end'
      ],
      x: 240,
      y: 520,
      lat: -22,
      lon: -48
    },
    {
      id: 'node-branch-juniper',
      name: 'branch-srx-juniper-300',
      ip: '10.10.1.1 (Branch Office VPN)',
      role: 'firewall',
      vendor: 'Juniper Networks',
      model: 'JunOS SRX-300 Remote Gateway',
      score: 78.0,
      status: 'warning',
      traffic: '850 Mbps IPsec Tunnel',
      vlan: 'VLAN 50 (Branch Office)',
      vlanId: 50,
      zone: 'Zone 4: Remote Branch Office',
      openPorts: ['500/IKE', '4500/NAT-T', '22/SSH'],
      vulnerabilities: ['Administrative session idle-timeout set to 30 minutes (recommended: <= 10 minutes)'],
      interfaces: [
        { name: 'ge-0/0/0', ip: '10.10.1.2/24', status: 'up', speed: '1 Gbps', mtu: 1500, mac: '00:05:85:99:88:00' },
        { name: 'ipsec-vpn0', ip: '10.10.50.1/24', status: 'up', speed: '850 Mbps', mtu: 1420, mac: 'N/A (Virtual Tunnel)' }
      ],
      neighbors: [
        { device: 'dist-switch-cisco-01', localPort: 'ge-0/0/0', remotePort: 'GigabitEthernet1/0/1', protocol: 'LLDP' }
      ],
      remediationCommands: [
        'set system login idle-timeout 10',
        'commit comment "Harden Branch SRX Idle-Timeout"'
      ],
      x: 120,
      y: 660,
      lat: 8,
      lon: -96
    },
    {
      id: 'node-arista',
      name: 'internal-access-arista',
      ip: '10.20.1.1 (Corporate LAN Switch)',
      role: 'access_switch',
      vendor: 'Arista Networks',
      model: 'Arista EOS 7050SX-64',
      score: 62.0,
      status: 'warning',
      traffic: '1.8 Gbps Access Ports',
      vlan: 'VLAN 20 (Workstations & Ports)',
      vlanId: 20,
      zone: 'Zone 5: Internal User Access LAN',
      openPorts: ['22/SSH', '443/HTTPS'],
      vulnerabilities: [
        'Port Security Sticky MAC not enforced on Port FastEthernet0/12',
        'DHCP Snooping inactive (vulnerable to rogue rogue DHCP server injection)'
      ],
      interfaces: [
        { name: 'Ethernet48/1', ip: '10.20.1.1/24', status: 'up', speed: '10 Gbps', mtu: 1500, mac: '00:1C:73:22:33:48' },
        { name: 'FastEthernet0/12', ip: '10.20.1.199 (Rogue Attached)', status: 'compromised', speed: '100 Mbps', mtu: 1500, mac: '00:1C:73:22:33:12' }
      ],
      neighbors: [
        { device: 'core-switch-cisco', localPort: 'Ethernet48/1', remotePort: 'TenGigE1/0/3', protocol: 'LLDP' },
        { device: 'rogue-intruder-kali', localPort: 'FastEthernet0/12', remotePort: 'eth0', protocol: 'LLDP' }
      ],
      remediationCommands: [
        'enable',
        'configure',
        'interface FastEthernet0/12',
        ' switchport port-security',
        ' switchport port-security maximum 1',
        ' switchport port-security violation shutdown',
        ' switchport port-security mac-address sticky',
        'ip dhcp snooping',
        'ip dhcp snooping vlan 20',
        'write memory'
      ],
      x: 960,
      y: 520,
      lat: -16,
      lon: 54
    },
    {
      id: 'node-datacenter',
      name: 'secure-datacenter-sonic',
      ip: '10.100.0.1 (Cloud Spine Switch)',
      role: 'datacenter',
      vendor: 'Open Networking / SONiC',
      model: 'SONiC Enterprise Spine 32x100G',
      score: 94.0,
      status: 'compliant',
      traffic: '28.4 Gbps High-Performance Spine',
      vlan: 'VLAN 1000 (Protected Compute)',
      vlanId: 1000,
      zone: 'Zone 6: Protected Cloud Datacenter',
      openPorts: ['22/SSH (Key-Auth Only)', '8080/gRPC Telemetry'],
      vulnerabilities: ['None (Hardened Zero-Trust Spine Architecture)'],
      interfaces: [
        { name: 'Ethernet1/1', ip: '10.100.0.1/24', status: 'up', speed: '100 Gbps', mtu: 9216, mac: '52:54:00:12:34:56' },
        { name: 'Ethernet1/32', ip: '10.100.0.49/24', status: 'up', speed: '100 Gbps', mtu: 9216, mac: '52:54:00:12:34:78' }
      ],
      neighbors: [
        { device: 'core-switch-cisco', localPort: 'Ethernet1/1', remotePort: 'HundredGigE1/0/48', protocol: 'LLDP' },
        { device: 'db-auth-vault-srv', localPort: 'Ethernet1/32', remotePort: 'bond0', protocol: 'LLDP' }
      ],
      remediationCommands: [
        '# Datacenter spine complies with Zero-Trust architecture',
        'sonic-cli -c "show interface status"',
        'sonic-cli -c "show ip bgp summary"'
      ],
      x: 460,
      y: 660,
      lat: -46,
      lon: -14
    },
    {
      id: 'node-auth-vault',
      name: 'db-auth-vault-srv',
      ip: '10.100.0.50 (Active Directory & DB)',
      role: 'auth_server',
      vendor: 'Enterprise Secure Linux',
      model: 'Air-Gapped Zero-Trust Enclave',
      score: 98.0,
      status: 'compliant',
      traffic: '920 Mbps Encrypted TLS',
      vlan: 'VLAN 1000 (Tier-0 Vault)',
      vlanId: 1000,
      zone: 'Zone 6: Protected Cloud Datacenter',
      openPorts: ['88/Kerberos', '636/LDAPS', '5432/PostgreSQL-TLS'],
      vulnerabilities: ['None (Air-Gapped Tier-0 Identity Enclave with Strict mTLS)'],
      interfaces: [
        { name: 'bond0 (Dual 25G)', ip: '10.100.0.50/24', status: 'up', speed: '50 Gbps', mtu: 9216, mac: '00:50:56:A1:B2:C3' }
      ],
      neighbors: [
        { device: 'secure-datacenter-sonic', localPort: 'bond0', remotePort: 'Ethernet1/32', protocol: 'LLDP' }
      ],
      remediationCommands: [
        'sudo ufw status verbose',
        'openssl s_client -connect 10.100.0.50:636 -showcerts'
      ],
      x: 740,
      y: 660,
      lat: -52,
      lon: 36
    },
    {
      id: 'node-rogue-attacker',
      name: '🚨 rogue-intruder-kali',
      ip: '10.20.1.199 (Spoofed MAC/IP)',
      role: 'rogue_attacker',
      vendor: 'Unauthorized Hardware (Kali Linux)',
      model: 'Adversary Hardware Tap / ARP Poisoner',
      score: 0,
      status: 'hostile',
      traffic: '84 Mbps Brute-Force Stream',
      vlan: 'VLAN 20 (Compromised Port Fa0/12)',
      vlanId: 20,
      zone: 'Zone 5: Internal User Access LAN',
      openPorts: ['4444/Metasploit', '22/SSH-Crack', '23/Telnet-Sniff'],
      vulnerabilities: [
        'ROGUE HOST: Connected into open unauthenticated port Fa0/12 on internal-access-arista',
        'ACTIVE EXPLOITATION: Sending continuous unencrypted Telnet authentication brute-force attempts to core-switch-cisco:23',
        'SNMP HARVESTING: Querying default "public" community string to scrape core routing tables'
      ],
      interfaces: [
        { name: 'eth0', ip: '10.20.1.199/24', status: 'compromised', speed: '100 Mbps', mtu: 1500, mac: '00:0C:29:DE:AD:BE' }
      ],
      neighbors: [
        { device: 'internal-access-arista', localPort: 'eth0', remotePort: 'FastEthernet0/12', protocol: 'LLDP' }
      ],
      remediationCommands: [
        '! Sever port immediately to quarantine attacker host:',
        'conf t',
        'interface FastEthernet0/12',
        ' shutdown',
        ' description QUARANTINED_BY_AEGIS_ROGUE_DETECTION',
        'end'
      ],
      x: 1080,
      y: 365,
      lat: 18,
      lon: 98,
      isMisusing: true
    }
  ];

  const connections: TopologyConnection[] = [
    { 
      id: 'conn-inet-juniper', 
      from: 'node-inet', 
      to: 'node-juniper', 
      fromPort: 'TenGigE0/0/0/1', 
      toPort: 'ge-0/0/0', 
      media: 'Single-Mode 10G Fiber (1310nm)', 
      speed: '10 Gbps', 
      bandwidth: '4.8 Gbps', 
      type: 'normal', 
      latency: '1.2ms', 
      protocol: 'BGP / OSPF', 
      isEncrypted: false,
      saturation: 48
    },
    { 
      id: 'conn-juniper-cisco', 
      from: 'node-juniper', 
      to: 'node-cisco', 
      fromPort: 'ge-0/0/1', 
      toPort: 'TenGigE1/0/1', 
      media: 'OM4 Multi-Mode Fiber (850nm)', 
      speed: '10 Gbps', 
      bandwidth: '2.4 Gbps', 
      type: 'normal', 
      latency: '0.4ms', 
      protocol: '802.1Q Native VLAN 1', 
      isEncrypted: false,
      saturation: 24
    },
    { 
      id: 'conn-cisco-dist', 
      from: 'node-cisco', 
      to: 'node-dist-cisco', 
      fromPort: 'TenGigE1/0/2', 
      toPort: 'TenGigE1/0/24', 
      media: 'Direct Attach Copper (DAC)', 
      speed: '10 Gbps', 
      bandwidth: '3.6 Gbps', 
      type: 'normal', 
      latency: '0.2ms', 
      protocol: 'LACP Port-Channel 1', 
      isEncrypted: false,
      saturation: 36
    },
    { 
      id: 'conn-dist-branch', 
      from: 'node-dist-cisco', 
      to: 'node-branch-juniper', 
      fromPort: 'GigabitEthernet1/0/1', 
      toPort: 'ge-0/0/0', 
      media: 'Site-to-Site Encrypted IPsec', 
      speed: '1 Gbps', 
      bandwidth: '850 Mbps', 
      type: 'vpn', 
      latency: '14.2ms', 
      protocol: 'IPsec AES-256-GCM', 
      isEncrypted: true,
      saturation: 85
    },
    { 
      id: 'conn-cisco-arista', 
      from: 'node-cisco', 
      to: 'node-arista', 
      fromPort: 'TenGigE1/0/3', 
      toPort: 'Ethernet48/1', 
      media: 'OM4 Multi-Mode Fiber', 
      speed: '10 Gbps', 
      bandwidth: '1.8 Gbps', 
      type: 'normal', 
      latency: '0.3ms', 
      protocol: '802.1Q Trunk (VLAN 20)', 
      isEncrypted: false,
      saturation: 18
    },
    { 
      id: 'conn-cisco-dc', 
      from: 'node-cisco', 
      to: 'node-datacenter', 
      fromPort: 'HundredGigE1/0/48', 
      toPort: 'Ethernet1/1', 
      media: '100G MPO-12 Fiber Breakout', 
      speed: '100 Gbps', 
      bandwidth: '28.4 Gbps', 
      type: 'secure', 
      latency: '0.1ms', 
      protocol: 'EVPN-VXLAN Spine/Leaf', 
      isEncrypted: true,
      saturation: 28
    },
    { 
      id: 'conn-dc-vault', 
      from: 'node-datacenter', 
      to: 'node-auth-vault', 
      fromPort: 'Ethernet1/32', 
      toPort: 'bond0', 
      media: 'Twinax 50G Direct Cable', 
      speed: '50 Gbps', 
      bandwidth: '920 Mbps', 
      type: 'secure', 
      latency: '0.08ms', 
      protocol: 'mTLS 1.3 Air-Gapped', 
      isEncrypted: true,
      saturation: 2
    },
    { 
      id: 'conn-arista-rogue', 
      from: 'node-arista', 
      to: 'node-rogue-attacker', 
      fromPort: 'FastEthernet0/12', 
      toPort: 'eth0', 
      media: 'Cat6 Unshielded Twisted Pair', 
      speed: '100 Mbps', 
      bandwidth: '84 Mbps', 
      type: 'hostile', 
      latency: '0.9ms', 
      protocol: 'Unauthenticated Port Violation', 
      isEncrypted: false,
      saturation: 84
    },
    { 
      id: 'conn-rogue-cisco-exploit', 
      from: 'node-rogue-attacker', 
      to: 'node-cisco', 
      fromPort: '4444/Meta', 
      toPort: '23/Telnet', 
      media: '⚡ Active Exploitation Stream', 
      speed: '100 Mbps', 
      bandwidth: '84 Mbps Brute-Force', 
      type: 'attack', 
      latency: '1.8ms', 
      protocol: 'Telnet Brute-Force & SNMP Scraping', 
      isEncrypted: false,
      saturation: 84
    }
  ];

  // State Management
  const [nodes, setNodes] = useState<TopologyNode[]>(initialNodes);
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<TopologyConnection | null>(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'node' | 'interfaces' | 'remediation'>('node');
  const [displayMode, setDisplayMode] = useState<'3d_globe' | '2d_blueprint'>('3d_globe');
  
  const [viewMode, setViewMode] = useState<'all' | 'threats' | 'heatmap' | 'vlans'>('all');
  const [isSimulatingPackets, setIsSimulatingPackets] = useState(false);
  const [showPortLabels, setShowPortLabels] = useState(false);
  const [showBandwidthPills, setShowBandwidthPills] = useState(false);
  
  const [isScanning, setIsScanning] = useState(false);
  const [isRogueIsolated, setIsRogueIsolated] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [copiedCli, setCopiedCli] = useState(false);

  // Pan & Zoom Engine
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement | null>(null);

  const threatAlerts = [
    "🚨 CRITICAL: Adversary [10.20.1.199] misusing Port 23 (Telnet) on core-switch-cisco with brute-force dictionary",
    "⚠️ HIGH: Plaintext SNMP community 'public' queried 142 times in 60s from unauthenticated VLAN 20",
    "🛡️ ZERO-TRUST DEVIATION: SSH v1 protocol negotiation detected on edge-router-juniper",
    "🔍 INTRUSION RADAR: Unauthorized sticky MAC violation on internal-access-arista Port Fa0/12"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % threatAlerts.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [threatAlerts.length]);

  // Keep selected node updated if nodes change
  useEffect(() => {
    if (selectedNode) {
      const fresh = nodes.find(n => n.id === selectedNode.id);
      if (fresh) setSelectedNode(fresh);
    }
  }, [nodes]);

  // Handle live scanning probe
  const [scanCompleteNotice, setScanCompleteNotice] = useState(false);

  const handleScanAnimation = () => {
    setIsScanning(true);
    setScanCompleteNotice(false);
    setTimeout(() => {
      setIsScanning(false);
      setScanCompleteNotice(true);
      setTimeout(() => {
        setScanCompleteNotice(false);
      }, 2500);
    }, 2400);
  };

  // Rogue Host Isolation Controls
  const handleIsolateRogue = () => {
    setIsRogueIsolated(true);
    setNodes(prev => prev.map(n => {
      if (n.id === 'node-rogue-attacker') {
        return {
          ...n,
          name: 'rogue-attacker [ISOLATED]',
          status: 'isolated',
          traffic: '0 bps (Port Quarantined)',
          isMisusing: false
        };
      }
      if (n.id === 'node-arista') {
        return {
          ...n,
          interfaces: n.interfaces.map(i => i.name === 'FastEthernet0/12' ? { ...i, status: 'down' } : i)
        };
      }
      return n;
    }));
  };

  const handleReinstateRogue = () => {
    setIsRogueIsolated(false);
    setNodes(prev => prev.map(n => {
      if (n.id === 'node-rogue-attacker') {
        return {
          ...n,
          name: '🚨 rogue-intruder-kali',
          status: 'hostile',
          traffic: '84 Mbps Brute-Force Stream',
          isMisusing: true
        };
      }
      if (n.id === 'node-arista') {
        return {
          ...n,
          interfaces: n.interfaces.map(i => i.name === 'FastEthernet0/12' ? { ...i, status: 'compromised' } : i)
        };
      }
      return n;
    }));
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    // Handle Canvas Pan Dragging
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Click on canvas background deselects or begins pan
    if (e.target === svgRef.current || (e.target as HTMLElement).tagName === 'rect') {
      setSelectedNode(null);
      setSelectedConnection(null);
      setIsPanning(true);
      setPanStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y
      });
    }
  };

  const handleCopyRemediation = (cmds: string[]) => {
    navigator.clipboard.writeText(cmds.join('\n'));
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(null as any), 2500);
  };

  const handleResetLayout = () => {
    setNodes(initialNodes);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const filteredNodes = nodes.filter(n => {
    if (viewMode === 'threats') {
      return n.status === 'critical' || n.status === 'hostile' || n.status === 'warning';
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in-up pb-12">
      
      {/* 🚨 REAL-TIME THREAT TELEMETRY BANNER */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-950 via-rose-950/40 to-slate-950 border border-rose-500/40 p-4 shadow-[0_0_30px_rgba(244,63,94,0.2)] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.5)] flex items-center justify-center text-rose-400 shrink-0 animate-pulse">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-3xs font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40">
                ACTIVE INTRUSION DETECTED
              </span>
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              <span className="text-3xs text-slate-400 font-mono hidden sm:inline">• Port Fa0/12 Compromised</span>
            </div>
            <p className="text-xs text-slate-200 font-mono mt-1 font-semibold">
              {threatAlerts[tickerIndex]}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {!isRogueIsolated ? (
            <button
              onClick={handleIsolateRogue}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-[0_0_20px_rgba(244,63,94,0.6)] cursor-pointer flex items-center space-x-1.5 active:scale-95"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Quarantine Port Fa0/12</span>
            </button>
          ) : (
            <button
              onClick={handleReinstateRogue}
              className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.5)] cursor-pointer flex items-center space-x-1.5 active:scale-95"
            >
              <Unlock className="h-3.5 w-3.5" />
              <span>Host Isolated (Unquarantine)</span>
            </button>
          )}
        </div>
      </div>

      {/* 🧭 TOPOLOGY CONTROLS & STATS TOOLBAR */}
      <div className="topology-panel p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center space-x-2">
                <span>Enterprise Live Topology & Cable Forensics</span>
              </h1>
              <p className="text-2xs sm:text-xs text-slate-400">
                Real-time physical network infrastructure model with port interfaces, cable telemetry, and security posture monitoring.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Layer Switches */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* 🌐 3D Earth Globe vs 2D Blueprint Switcher */}
          <div className="flex items-center space-x-1 bg-slate-950/90 p-1 rounded-xl border border-sky-500/40 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
            <button
              onClick={() => setDisplayMode('3d_globe')}
              className={`px-3 py-1 rounded-lg text-2xs font-extrabold cursor-pointer flex items-center space-x-1.5 transition-all ${
                displayMode === '3d_globe'
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-400 text-slate-950 font-black shadow-[0_0_14px_rgba(16,185,129,0.6)]'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="3D Tactical Cyber Globe with Curvy Great-Circle Arcs and Sonar Radar"
            >
              <Globe className={`h-3.5 w-3.5 ${displayMode === '3d_globe' ? 'animate-spin' : ''}`} style={{ animationDuration: '10s' }} />
              <span>3D Tactical Globe</span>
            </button>
            <button
              onClick={() => setDisplayMode('2d_blueprint')}
              className={`px-3 py-1 rounded-lg text-2xs font-extrabold cursor-pointer flex items-center space-x-1.5 transition-all ${
                displayMode === '2d_blueprint'
                  ? 'bg-slate-800 text-white font-black shadow-inner'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Traditional 2D Physical Subnet Layout"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>2D Blueprint</span>
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center space-x-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1 rounded-lg text-2xs font-extrabold cursor-pointer ${
                viewMode === 'all' 
                  ? 'bg-sky-500 text-slate-950 font-black shadow-[0_0_12px_rgba(56,189,248,0.5)]' 
                  : 'text-slate-400'
              }`}
            >
              All Nodes ({nodes.length})
            </button>
            <button
              onClick={() => setViewMode('threats')}
              className={`px-3 py-1 rounded-lg text-2xs font-extrabold cursor-pointer flex items-center space-x-1 ${
                viewMode === 'threats' 
                  ? 'bg-rose-600 text-white font-black shadow-[0_0_12px_rgba(244,63,94,0.5)]' 
                  : 'text-slate-400'
              }`}
            >
              <Crosshair className="h-3 w-3" />
              <span>Threats Only</span>
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              className={`px-3 py-1 rounded-lg text-2xs font-extrabold cursor-pointer ${
                viewMode === 'heatmap' 
                  ? 'bg-purple-600 text-white font-black shadow-[0_0_12px_rgba(192,132,252,0.5)]' 
                  : 'text-slate-400'
              }`}
            >
              Posture Heatmap
            </button>
            <button
              onClick={() => setViewMode('vlans')}
              className={`px-3 py-1 rounded-lg text-2xs font-extrabold cursor-pointer ${
                viewMode === 'vlans' 
                  ? 'bg-emerald-600 text-white font-black shadow-[0_0_12px_rgba(16,185,129,0.5)]' 
                  : 'text-slate-400'
              }`}
            >
              VLAN Subnets
            </button>
          </div>

          {/* Feature Toggles */}
          <div className="flex items-center space-x-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-3xs font-mono font-bold">
            <button
              onClick={() => setShowPortLabels(!showPortLabels)}
              className={`px-2 py-1 rounded-lg cursor-pointer ${
                showPortLabels ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'text-slate-400'
              }`}
              title="Toggle port interface names on links"
            >
              Ports: {showPortLabels ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => setShowBandwidthPills(!showBandwidthPills)}
              className={`px-2 py-1 rounded-lg cursor-pointer ${
                showBandwidthPills ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'text-slate-400'
              }`}
              title="Toggle line speed & throughput badges"
            >
              Speeds: {showBandwidthPills ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => setIsSimulatingPackets(!isSimulatingPackets)}
              className={`px-2 py-1 rounded-lg cursor-pointer flex items-center space-x-1 ${
                isSimulatingPackets ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400'
              }`}
              title="Toggle animated live packet simulation"
            >
              {isSimulatingPackets ? <Play className="h-2.5 w-2.5 text-emerald-400" /> : <Pause className="h-2.5 w-2.5 text-slate-400" />}
              <span>Packets</span>
            </button>
          </div>

          {/* Reset Layout */}
          <button
            onClick={handleResetLayout}
            className="p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 cursor-pointer"
            title="Reset positions and zoom"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          {/* Probing Trigger */}
          <button
            onClick={handleScanAnimation}
            disabled={isScanning}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono flex items-center space-x-2 cursor-pointer border transition-colors ${
              isScanning 
                ? 'bg-cyan-950 text-cyan-300 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.5)]' 
                : 'bg-slate-950 text-sky-300 border-sky-500/40'
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 text-sky-400 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Radar Scanning...' : 'Live Probe'}</span>
          </button>

        </div>
      </div>

      {/* 🗺️ FULL-WIDTH TOPOLOGY CANVAS & FORENSICS LAB */}
      <div className="w-full topology-panel p-5 relative overflow-hidden flex flex-col justify-between select-none">
        
        {/* Top Canvas Status Bar */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-2.5">
          <div className="flex items-center space-x-3 text-3xs font-mono text-slate-400 flex-wrap gap-y-1">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span>Hardened (&gt;=80%)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
              <span>Medium Risk</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse" />
              <span>Critical Risk</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_12px_#dc2626] animate-ping" />
              <span className="text-rose-400 font-bold">Rogue Intrusion</span>
            </span>
          </div>

          {/* Zoom Controls Pill (Active in 2D mode) */}
          {displayMode === '2d_blueprint' ? (
            <div className="flex items-center space-x-1 bg-slate-900/90 px-2 py-0.5 rounded-lg border border-slate-800 text-3xs font-mono text-slate-300">
              <button 
                onClick={() => setZoom(z => Math.max(0.6, z - 0.1))} 
                className="text-slate-400 active:text-cyan-400 p-0.5 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="h-3 w-3" />
              </button>
              <span className="font-bold w-9 text-center">{Math.round(zoom * 100)}%</span>
              <button 
                onClick={() => setZoom(z => Math.min(1.8, z + 0.1))} 
                className="text-slate-400 active:text-cyan-400 p-0.5 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="px-2.5 py-1 rounded-lg bg-sky-950/80 border border-sky-500/40 text-3xs font-mono text-sky-300 flex items-center space-x-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-bold">3D Earth Orbit Active</span>
            </div>
          )}
        </div>

        {/* 🗺️ Canvas Display Area (3D Cyber Globe or 2D Blueprint) */}
        <div className="relative w-full h-[780px] rounded-2xl bg-[#01040a] border border-slate-800/80 overflow-hidden shadow-inner select-none">
          {displayMode === '3d_globe' ? (
            <CyberGlobe3D
              nodes={filteredNodes}
              connections={connections}
              selectedNode={selectedNode}
              selectedConnection={selectedConnection}
              onSelectNode={(node) => {
                if (!node) {
                  setSelectedNode(null);
                } else {
                  const match = nodes.find(n => n.id === node.id);
                  setSelectedNode(match || null);
                }
              }}
              onSelectConnection={(conn) => {
                if (!conn) {
                  setSelectedConnection(null);
                } else {
                  const match = connections.find(c => c.id === conn.id);
                  setSelectedConnection(match || null);
                }
              }}
              isSimulatingPackets={isSimulatingPackets}
              isScanning={isScanning}
              isRogueIsolated={isRogueIsolated}
              viewMode={viewMode}
              showPortLabels={showPortLabels}
              showBandwidthPills={showBandwidthPills}
              className="border-0 rounded-none w-full h-full"
            />
          ) : (
            <div 
              className="relative w-full h-full bg-[#030712] flex items-center justify-center cursor-grab active:cursor-grabbing"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
            >
              <svg 
                ref={svgRef}
                viewBox="0 0 1200 760" 
                className="w-full h-full select-none"
                style={{
                  transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s ease-out'
                }}
              >
            <defs>
              {/* Cyber Grid Pattern */}
              <pattern id="topology-cyber-grid" width="36" height="36" patternUnits="userSpaceOnUse">
                <path d="M 36 0 L 0 0 0 36" fill="none" stroke="rgba(56, 189, 248, 0.03)" strokeWidth="1" />
                <circle cx="0" cy="0" r="1" fill="rgba(56, 189, 248, 0.08)" />
              </pattern>

              {/* Gradients */}
              <linearGradient id="wan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.02" />
              </linearGradient>

              <linearGradient id="core-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#4338ca" stopOpacity="0.02" />
              </linearGradient>

              <linearGradient id="dc-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#047857" stopOpacity="0.02" />
              </linearGradient>

              {/* Laser Sweep Beam Gradient for Radar Scanning */}
              <linearGradient id="probeLaserGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
                <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.06" />
                <stop offset="92%" stopColor="#38bdf8" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.65" />
              </linearGradient>

              {/* Filter for glowing elements */}
              <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Grid Background */}
            <rect width="1200" height="760" fill="url(#topology-cyber-grid)" />

            {/* 🛰️ HIGH-TECH RADAR / LASER SWEEP PROBE ANIMATION */}
            {isScanning && (
              <g className="pointer-events-none">
                {/* Sweeping laser gradient band */}
                <rect x="0" y="0" width="130" height="760" fill="url(#probeLaserGradient)">
                  <animate 
                    attributeName="x" 
                    from="-150" 
                    to="1220" 
                    dur="2.4s" 
                    repeatCount="indefinite" 
                  />
                </rect>
                {/* Luminous leading laser edge */}
                <line x1="130" y1="0" x2="130" y2="760" stroke="#7dd3fc" strokeWidth="2" opacity="0.9" filter="url(#glow-cyan)">
                  <animate 
                    attributeName="x1" 
                    from="-20" 
                    to="1350" 
                    dur="2.4s" 
                    repeatCount="indefinite" 
                  />
                  <animate 
                    attributeName="x2" 
                    from="-20" 
                    to="1350" 
                    dur="2.4s" 
                    repeatCount="indefinite" 
                  />
                </line>
              </g>
            )}

            {/* 🏷️ AUTHENTIC ZONE / SUBNET BLUEPRINT OUTLINES */}
            {/* Zone 0: WAN Border */}
            <rect x="30" y="20" width="1140" height="95" rx="14" fill="rgba(2, 132, 199, 0.02)" stroke="rgba(56, 189, 248, 0.1)" strokeDasharray="4 4" />
            <text x="45" y="40" fill="#38bdf8" fillOpacity="0.6" fontSize="9" fontFamily="monospace" fontWeight="bold" letterSpacing="1">
              ZONE 0: PERIMETER WAN & INGRESS // 198.51.100.0/24 • BGP AS64512
            </text>

            {/* Zone 1: Core Backbone */}
            <rect x="30" y="305" width="900" height="110" rx="14" fill="rgba(99, 102, 241, 0.02)" stroke="rgba(99, 102, 241, 0.1)" strokeDasharray="4 4" />
            <text x="45" y="325" fill="#818cf8" fillOpacity="0.6" fontSize="9" fontFamily="monospace" fontWeight="bold" letterSpacing="1">
              ZONE 1: CAMPUS CORE BACKBONE // 10.0.0.0/24 • VLAN 1 (MGMT)
            </text>

            {/* Zone 2: Campus Distribution & User Access LAN */}
            <rect x="30" y="465" width="1140" height="105" rx="14" fill="rgba(14, 165, 233, 0.015)" stroke="rgba(14, 165, 233, 0.08)" strokeDasharray="4 4" />
            <text x="45" y="485" fill="#38bdf8" fillOpacity="0.6" fontSize="9" fontFamily="monospace" fontWeight="bold" letterSpacing="1">
              ZONE 2: DISTRIBUTION & USER ACCESS LAN // 10.0.1.0/24 & 10.20.1.0/24
            </text>

            {/* Zone 3: Remote Branch Enclave */}
            <rect x="30" y="605" width="220" height="110" rx="14" fill="rgba(168, 85, 247, 0.02)" stroke="rgba(168, 85, 247, 0.1)" strokeDasharray="4 4" />
            <text x="45" y="625" fill="#c084fc" fillOpacity="0.6" fontSize="9" fontFamily="monospace" fontWeight="bold" letterSpacing="1">
              ZONE 3: REMOTE BRANCH
            </text>

            {/* Zone 4: Protected DC & Auth Vault */}
            <rect x="370" y="605" width="460" height="110" rx="14" fill="rgba(16, 185, 129, 0.02)" stroke="rgba(52, 211, 153, 0.1)" strokeDasharray="4 4" />
            <text x="385" y="625" fill="#34d399" fillOpacity="0.6" fontSize="9" fontFamily="monospace" fontWeight="bold" letterSpacing="1">
              ZONE 4: PROTECTED CLOUD DATACENTER & AIR-GAPPED VAULT // 10.100.0.0/24
            </text>

            {/* Adversary Tap Marker */}
            <rect x="990" y="305" width="180" height="110" rx="14" fill="rgba(239, 68, 68, 0.03)" stroke="rgba(239, 68, 68, 0.2)" strokeDasharray="4 4" />
            <text x="1005" y="325" fill="#f87171" fillOpacity="0.75" fontSize="9" fontFamily="monospace" fontWeight="bold">
              ROGUE TAP // VTY EXPLOIT
            </text>

              {/* 🔗 CONNECTION LINKS WITH PHYSICAL INTERFACES & PACKET ANIMATIONS */}
              {connections.map((conn) => {
                const source = nodes.find(n => n.id === conn.from);
                const target = nodes.find(n => n.id === conn.to);
                if (!source || !target) return null;

                const isAttack = conn.type === 'attack';
                const isHostile = conn.type === 'hostile';
                const isVpn = conn.type === 'vpn';
                const isSecure = conn.type === 'secure';
                const isSelectedConn = selectedConnection?.id === conn.id;

                if (isAttack && isRogueIsolated) return null;

                const midX = (source.x + target.x) / 2;
                const midY = (source.y + target.y) / 2;

                // Interface offsets near endpoints
                const srcPortX = source.x + (target.x - source.x) * 0.22;
                const srcPortY = source.y + (target.y - source.y) * 0.22;
                const tgtPortX = target.x - (target.x - source.x) * 0.22;
                const tgtPortY = target.y - (target.y - source.y) * 0.22;

                // Color code line
                let strokeColor = 'rgba(56, 189, 248, 0.45)';
                if (isAttack) strokeColor = 'rgba(239, 68, 68, 0.9)';
                else if (isHostile) strokeColor = 'rgba(245, 158, 11, 0.7)';
                else if (isVpn) strokeColor = 'rgba(168, 85, 247, 0.6)';
                else if (isSecure) strokeColor = 'rgba(52, 211, 153, 0.6)';

                return (
                  <g 
                    key={conn.id} 
                    className="cursor-pointer group"
                    onClick={() => setSelectedConnection(conn)}
                  >
                    {/* Hover target wide line */}
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke="transparent"
                      strokeWidth="16"
                    />

                    {/* Main Cable Line */}
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={strokeColor}
                      strokeWidth={isSelectedConn ? "3.5" : isAttack ? "3" : isScanning ? "2.5" : isSecure ? "2" : "1.8"}
                      strokeDasharray={isAttack ? "6 3" : isVpn ? "6 4" : isScanning ? "5 3" : "none"}
                      filter={isSelectedConn || isScanning ? "url(#glow-cyan)" : undefined}
                    >
                      {isScanning && (
                        <animate
                          attributeName="stroke-dashoffset"
                          from="0"
                          to="-32"
                          dur="0.75s"
                          repeatCount="indefinite"
                        />
                      )}
                    </line>

                    {/* Live Physical Interface Labels */}
                    {showPortLabels && (
                      <>
                        {/* Source Port Badge */}
                        <g transform={`translate(${srcPortX}, ${srcPortY})`}>
                          <rect x="-24" y="-8" width="48" height="13" rx="3" fill="#090d16" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="0.8" />
                          <text x="0" y="1" textAnchor="middle" fill="#94a3b8" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
                            {conn.fromPort}
                          </text>
                        </g>

                        {/* Target Port Badge */}
                        <g transform={`translate(${tgtPortX}, ${tgtPortY})`}>
                          <rect x="-24" y="-8" width="48" height="13" rx="3" fill="#090d16" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="0.8" />
                          <text x="0" y="1" textAnchor="middle" fill="#94a3b8" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
                            {conn.toPort}
                          </text>
                        </g>
                      </>
                    )}

                    {/* Middle Bandwidth & Protocol Pill */}
                    {showBandwidthPills && (
                      <g transform={`translate(${midX}, ${midY})`}>
                        <rect 
                          x={isAttack ? "-48" : "-32"} 
                          y="-7.5" 
                          width={isAttack ? "96" : "64"} 
                          height="14" 
                          rx="4" 
                          fill={isAttack ? "#450a0a" : isHostile ? "#451a03" : "#020617"} 
                          stroke={strokeColor} 
                          strokeWidth="1" 
                        />
                        <text 
                          x="0" 
                          y="2.5" 
                          textAnchor="middle" 
                          fill={isAttack ? "#fca5a5" : isHostile ? "#fcd34d" : "#e2e8f0"} 
                          fontSize="7.5" 
                          fontFamily="monospace" 
                          fontWeight="bold"
                        >
                          {isAttack ? "⚡ TELNET MISUSE" : conn.speed}
                        </text>
                      </g>
                    )}

                    {/* 🟢/🔵 HIGH-TECH FIBER-OPTIC PHOTON PULSES */}
                    {isSimulatingPackets && !isAttack && (
                      <g>
                        {/* Primary forward transmission pulse */}
                        <g>
                          <animateMotion
                            path={`M ${source.x} ${source.y} L ${target.x} ${target.y}`}
                            dur={`${2.0 + (source.x % 3) * 0.4}s`}
                            repeatCount="indefinite"
                          />
                          <circle r="4.5" fill={isSecure ? "#34d399" : isVpn ? "#c084fc" : "#38bdf8"} opacity="0.4" filter="url(#glow-cyan)" />
                          <circle r="2.2" fill="#ffffff" />
                        </g>

                        {/* Reverse ACK return pulse */}
                        <g>
                          <animateMotion
                            path={`M ${target.x} ${target.y} L ${source.x} ${source.y}`}
                            dur={`${2.4 + (target.x % 3) * 0.4}s`}
                            repeatCount="indefinite"
                            begin="0.9s"
                          />
                          <circle r="1.8" fill={isSecure ? "#6ee7b7" : isVpn ? "#d8b4fe" : "#7dd3fc"} opacity="0.85" />
                        </g>
                      </g>
                    )}

                    {/* 🚨 ATTACK EXPLOIT STREAM (RED LIGHT PULSES) */}
                    {isSimulatingPackets && isAttack && !isRogueIsolated && (
                      <g>
                        <g>
                          <animateMotion
                            path={`M ${source.x} ${source.y} L ${target.x} ${target.y}`}
                            dur="0.65s"
                            repeatCount="indefinite"
                          />
                          <circle r="4.5" fill="#ef4444" opacity="0.5" filter="url(#glow-cyan)" />
                          <circle r="2.2" fill="#fee2e2" />
                        </g>
                        <g>
                          <animateMotion
                            path={`M ${source.x} ${source.y} L ${target.x} ${target.y}`}
                            dur="0.65s"
                            repeatCount="indefinite"
                            begin="0.32s"
                          />
                          <circle r="3.5" fill="#f87171" opacity="0.85" />
                        </g>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* 🖥️ AUTHENTIC HIGH-FIDELITY NETWORK NODES */}
              {filteredNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const isRogue = node.role === 'rogue_attacker';
                const isCritical = node.score < 50 && !isRogue;

                let strokeColor = '#34d399';
                let fillColor = '#090d16';

                if (isRogue) {
                  strokeColor = node.status === 'isolated' ? '#64748b' : '#ef4444';
                  fillColor = node.status === 'isolated' ? '#0f172a' : '#2a0808';
                } else if (viewMode === 'heatmap') {
                  strokeColor = node.score >= 80 ? '#34d399' : node.score >= 50 ? '#fbbf24' : '#f43f5e';
                } else if (viewMode === 'vlans') {
                  strokeColor = node.vlanId === 0 ? '#38bdf8' : node.vlanId === 100 ? '#818cf8' : node.vlanId === 1 ? '#6366f1' : node.vlanId === 1000 ? '#34d399' : '#f59e0b';
                } else {
                  strokeColor = node.status === 'compliant' ? '#34d399' : node.status === 'warning' ? '#fbbf24' : '#f43f5e';
                }

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedNode(node);
                      setSelectedConnection(null);
                      setActiveSidebarTab('node');
                    }}
                  >
                    {/* Active Sonar Radar Ping Wave on Node during Scan */}
                    {isScanning && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="22"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        opacity="0.8"
                      >
                        <animate
                          attributeName="r"
                          values="18; 54"
                          dur="1.2s"
                          repeatCount="indefinite"
                          begin={`${(node.x / 1200) * 0.9}s`}
                        />
                        <animate
                          attributeName="opacity"
                          values="0.9; 0"
                          dur="1.2s"
                          repeatCount="indefinite"
                          begin={`${(node.x / 1200) * 0.9}s`}
                        />
                      </circle>
                    )}

                    {/* Glowing pulse aura for rogue attacker or critical nodes */}
                    {isRogue && !isRogueIsolated && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="32"
                        fill="rgba(239, 68, 68, 0.25)"
                        className="animate-ping"
                      />
                    )}

                    {isCritical && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="28"
                        fill="rgba(244, 63, 94, 0.2)"
                        className="animate-pulse"
                      />
                    )}

                    {/* Rotating Selection Ring */}
                    {isSelected && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="28"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                        className="animate-spin"
                        style={{ animationDuration: '8s' }}
                      />
                    )}

                    {/* Outer Chassis Base */}
                    <rect
                      x={node.x - 22}
                      y={node.y - 20}
                      width="44"
                      height="40"
                      rx="10"
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? "3" : "2"}
                      filter={`drop-shadow(0 0 ${isSelected ? '14px' : '6px'} ${strokeColor})`}
                    />

                    {/* Authentic Cisco / Network Vector Glyphs inside Chassis */}
                    {node.role === 'wan_gateway' && (
                      // Cisco Router Circular Cross-Arrows Symbol
                      <g transform={`translate(${node.x}, ${node.y})`}>
                        <circle r="12" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                        <path d="M -6 0 L 6 0 M 3 -3 L 6 0 L 3 3" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
                        <path d="M 6 0 L -6 0 M -3 -3 L -6 0 L -3 3" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
                        <path d="M 0 -6 L 0 6 M -3 3 L 0 6 L 3 3" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
                        <path d="M 0 6 L 0 -6 M -3 -3 L 0 -6 L 3 -3" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
                      </g>
                    )}

                    {(node.role === 'core_switch' || node.role === 'dist_switch') && (
                      // Multi-layer Switch 4-way Arrows
                      <g transform={`translate(${node.x}, ${node.y})`}>
                        <rect x="-10" y="-10" width="20" height="20" rx="3" fill="none" stroke={strokeColor} strokeWidth="1.5" />
                        <path d="M -6 -3 L 6 -3 M 3 -6 L 6 -3 L 3 0" stroke={strokeColor} strokeWidth="1.2" fill="none" />
                        <path d="M 6 3 L -6 3 M -3 0 L -6 3 L -3 6" stroke={strokeColor} strokeWidth="1.2" fill="none" />
                        <circle cx="-5" cy="-6" r="1" fill="#34d399" />
                        <circle cx="5" cy="-6" r="1" fill="#34d399" />
                      </g>
                    )}

                    {node.role === 'firewall' && (
                      // Next-Gen Firewall Shield with Security Core
                      <g transform={`translate(${node.x}, ${node.y})`}>
                        <path d="M 0 -11 L 8 -7 L 8 2 Q 8 9 0 12 Q -8 9 -8 2 L -8 -7 Z" fill="rgba(244, 63, 94, 0.2)" stroke={strokeColor} strokeWidth="1.5" />
                        <circle cx="0" cy="0" r="2.5" fill={strokeColor} />
                      </g>
                    )}

                    {node.role === 'access_switch' && (
                      // 1U Access Switch Port Array
                      <g transform={`translate(${node.x}, ${node.y})`}>
                        <rect x="-12" y="-7" width="24" height="14" rx="2" fill="none" stroke={strokeColor} strokeWidth="1.5" />
                        <circle cx="-7" cy="-2" r="1" fill="#34d399" />
                        <circle cx="-3" cy="-2" r="1" fill="#34d399" />
                        <circle cx="1" cy="-2" r="1" fill="#34d399" />
                        <circle cx="5" cy="-2" r="1" fill="#fbbf24" />
                        <line x1="-10" y1="2" x2="10" y2="2" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="1" />
                      </g>
                    )}

                    {node.role === 'datacenter' && (
                      // Cloud Spine 100G Chassis
                      <g transform={`translate(${node.x}, ${node.y})`}>
                        <rect x="-11" y="-10" width="22" height="6" rx="1.5" fill="none" stroke="#34d399" strokeWidth="1.2" />
                        <rect x="-11" y="-2" width="22" height="6" rx="1.5" fill="none" stroke="#34d399" strokeWidth="1.2" />
                        <rect x="-11" y="6" width="22" height="6" rx="1.5" fill="none" stroke="#34d399" strokeWidth="1.2" />
                        <circle cx="7" cy="-7" r="1" fill="#38bdf8" />
                        <circle cx="7" cy="1" r="1" fill="#38bdf8" />
                        <circle cx="7" cy="9" r="1" fill="#38bdf8" />
                      </g>
                    )}

                    {node.role === 'auth_server' && (
                      // Tier-0 Vault / Identity Tower
                      <g transform={`translate(${node.x}, ${node.y})`}>
                        <path d="M -7 -10 L 7 -10 L 7 10 L -7 10 Z" fill="none" stroke="#34d399" strokeWidth="1.5" />
                        <line x1="-7" y1="-3" x2="7" y2="-3" stroke="#34d399" strokeWidth="1" />
                        <line x1="-7" y1="3" x2="7" y2="3" stroke="#34d399" strokeWidth="1" />
                        <circle cx="0" cy="-6.5" r="1.5" fill="#38bdf8" />
                        <circle cx="0" cy="0" r="1.5" fill="#38bdf8" />
                        <circle cx="0" cy="6.5" r="1.5" fill="#38bdf8" />
                      </g>
                    )}

                    {node.role === 'rogue_attacker' && (
                      // Adversary Terminal Workstation with Red Warning
                      <g transform={`translate(${node.x}, ${node.y})`}>
                        <rect x="-11" y="-9" width="22" height="14" rx="2" fill="none" stroke={strokeColor} strokeWidth="1.5" />
                        <line x1="-6" y1="8" x2="6" y2="8" stroke={strokeColor} strokeWidth="1.5" />
                        <text x="0" y="2" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="900" fontFamily="monospace">
                          {isRogueIsolated ? 'X' : '>_'}
                        </text>
                      </g>
                    )}

                    {/* Hostname Label */}
                    <text
                      x={node.x}
                      y={node.y + 32}
                      textAnchor="middle"
                      fill={isRogue ? '#f87171' : '#f8fafc'}
                      fontSize="10.5"
                      fontWeight="800"
                      fontFamily="'JetBrains Mono', monospace"
                    >
                      {node.name}
                    </text>

                    {/* Subtitle Telemetry Badge */}
                    <text
                      x={node.x}
                      y={node.y + 44}
                      textAnchor="middle"
                      fill={isRogue ? '#fca5a5' : '#94a3b8'}
                      fontSize="8.5"
                      fontFamily="'JetBrains Mono', monospace"
                    >
                      {isRogue 
                        ? (isRogueIsolated ? 'PORT ISOLATED' : 'ACTIVE EXPLOIT') 
                        : `${node.vendor.split(' ')[0]} • ${node.score}%`}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Canvas Bottom-Left Telemetry Radar HUD */}
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-slate-950/85 border border-slate-800 text-3xs font-mono text-slate-400 flex items-center space-x-3 backdrop-blur-md pointer-events-none">
              <div className="flex items-center space-x-1.5 text-cyan-400 font-bold">
                <Radio className="h-3 w-3 animate-spin" />
                <span>NOC Active</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">{nodes.length} Nodes</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">{connections.length} Links</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline text-slate-500">Enterprise Infrastructure Model</span>
            </div>
          </div>
        )}

        {/* 🛰️ Live Probe Radar Progress HUD Banner */}
        {isScanning && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-slate-950/95 border border-cyan-400 text-cyan-300 text-2xs font-mono flex items-center space-x-2.5 shadow-[0_0_30px_rgba(6,182,212,0.5)] pointer-events-none animate-fade-in z-30">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-bold tracking-wider">ACTIVE NOC TELEMETRY AUDIT // SCANNING FIBER TRUNKS</span>
            <span className="text-3xs text-cyan-400/80">• 9/9 NODES ONLINE</span>
          </div>
        )}

        {scanCompleteNotice && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-slate-950/95 border border-emerald-400 text-emerald-300 text-2xs font-mono flex items-center space-x-2 shadow-[0_0_30px_rgba(16,185,129,0.5)] pointer-events-none animate-fade-in z-30">
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-bold tracking-wide">PROBE COMPLETE // ALL 9 HOSTS AUDITED // 0 PACKET DROPS</span>
          </div>
        )}

            {/* 📋 SLIDE-OVER NODE & PHYSICAL LINK INSPECTOR DRAWER */}
            {(selectedNode || selectedConnection) && (
              <div 
                className="absolute top-3 right-3 bottom-3 w-[430px] max-w-[calc(100%-1.5rem)] z-40 bg-slate-950/95 border border-sky-500/40 backdrop-blur-2xl rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.85)] p-5 overflow-y-auto flex flex-col justify-between space-y-4 animate-fade-in text-left"
                onMouseDown={(e) => e.stopPropagation()}
              >
                {/* Node Selected View */}
                {selectedNode && !selectedConnection ? (
                  <div className="space-y-4">
                    
                    {/* Header with Title & Close button */}
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                      <span className="text-xs uppercase font-mono font-extrabold text-sky-400 bg-sky-950/80 px-2.5 py-1 rounded border border-sky-500/30 flex items-center space-x-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        <span>Node Inspector</span>
                      </span>

                      <div className="flex items-center space-x-2">
                        <span className={`text-3xs font-mono font-black uppercase px-2 py-0.5 rounded border ${
                          selectedNode.status === 'compliant' ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' :
                          selectedNode.status === 'warning' ? 'bg-amber-950 text-amber-300 border-amber-500/40' :
                          selectedNode.status === 'isolated' ? 'bg-slate-800 text-slate-300 border-slate-600' :
                          'bg-rose-950 text-rose-300 border-rose-500/50 animate-pulse'
                        }`}>
                          {selectedNode.status.toUpperCase()}
                        </span>
                        <button
                          onClick={() => setSelectedNode(null)}
                          className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                          title="Close Inspector"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Node Title & IP */}
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-white tracking-tight font-mono">
                        {selectedNode.name}
                      </h2>
                      <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                        <span>{selectedNode.ip}</span>
                      </p>
                    </div>

                    {/* Sidebar Tabs (Overview | Interfaces | CLI Remediation) */}
                    <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-3xs font-mono">
                      <button
                        onClick={() => setActiveSidebarTab('node')}
                        className={`flex-1 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          activeSidebarTab === 'node' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Overview
                      </button>
                      <button
                        onClick={() => setActiveSidebarTab('interfaces')}
                        className={`flex-1 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          activeSidebarTab === 'interfaces' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Interfaces ({selectedNode.interfaces.length})
                      </button>
                      <button
                        onClick={() => setActiveSidebarTab('remediation')}
                        className={`flex-1 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          activeSidebarTab === 'remediation' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Remediation
                      </button>
                    </div>

                    {/* TAB 1: OVERVIEW */}
                    {activeSidebarTab === 'node' && (
                      <div className="text-xs font-mono space-y-2.5">
                        {/* Platform & Model */}
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-0.5">
                          <span className="text-3xs text-slate-500 uppercase block">Platform & Model</span>
                          <span className="font-bold text-slate-200 block text-xs">{selectedNode.vendor} — {selectedNode.model}</span>
                        </div>

                        {/* VLAN & Live Traffic */}
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-3xs text-slate-500 uppercase block">VLAN / Zone</span>
                            <span className="font-bold text-slate-300 text-xs">{selectedNode.vlan}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-3xs text-slate-500 uppercase block">Live Throughput</span>
                            <span className="font-bold text-sky-400 text-xs">{selectedNode.traffic}</span>
                          </div>
                        </div>

                        {/* Compliance Gauge */}
                        {selectedNode.role !== 'rogue_attacker' && (
                          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-3xs text-slate-500 uppercase">Compliance Posture</span>
                              <span className={`font-black text-sm ${
                                selectedNode.score >= 80 ? 'text-emerald-400' :
                                selectedNode.score >= 50 ? 'text-amber-400' : 'text-rose-400'
                              }`}>
                                {selectedNode.score}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  selectedNode.score >= 80 ? 'bg-emerald-400' :
                                  selectedNode.score >= 50 ? 'bg-amber-400' : 'bg-rose-500'
                                }`}
                                style={{ width: `${selectedNode.score}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Active Services */}
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                          <span className="text-3xs text-slate-500 uppercase block">Active Network Services & Ports</span>
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {selectedNode.openPorts.map((p, i) => (
                              <span key={i} className={`text-3xs px-2 py-0.5 rounded border ${
                                p.includes('Telnet') || p.includes('Metasploit') || p.includes('v1')
                                  ? 'bg-rose-950 text-rose-300 border-rose-500/50 font-bold'
                                  : 'bg-slate-900 text-slate-300 border-slate-700'
                              }`}>
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Deviations */}
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                          <span className="text-3xs text-rose-400 uppercase font-bold flex items-center space-x-1">
                            <AlertTriangle className="h-3 w-3 text-rose-400" />
                            <span>Security Deviations & Threat Vectors</span>
                          </span>
                          <ul className="space-y-1 text-2xs text-slate-300 font-sans">
                            {selectedNode.vulnerabilities.map((v, i) => (
                              <li key={i} className="flex items-start space-x-1.5">
                                <span className="text-rose-400 mt-0.5">•</span>
                                <span>{v}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: PHYSICAL INTERFACES */}
                    {activeSidebarTab === 'interfaces' && (
                      <div className="space-y-2.5 text-xs font-mono">
                        <span className="text-3xs text-slate-500 uppercase block font-bold">Physical Interface Table & MACs</span>
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                          {selectedNode.interfaces.map((intf, idx) => (
                            <div key={idx} className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-200 text-xs">{intf.name}</span>
                                <span className={`text-3xs font-extrabold px-1.5 py-0.2 rounded uppercase ${
                                  intf.status === 'up' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                                  intf.status === 'compromised' ? 'bg-rose-950 text-rose-300 border border-rose-500/50 animate-pulse' :
                                  'bg-slate-800 text-slate-400'
                                }`}>
                                  {intf.status}
                                </span>
                              </div>
                              <div className="text-3xs text-slate-400 flex items-center justify-between">
                                <span>IP: {intf.ip}</span>
                                <span>Speed: {intf.speed}</span>
                              </div>
                              <div className="text-3xs text-slate-500 flex items-center justify-between font-mono">
                                <span>MAC: {intf.mac}</span>
                                <span>MTU: {intf.mtu}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* CDP Neighbors */}
                        <div className="pt-2 border-t border-slate-800">
                          <span className="text-3xs text-slate-500 uppercase block font-bold mb-1">CDP / LLDP Neighbors</span>
                          {selectedNode.neighbors.map((n, i) => (
                            <div key={i} className="text-3xs text-slate-300 p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                              <span>{n.device} ({n.protocol})</span>
                              <span className="text-cyan-400">{n.localPort} ↔ {n.remotePort}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TAB 3: REMEDIATION CLI */}
                    {activeSidebarTab === 'remediation' && (
                      <div className="space-y-2.5 text-xs font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-3xs text-cyan-400 uppercase font-bold flex items-center space-x-1">
                            <Terminal className="h-3 w-3" />
                            <span>Zero-Trust Hardening CLI Script</span>
                          </span>
                          <button
                            onClick={() => handleCopyRemediation(selectedNode.remediationCommands)}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-3xs font-bold flex items-center space-x-1 cursor-pointer"
                          >
                            {copiedCli ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                            <span>{copiedCli ? 'Copied' : 'Copy CLI'}</span>
                          </button>
                        </div>

                        <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono text-2xs leading-relaxed max-h-72 overflow-y-auto select-all">
                          {selectedNode.remediationCommands.join('\n')}
                        </pre>
                      </div>
                    )}

                    {/* Actions Footer */}
                    <div className="pt-2 space-y-2">
                      {selectedNode.role === 'rogue_attacker' ? (
                        !isRogueIsolated ? (
                          <button
                            onClick={handleIsolateRogue}
                            className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(244,63,94,0.6)] cursor-pointer transition-all active:scale-95"
                          >
                            <Lock className="h-4 w-4" />
                            <span>Sever Port Fa0/12 & Isolate Host</span>
                          </button>
                        ) : (
                          <button
                            onClick={handleReinstateRogue}
                            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-95"
                          >
                            <Unlock className="h-4 w-4" />
                            <span>Unquarantine Port Fa0/12</span>
                          </button>
                        )
                      ) : selectedNode.recordId ? (
                        <button
                          onClick={() => onSelectRecord(selectedNode.recordId!)}
                          className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(56,189,248,0.5)] cursor-pointer transition-all active:scale-95"
                        >
                          <span>View Full AST Audit Dossier</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      ) : selectedNode.name.includes('cisco') ? (
                        <button
                          onClick={() => onTriggerQuickAudit('cisco')}
                          className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(56,189,248,0.5)] cursor-pointer transition-all active:scale-95"
                        >
                          <Zap className="h-3.5 w-3.5" />
                          <span>Scan Cisco Switch Baseline</span>
                        </button>
                      ) : selectedNode.name.includes('juniper') ? (
                        <button
                          onClick={() => onTriggerQuickAudit('juniper')}
                          className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(192,132,252,0.5)] cursor-pointer transition-all active:scale-95"
                        >
                          <Zap className="h-3.5 w-3.5" />
                          <span>Scan Juniper SRX Baseline</span>
                        </button>
                      ) : null}
                    </div>

                  </div>
                ) : selectedConnection ? (
                  /* Physical Link Inspector View */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                      <span className="text-xs uppercase font-mono font-extrabold text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-500/30 flex items-center space-x-1.5">
                        <Activity className="h-3.5 w-3.5" />
                        <span>Physical Link Forensics</span>
                      </span>
                      <button
                        onClick={() => setSelectedConnection(null)}
                        className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                        title="Close Link"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div>
                      <h3 className="text-sm font-black text-white font-mono">
                        {selectedConnection.fromPort} ↔ {selectedConnection.toPort}
                      </h3>
                      <p className="text-2xs text-slate-400 font-mono mt-0.5">
                        {selectedConnection.media}
                      </p>
                    </div>

                    <div className="text-xs font-mono space-y-2.5">
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-3xs text-slate-500 uppercase">Link Protocol</span>
                          <span className="font-bold text-slate-200">{selectedConnection.protocol}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-3xs text-slate-500 uppercase">Line Speed</span>
                          <span className="font-bold text-sky-400">{selectedConnection.speed}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-3xs text-slate-500 uppercase">Throughput</span>
                          <span className="font-bold text-emerald-400">{selectedConnection.bandwidth}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-3xs text-slate-500 uppercase">One-Way Latency</span>
                          <span className="font-bold text-slate-300">{selectedConnection.latency}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                        <span className="text-3xs text-slate-500 uppercase block">Encryption & Security Posture</span>
                        <div className="flex items-center space-x-2 pt-0.5">
                          {selectedConnection.isEncrypted ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-3xs font-bold flex items-center space-x-1">
                              <Lock className="h-3 w-3" />
                              <span>HARDENED ENCRYPTED TRUNK</span>
                            </span>
                          ) : selectedConnection.type === 'attack' ? (
                            <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/50 text-3xs font-bold flex items-center space-x-1 animate-pulse">
                              <AlertTriangle className="h-3 w-3" />
                              <span>EXPLOITATION VECTOR: CLEAR-TEXT TELNET</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 text-3xs font-bold">
                              UNENCRYPTED INTERNAL 802.1Q
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-3xs text-slate-400">
                          <span>Cable Saturation</span>
                          <span className="font-bold text-slate-200">{selectedConnection.saturation}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              selectedConnection.saturation > 80 ? 'bg-rose-500' :
                              selectedConnection.saturation > 50 ? 'bg-amber-400' : 'bg-sky-400'
                            }`}
                            style={{ width: `${selectedConnection.saturation}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="border-t border-slate-800/80 pt-3">
                  <p className="text-3xs font-mono text-slate-500 text-center">
                    AEGIS Zero-Trust Active Telemetry Engine • v2.4
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
  );
};

export default TopologyMap;
