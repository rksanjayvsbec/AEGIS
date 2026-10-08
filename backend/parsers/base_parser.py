from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any

class DeviceInfo(BaseModel):
    hostname: Optional[str] = None
    vendor: str = "Unknown"
    model: Optional[str] = None
    os_version: Optional[str] = None
    serial_number: Optional[str] = None

class SecurityParameters(BaseModel):
    ssh_enabled: Optional[bool] = None
    ssh_version: Optional[str] = None
    telnet_disabled: Optional[bool] = None
    http_disabled: Optional[bool] = None
    https_enabled: Optional[bool] = None
    password_encryption_enabled: Optional[bool] = None
    min_password_length: Optional[int] = None
    exec_timeout_seconds: Optional[int] = None
    snmp_v3_only: Optional[bool] = None
    banner_configured: Optional[bool] = None
    logging_enabled: Optional[bool] = None
    acl_configured: Optional[bool] = None

class SecurityBaselineModel(BaseModel):
    device_info: DeviceInfo = Field(default_factory=DeviceInfo)
    security_parameters: SecurityParameters = Field(default_factory=SecurityParameters)
    unrecognized_commands: List[str] = Field(default_factory=list)
    raw_config: str = ""
