import re
import os
import json
from typing import Dict, List, Tuple, Any, Optional
from .base_parser import SecurityBaselineModel, DeviceInfo, SecurityParameters

# Standard keywords for NLP / TF-IDF light category suggestion
SECURITY_KEYWORDS = {
    "ssh_enabled": ["ssh", "secure-shell", "crypto key generate rsa"],
    "ssh_version": ["ssh version", "ssh protocol", "ssh-2"],
    "telnet_disabled": ["telnet", "transport input", "no telnet"],
    "http_disabled": ["http server", "no ip http server", "web-management http"],
    "https_enabled": ["http secure-server", "https", "web-management https"],
    "password_encryption_enabled": ["password-encryption", "plain-text-password", "secret", "encrypt"],
    "min_password_length": ["password min-length", "security passwords min-length", "password length"],
    "exec_timeout_seconds": ["exec-timeout", "timeout", "session-timeout", "idle-timeout"],
    "snmp_v3_only": ["snmp-server", "snmp group", "snmp community", "snmp v3"],
    "banner_configured": ["banner motd", "banner login", "message-of-the-day"],
    "logging_enabled": ["logging host", "logging enable", "syslog"],
    "acl_configured": ["access-list", "access-group", "firewall filter"]
}

class RulesParser:
    def __init__(self, heuristics_path: str = "heuristics.json"):
        self.heuristics_path = heuristics_path
        self.learned_mappings = self.load_heuristics()

    def load_heuristics(self) -> List[Dict[str, Any]]:
        if os.path.exists(self.heuristics_path):
            try:
                with open(self.heuristics_path, "r") as f:
                    return json.load(f)
            except Exception:
                return []
        return []

    def save_heuristics(self):
        try:
            with open(self.heuristics_path, "w") as f:
                json.dump(self.learned_mappings, f, indent=4)
        except Exception as e:
            print(f"Error saving heuristics: {e}")

    def add_mapping(self, command_pattern: str, parameter: str, value: Any, vendor: str = "Generic"):
        # Check if already exists
        exists = False
        for m in self.learned_mappings:
            if m.get("command_pattern") == command_pattern and m.get("parameter") == parameter:
                m["value"] = value
                m["vendor"] = vendor
                exists = True
                break
        if not exists:
            self.learned_mappings.append({
                "command_pattern": command_pattern,
                "parameter": parameter,
                "value": value,
                "vendor": vendor
            })
        self.save_heuristics()

    def remove_mapping(self, command_pattern: str, parameter: str):
        self.learned_mappings = [
            m for m in self.learned_mappings
            if not (m.get("command_pattern") == command_pattern and m.get("parameter") == parameter)
        ]
        self.save_heuristics()

    def detect_vendor(self, config_text: str) -> str:
        # Detect vendor based on common config markers
        config_lower = config_text.lower()
        if "cisco" in config_lower or "boot system flash" in config_lower or "service password-encryption" in config_lower:
            return "Cisco"
        elif "juniper" in config_lower or "junos" in config_lower or "system {" in config_lower or "set system" in config_lower:
            return "Juniper"
        elif "paloalto" in config_lower or "pan-os" in config_lower or "<config" in config_lower:
            return "Palo Alto"
        elif "sonic" in config_lower or "sonic-cli" in config_lower:
            return "SONiC"
        elif "arista" in config_lower or "eos" in config_lower:
            return "Arista"
        
        # Generic heuristic checks
        if any(line.strip().startswith("set ") for line in config_text.splitlines()[:50]):
            return "Juniper"
        if any("!" in line for line in config_text.splitlines()[:20]):
            return "Cisco"
        
        return "Generic"

    def normalize_juniper_curly_to_flat(self, config_text: str) -> str:
        # Convert curly-brace Junos format to flat 'set' commands for easier regex parsing
        lines = config_text.splitlines()
        flat_lines = []
        path = []
        for line in lines:
            line = line.strip()
            if not line or line.startswith("#") or line.startswith("/*"):
                continue
            if line.endswith("{"):
                node = line[:-1].strip()
                path.append(node)
            elif line == "}":
                if path:
                    path.pop()
            else:
                statement = line
                if statement.endswith(";"):
                    statement = statement[:-1]
                full_path = " ".join(path + [statement])
                flat_lines.append("set " + full_path)
        return "\n".join(flat_lines)

    def classify_unrecognized_command(self, command: str) -> Optional[str]:
        # NLP-based classifier suggesting which compliance parameter an unrecognized command belongs to
        cmd_lower = command.lower()
        best_param = None
        max_matches = 0
        for param, keywords in SECURITY_KEYWORDS.items():
            matches = sum(1 for kw in keywords if kw in cmd_lower)
            if matches > max_matches:
                max_matches = matches
                best_param = param
        return best_param

    def parse(self, config_text: str, vendor: str = None) -> SecurityBaselineModel:
        detected = self.detect_vendor(config_text)
        if not vendor or vendor == "Unknown" or vendor == "Generic":
            vendor = detected
        elif detected != "Generic" and vendor.lower() != detected.lower():
            # If the user-specified vendor does not match the actual syntax, auto-correct to detected vendor
            vendor = detected

        # Normalize config if Juniper hierarchical
        normalized_config = config_text
        if vendor == "Juniper" and "{" in config_text and "}" in config_text:
            normalized_config = self.normalize_juniper_curly_to_flat(config_text)

        lines = normalized_config.splitlines()
        
        # Initialize baseline model
        model = SecurityBaselineModel(raw_config=config_text)
        model.device_info.vendor = vendor

        # Standard initial assumptions
        params = model.security_parameters
        params.ssh_enabled = False
        params.telnet_disabled = True # assumed safe unless telnet found
        params.http_disabled = True   # assumed safe unless http found
        params.https_enabled = False
        params.password_encryption_enabled = False
        params.banner_configured = False
        params.logging_enabled = False
        params.acl_configured = False
        params.snmp_v3_only = True    # assumed safe unless v1/v2 found

        unrecognized = []

        # Default rules for Cisco IOS
        cisco_regexes = {
            "hostname": r"^hostname\s+(\S+)",
            "ssh_version": r"^ip\s+ssh\s+version\s+(\d+)",
            "ssh_enabled": r"^ip\s+ssh",
            "telnet_disabled_vty": r"transport\s+input\s+(.*)",
            "http_enabled": r"^ip\s+http\s+server",
            "https_enabled": r"^ip\s+http\s+secure-server",
            "password_encrypt": r"^service\s+password-encryption",
            "min_password_len": r"^security\s+passwords\s+min-length\s+(\d+)",
            "exec_timeout": r"exec-timeout\s+(\d+)\s+(\d+)",
            "snmp_v1_v2": r"^snmp-server\s+community\s+",
            "banner": r"^banner\s+motd",
            "logging": r"^logging\s+(?:host\s+)?(?:\S+)",
            "acl": r"^(?:ip\s+)?access-list\s+"
        }

        # Default rules for Juniper JunOS (flat set commands)
        juniper_regexes = {
            "hostname": r"set\s+system\s+host-name\s+(\S+)",
            "ssh_enabled": r"set\s+system\s+services\s+ssh",
            "ssh_version": r"set\s+system\s+services\s+ssh\s+protocol-version\s+v?(\d+)",
            "telnet_enabled": r"set\s+system\s+services\s+telnet",
            "http_enabled": r"set\s+system\s+services\s+web-management\s+http",
            "https_enabled": r"set\s+system\s+services\s+web-management\s+https",
            "password_encrypt": r"plain-text-password-encrypt",
            "min_password_len": r"password\s+minimum-length\s+(\d+)",
            "exec_timeout": r"idle-timeout\s+(\d+)",
            "snmp_v1_v2": r"set\s+snmp\s+community\s+",
            "banner": r"set\s+system\s+login\s+message",
            "logging": r"set\s+system\s+syslog",
            "acl": r"set\s+firewall\s+filter\s+"
        }

        active_regexes = cisco_regexes if vendor == "Cisco" else (juniper_regexes if vendor == "Juniper" else {})

        # We will parse VTY line configurations to determine if telnet is disabled
        in_vty_block = False
        vty_transports = []

        for line in lines:
            line_stripped = line.strip()
            if not line_stripped or line_stripped.startswith("!") or line_stripped.startswith("#"):
                continue

            matched = False

            # Check dynamic learned mappings first (Heuristics Override)
            for item in self.learned_mappings:
                pattern = item.get("command_pattern", "")
                param_target = item.get("parameter", "")
                val_mapped = item.get("value")
                
                # Check for regex match or exact keyword match
                try:
                    match = re.search(pattern, line_stripped, re.IGNORECASE)
                    if match:
                        matched = True
                        if isinstance(val_mapped, bool):
                            setattr(params, param_target, val_mapped)
                        elif isinstance(val_mapped, int) or (isinstance(val_mapped, str) and val_mapped.isdigit()):
                            setattr(params, param_target, int(val_mapped))
                        else:
                            # if matched groups are present, use the first group as value
                            if match.groups():
                                setattr(params, param_target, match.group(1))
                            else:
                                setattr(params, param_target, val_mapped)
                        break
                except Exception:
                    # Fallback to direct string check if pattern fails as regex
                    if pattern.lower() in line_stripped.lower():
                        matched = True
                        setattr(params, param_target, val_mapped)
                        break
            
            if matched:
                continue

            # Standard Hardcoded Rules Parser
            if vendor == "Cisco":
                # Check VTY line block for transport inputs
                if line_stripped.startswith("line vty"):
                    in_vty_block = True
                    continue
                elif in_vty_block and (line_stripped.startswith("line") or line_stripped.startswith("interface") or line_stripped.startswith("router")):
                    in_vty_block = False
                
                # Hostname
                m = re.match(active_regexes["hostname"], line_stripped)
                if m:
                    model.device_info.hostname = m.group(1)
                    matched = True
                
                # SSH version
                m = re.match(active_regexes["ssh_version"], line_stripped)
                if m:
                    params.ssh_version = m.group(1)
                    params.ssh_enabled = True
                    matched = True
                elif re.match(active_regexes["ssh_enabled"], line_stripped):
                    params.ssh_enabled = True
                    matched = True
                
                # Telnet status in VTY
                if in_vty_block:
                    m = re.match(active_regexes["telnet_disabled_vty"], line_stripped)
                    if m:
                        protocols = m.group(1).lower()
                        vty_transports.append(protocols)
                        matched = True

                # HTTP Server
                if re.match(active_regexes["http_enabled"], line_stripped):
                    params.http_disabled = False
                    matched = True
                
                # HTTPS Server
                if re.match(active_regexes["https_enabled"], line_stripped):
                    params.https_enabled = True
                    matched = True

                # Password Encryption
                if re.match(active_regexes["password_encrypt"], line_stripped):
                    params.password_encryption_enabled = True
                    matched = True

                # Min Password Length
                m = re.match(active_regexes["min_password_len"], line_stripped)
                if m:
                    params.min_password_length = int(m.group(1))
                    matched = True

                # Exec Timeout
                m = re.search(active_regexes["exec_timeout"], line_stripped)
                if m:
                    mins = int(m.group(1))
                    secs = int(m.group(2))
                    params.exec_timeout_seconds = mins * 60 + secs
                    matched = True

                # SNMP
                if re.match(active_regexes["snmp_v1_v2"], line_stripped):
                    params.snmp_v3_only = False
                    matched = True

                # Banner
                if re.match(active_regexes["banner"], line_stripped):
                    params.banner_configured = True
                    matched = True

                # Logging
                if re.match(active_regexes["logging"], line_stripped):
                    params.logging_enabled = True
                    matched = True

                # ACL
                if re.match(active_regexes["acl"], line_stripped):
                    params.acl_configured = True
                    matched = True

            elif vendor == "Juniper":
                # Hostname
                m = re.search(active_regexes["hostname"], line_stripped)
                if m:
                    model.device_info.hostname = m.group(1)
                    matched = True
                
                # SSH
                m = re.search(active_regexes["ssh_version"], line_stripped)
                if m:
                    params.ssh_version = m.group(1)
                    params.ssh_enabled = True
                    matched = True
                elif re.search(active_regexes["ssh_enabled"], line_stripped):
                    params.ssh_enabled = True
                    matched = True

                # Telnet
                if re.search(active_regexes["telnet_enabled"], line_stripped):
                    params.telnet_disabled = False
                    matched = True

                # HTTP
                if re.search(active_regexes["http_enabled"], line_stripped):
                    params.http_disabled = False
                    matched = True

                # HTTPS
                if re.search(active_regexes["https_enabled"], line_stripped):
                    params.https_enabled = True
                    matched = True

                # Password encryption
                if active_regexes["password_encrypt"] in line_stripped:
                    params.password_encryption_enabled = True
                    matched = True

                # Min Password Length
                m = re.search(active_regexes["min_password_len"], line_stripped)
                if m:
                    params.min_password_length = int(m.group(1))
                    matched = True

                # Timeout
                m = re.search(active_regexes["exec_timeout"], line_stripped)
                if m:
                    params.exec_timeout_seconds = int(m.group(1)) * 60
                    matched = True

                # SNMP
                if re.search(active_regexes["snmp_v1_v2"], line_stripped):
                    params.snmp_v3_only = False
                    matched = True

                # Banner
                if re.search(active_regexes["banner"], line_stripped):
                    params.banner_configured = True
                    matched = True

                # Logging
                if re.search(active_regexes["logging"], line_stripped):
                    params.logging_enabled = True
                    matched = True

                # ACL
                if re.search(active_regexes["acl"], line_stripped):
                    params.acl_configured = True
                    matched = True

            # If line represents a configuration command and was not matched, flag it if it's security-related
            if not matched:
                is_sec_relevant = any(kw in line_stripped.lower() for kw in [
                    "ssh", "telnet", "http", "https", "password", "timeout", "snmp", "banner", "logging", "access-list", "secret", "user"
                ])
                if is_sec_relevant:
                    unrecognized.append(line_stripped)

        # Cisco VTY Post processing
        if vendor == "Cisco" and vty_transports:
            # Check if telnet is explicitly allowed on any vty line
            telnet_allowed = False
            for transport in vty_transports:
                if "telnet" in transport or "all" in transport:
                    telnet_allowed = True
            params.telnet_disabled = not telnet_allowed

        model.unrecognized_commands = unrecognized[:30] # Limit to top 30 unrecognized to avoid cluttering

        return model
