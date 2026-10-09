import os
import json
from typing import Optional, Dict, Any, List
import google.generativeai as genai
from .base_parser import SecurityBaselineModel, DeviceInfo, SecurityParameters

class GeminiParser:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)

    def parse(self, config_text: str, vendor: str = "Unknown") -> Optional[SecurityBaselineModel]:
        if not self.api_key:
            return None
        
        prompt = f"""
        Analyze the following raw network device configuration file.
        The detected vendor is: {vendor}.

        Extract the security configuration parameters and map them to our standardized schema.
        Standardized Schema Definition:
        {{
            "device_info": {{
                "hostname": "string (the hostname configured on the device)",
                "vendor": "string (e.g. Cisco, Juniper, Palo Alto, Arista, SONiC)",
                "model": "string (device hardware model if found)",
                "os_version": "string (firmware/OS version if found)",
                "serial_number": "string (serial number if found)"
            }},
            "security_parameters": {{
                "ssh_enabled": boolean (true if SSH is enabled/configured, false otherwise),
                "ssh_version": "string (e.g. '2' or '1' or null if not specified/enabled)",
                "telnet_disabled": boolean (true if telnet access is explicitly disabled/restricted or not configured; false if telnet is active/allowed/default)",
                "http_disabled": boolean (true if insecure web management/HTTP server is disabled, false if it is enabled)",
                "https_enabled": boolean (true if secure web management/HTTPS server is enabled, false otherwise)",
                "password_encryption_enabled": boolean (true if passwords are encrypted in config/service password-encryption/etc, false otherwise)",
                "min_password_length": integer (minimum password length requirement, null if not set)",
                "exec_timeout_seconds": integer (console/vty timeout in seconds, null if not set)",
                "snmp_v3_only": boolean (true if only SNMP v3 is used or SNMP is disabled; false if SNMP v1/v2c communities are active)",
                "banner_configured": boolean (true if login/motd warning banner is configured, false otherwise)",
                "logging_enabled": boolean (true if remote logging/syslog/host logging is enabled, false otherwise)",
                "acl_configured": boolean (true if firewall/access-lists are configured, false otherwise)"
            }}
        }}

        Identify any security-relevant command lines that you are unsure about and put them in a list under "unrecognized_commands".
        
        Return ONLY a valid JSON object matching this schema. Do not wrap it in markdown code blocks or add explanations.

        Configuration Content:
        \"\"\"{config_text[:12000]}\"\"\"
        """
        
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            
            data = json.loads(response.text.strip())
            
            # Map JSON to Pydantic SecurityBaselineModel
            device_data = data.get("device_info", {})
            sec_data = data.get("security_parameters", {})
            
            # Ensure proper vendor if not identified
            if not device_data.get("vendor") or device_data.get("vendor") == "Unknown":
                device_data["vendor"] = vendor
                
            model_obj = SecurityBaselineModel(
                device_info=DeviceInfo(**device_data),
                security_parameters=SecurityParameters(**sec_data),
                unrecognized_commands=data.get("unrecognized_commands", []),
                raw_config=config_text
            )
            return model_obj
        except Exception as e:
            print(f"Error parsing with Gemini: {e}")
            return None

    def generate_remediation(self, vendor: str, os_version: str, failed_rules: List[Dict[str, Any]]) -> str:
        if not self.api_key:
            return ""

        failed_rules_summary = "\n".join([
            f"- {rule.get('name')}: Description: {rule.get('description')} (Requirement: {rule.get('requirement')})"
            for rule in failed_rules
        ])

        prompt = f"""
        You are a senior Network Security Architect.
        Generate a precise CLI remediation script to harden a network device.
        
        Device Vendor: {vendor}
        OS Version: {os_version or 'Standard'}
        
        The device has failed the following security compliance checks:
        {failed_rules_summary}
        
        Provide the exact step-by-step CLI commands needed to fix these issues.
        Group commands logically (e.g. global configuration commands first, then line commands).
        Include brief inline comments (starting with ! or # depending on the vendor) to explain what each section is doing.
        Ensure you only return the CLI script, ready to copy-paste.
        """
        
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Error generating remediation with Gemini: {e}")
            return ""
