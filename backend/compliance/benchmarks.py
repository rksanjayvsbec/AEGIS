from typing import Dict, Any, List

# Define severity levels
SEVERITY_CRITICAL = "Critical"
SEVERITY_HIGH = "High"
SEVERITY_MEDIUM = "Medium"
SEVERITY_LOW = "Low"

BENCHMARKS = {
    "CIS": [
        {
            "id": "CIS-1.1",
            "name": "Disable Telnet Protocol",
            "description": "Ensure Telnet service is disabled on the device to prevent clear-text transmission of credentials and management traffic.",
            "parameter": "telnet_disabled",
            "operator": "eq",
            "value": True,
            "severity": SEVERITY_CRITICAL,
            "remediation_cisco": "line vty 0 15\n transport input ssh\n! (Removes telnet from VTY inputs)",
            "remediation_juniper": "delete system services telnet"
        },
        {
            "id": "CIS-1.2",
            "name": "Enable SSH Access",
            "description": "Ensure Secure Shell (SSH) is enabled to allow encrypted remote administrative access.",
            "parameter": "ssh_enabled",
            "operator": "eq",
            "value": True,
            "severity": SEVERITY_HIGH,
            "remediation_cisco": "crypto key generate rsa general-keys modulus 2048\n! (Generates RSA keys to trigger SSH server startup)",
            "remediation_juniper": "set system services ssh"
        },
        {
            "id": "CIS-1.3",
            "name": "Enforce SSH Version 2",
            "description": "Configure SSH version 2 to mitigate protocol weaknesses inherent in SSHv1.",
            "parameter": "ssh_version",
            "operator": "eq",
            "value": "2",
            "severity": SEVERITY_HIGH,
            "remediation_cisco": "ip ssh version 2",
            "remediation_juniper": "set system services ssh protocol-version v2"
        },
        {
            "id": "CIS-2.1",
            "name": "Disable HTTP Server",
            "description": "Disable the unencrypted HTTP web administration server to prevent unauthorized configuration sniffing.",
            "parameter": "http_disabled",
            "operator": "eq",
            "value": True,
            "severity": SEVERITY_HIGH,
            "remediation_cisco": "no ip http server",
            "remediation_juniper": "delete system services web-management http"
        },
        {
            "id": "CIS-2.2",
            "name": "Enable HTTPS Server",
            "description": "Ensure HTTPS is enabled if web management is required to encrypt administrative traffic.",
            "parameter": "https_enabled",
            "operator": "eq",
            "value": True,
            "severity": SEVERITY_MEDIUM,
            "remediation_cisco": "ip http secure-server",
            "remediation_juniper": "set system services web-management https system-generated-certificate"
        },
        {
            "id": "CIS-3.1",
            "name": "Enable Service Password Encryption",
            "description": "Encrypt default clear-text passwords in the device configuration file.",
            "parameter": "password_encryption_enabled",
            "operator": "eq",
            "value": True,
            "severity": SEVERITY_HIGH,
            "remediation_cisco": "service password-encryption",
            "remediation_juniper": "set system login plain-text-password-encrypt"
        },
        {
            "id": "CIS-3.2",
            "name": "Set Minimum Password Length",
            "description": "Enforce a minimum password length of 12 characters to prevent brute-force attacks.",
            "parameter": "min_password_length",
            "operator": "gte",
            "value": 12,
            "severity": SEVERITY_MEDIUM,
            "remediation_cisco": "security passwords min-length 12",
            "remediation_juniper": "set system login password minimum-length 12"
        },
        {
            "id": "CIS-4.1",
            "name": "Set Administrative Session Exec Timeout",
            "description": "Configure an inactive session timeout of 10 minutes (600 seconds) or less to protect unattended sessions.",
            "parameter": "exec_timeout_seconds",
            "operator": "lte",
            "value": 600,
            "severity": SEVERITY_MEDIUM,
            "remediation_cisco": "line con 0\n exec-timeout 10 0\nline vty 0 15\n exec-timeout 10 0",
            "remediation_juniper": "set system login user default-class idle-timeout 10"
        }
    ],
    "NIST": [
        {
            "id": "NIST-AC-8",
            "name": "System Use Notification (Banner)",
            "description": "Configure an administrative warning banner displaying unauthorized access warnings before console/remote login.",
            "parameter": "banner_configured",
            "operator": "eq",
            "value": True,
            "severity": SEVERITY_LOW,
            "remediation_cisco": "banner motd ^C\nUNAUTHORIZED ACCESS TO THIS DEVICE IS PROHIBITED AND SUBJECT TO LEGAL ACTION.\n^C",
            "remediation_juniper": "set system login message \"UNAUTHORIZED ACCESS IS PROHIBITED\""
        },
        {
            "id": "NIST-AU-12",
            "name": "System Audit & Logging",
            "description": "Enable remote logging (syslog) to export security events to a centralized security monitoring system.",
            "parameter": "logging_enabled",
            "operator": "eq",
            "value": True,
            "severity": SEVERITY_MEDIUM,
            "remediation_cisco": "logging trap informational\nlogging host 192.168.10.50",
            "remediation_juniper": "set system syslog host 192.168.10.50 any info"
        },
        {
            "id": "NIST-AC-4",
            "name": "Access Control Lists (ACL) / Firewall Filters",
            "description": "Ensure Access Control Lists (ACLs) are configured to restrict traffic flow and enforce boundaries.",
            "parameter": "acl_configured",
            "operator": "eq",
            "value": True,
            "severity": SEVERITY_HIGH,
            "remediation_cisco": "ip access-list extended MANAGEMENT_ACL\n permit tcp 192.168.1.0 0.0.0.255 any eq 22\n deny ip any any",
            "remediation_juniper": "set firewall filter MGMT-FILTER term SSH-Permit from source-address 192.168.1.0/24"
        }
    ],
    "STIG": [
        {
            "id": "STIG-NET-001",
            "name": "Secure SNMP Configuration",
            "description": "Restrict SNMP to v3 only (with AuthPriv authentication/privacy) or disable SNMP completely. Remove legacy SNMP v1/v2c community strings.",
            "parameter": "snmp_v3_only",
            "operator": "eq",
            "value": True,
            "severity": SEVERITY_HIGH,
            "remediation_cisco": "no snmp-server community public\nno snmp-server community private\nsnmp-server group v3group v3 priv",
            "remediation_juniper": "delete snmp community public\nset snmp v3 security-to-group-map..."
        },
        {
            "id": "STIG-NET-002",
            "name": "Enforce Strong Cryptography (SSH v2)",
            "description": "Ensure weak SSH protocols are disabled and only modern cryptographic configurations are utilized.",
            "parameter": "ssh_version",
            "operator": "eq",
            "value": "2",
            "severity": SEVERITY_HIGH,
            "remediation_cisco": "ip ssh version 2",
            "remediation_juniper": "set system services ssh protocol-version v2"
        }
    ],
    "ISO27001": [
        {
            "id": "ISO-A.12.4.1",
            "name": "Event Logging Enabled",
            "description": "Ensure administrative commands and login failures are logged locally or remotely to support compliance tracking.",
            "parameter": "logging_enabled",
            "operator": "eq",
            "value": True,
            "severity": SEVERITY_MEDIUM,
            "remediation_cisco": "logging enable\nlogging trap notifications",
            "remediation_juniper": "set system syslog file interactive-commands any any"
        },
        {
            "id": "ISO-A.9.4.2",
            "name": "Enforce Password Sophistication",
            "description": "Require administrative user accounts to have strong, non-trivial passwords by enforcing length checks.",
            "parameter": "min_password_length",
            "operator": "gte",
            "value": 12,
            "severity": SEVERITY_MEDIUM,
            "remediation_cisco": "security passwords min-length 12",
            "remediation_juniper": "set system login password minimum-length 12"
        }
    ]
}
