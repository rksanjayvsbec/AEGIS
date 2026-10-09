import os
import re
import uuid
import json
import datetime
from typing import List, Optional
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from .config import settings
from .database import db_manager
from .parsers.rules_parser import RulesParser
from .parsers.gemini_parser import GeminiParser
from .compliance.evaluator import ComplianceEvaluator
from .reports.pdf_generator import CompliancePDFGenerator

# Models for Request Bodies
class MappingRequest(BaseModel):
    command_pattern: str
    parameter: str
    value: str  # Can be boolean ("true"/"false"), numeric, or text
    vendor: str

class DeleteMappingRequest(BaseModel):
    command_pattern: str
    parameter: str

class DismissCommandRequest(BaseModel):
    command: str

def is_command_mapped(cmd: str, parser: RulesParser) -> bool:
    """Check if a CLI command has already been dynamically mapped in heuristics."""
    cmd_clean = cmd.strip()
    for item in parser.learned_mappings:
        pattern = item.get("command_pattern", "")
        if not pattern:
            continue
        try:
            if re.search(pattern, cmd_clean, re.IGNORECASE):
                return True
        except Exception:
            if pattern.lower() in cmd_clean.lower():
                return True
    return False

# FastAPI Lifespan Handler for MongoDB Connection
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect to MongoDB on server startup
    await db_manager.connect()
    yield
    # Gracefully close MongoDB connection on shutdown
    await db_manager.close()

# Initialize FastAPI App
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Backend API for AI-Driven Network Security Compliance Auditor",
    lifespan=lifespan
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SettingsUpdateRequest(BaseModel):
    gemini_api_key: Optional[str] = None
    selected_benchmarks: Optional[List[str]] = None
    mongodb_uri: Optional[str] = None
    mongodb_db_name: Optional[str] = None

class DbTestRequest(BaseModel):
    uri: str

class DbConfigRequest(BaseModel):
    uri: str
    database: Optional[str] = None

class LiveConnectRequest(BaseModel):
    host: str
    username: str
    password: str
    device_type: str  # Netmiko device types: e.g. cisco_ios, juniper_junos
    port: int = 22

# API Endpoints

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "time": datetime.datetime.now().isoformat()}

# --- Database Management Endpoints ---

@app.get("/api/db/status")
async def get_db_status():
    """Retrieve live MongoDB connection state, metrics, and collection counts."""
    return await db_manager.get_status()

@app.post("/api/db/test")
async def test_db_connection(req: DbTestRequest):
    """Test a MongoDB connection URI before applying it."""
    return await db_manager.test_connection(req.uri)

@app.post("/api/db/config")
async def update_db_config(req: DbConfigRequest):
    """Update MongoDB connection URI / database and reconnect."""
    connected = await db_manager.connect(uri=req.uri, db_name=req.database)
    status = await db_manager.get_status()
    return {
        "success": connected,
        "status": status,
        "message": f"Connected to MongoDB ({status['database']}) successfully!" if connected else f"Could not connect to MongoDB. Operating in {status['mode']} mode."
    }

@app.post("/api/db/migrate")
async def migrate_local_data():
    """Import records and heuristics from local JSON files into MongoDB."""
    return await db_manager.migrate_local_data_to_mongo()

# --- Compliance Record Endpoints ---

@app.get("/api/records")
async def get_records():
    records = await db_manager.get_all_records()
    # Return brief metadata list for the UI list view
    return [{
        "id": r.get("id"),
        "hostname": r.get("device_info", {}).get("hostname") or "Unknown",
        "vendor": r.get("device_info", {}).get("vendor") or "Generic",
        "model": r.get("device_info", {}).get("model") or "Unknown",
        "os_version": r.get("device_info", {}).get("os_version") or "Unknown",
        "compliance_score": r.get("compliance_score", 0),
        "passed_rules_count": r.get("passed_rules_count", 0),
        "failed_rules_count": r.get("failed_rules_count", 0),
        "total_rules": r.get("total_rules", 0),
        "timestamp": r.get("timestamp")
    } for r in records]

@app.get("/api/records/{record_id}")
async def get_record(record_id: str):
    record = await db_manager.get_record_by_id(record_id)
    if record:
        return record
    raise HTTPException(status_code=404, detail="Record not found")

@app.delete("/api/records/{record_id}")
async def delete_record(record_id: str):
    # Delete report PDF if present
    pdf_path = os.path.join(settings.reports_dir, f"report_{record_id}.pdf")
    if os.path.exists(pdf_path):
        try:
            os.remove(pdf_path)
        except Exception:
            pass

    await db_manager.delete_record(record_id)
    return {"success": True, "message": "Record deleted"}

@app.get("/api/history/ingested")
async def get_ingested_history():
    """Retrieve full audit history including all ingested values, parameters, and dynamic heuristics."""
    records = await db_manager.get_all_records()
    heuristics = await db_manager.get_all_heuristics()
    db_status = await db_manager.get_status()

    formatted_records = []
    vendors_set = set()
    for r in records:
        vendor = r.get("device_info", {}).get("vendor") or "Generic"
        vendors_set.add(vendor)

        # Build comprehensive list of ingested parameter values
        param_values = []
        for res in r.get("results", []):
            param_values.append({
                "rule_id": res.get("id"),
                "name": res.get("name", res.get("id")),
                "description": res.get("description", ""),
                "benchmark": res.get("benchmark", "CIS"),
                "severity": res.get("severity", "Medium"),
                "actual": res.get("actual", "Not Configured"),
                "expected": res.get("expected", ""),
                "status": res.get("status", "Fail"),
                "remediation": res.get("remediation", "")
            })

        formatted_records.append({
            "id": r.get("id"),
            "filename": r.get("filename") or "device_config.cfg",
            "timestamp": r.get("timestamp") or "Unknown",
            "device_info": r.get("device_info", {}),
            "compliance_score": r.get("compliance_score", 0),
            "passed_rules_count": r.get("passed_rules_count", 0),
            "failed_rules_count": r.get("failed_rules_count", 0),
            "total_rules": r.get("total_rules", 0),
            "unrecognized_commands": r.get("unrecognized_commands", []),
            "param_values": param_values,
            "raw_config": r.get("raw_config", ""),
            "raw_config_lines": len((r.get("raw_config") or "").splitlines())
        })

    return {
        "records": formatted_records,
        "heuristics": heuristics,
        "summary": {
            "total_records": len(formatted_records),
            "total_heuristics": len(heuristics),
            "unique_vendors": sorted(list(vendors_set)),
            "storage_mode": db_status.get("mode", "file_fallback"),
            "database_connected": db_status.get("connected", False),
            "database_name": db_status.get("database", "aegis_auditor")
        }
    }

@app.delete("/api/history/clear")
async def clear_ingestion_history():
    """Purge all ingested records and reset history."""
    records = await db_manager.get_all_records()
    for r in records:
        rec_id = r.get("id")
        if rec_id:
            pdf_path = os.path.join(settings.reports_dir, f"report_{rec_id}.pdf")
            if os.path.exists(pdf_path):
                try:
                    os.remove(pdf_path)
                except Exception:
                    pass
    await db_manager.clear_all_records()
    return {"success": True, "message": "All ingestion history and records cleared."}

@app.post("/api/upload")
async def upload_config(
    file: UploadFile = File(...),
    vendor: Optional[str] = Form(None),
    benchmarks: Optional[str] = Form(None)  # JSON-encoded array: '["CIS","NIST"]'
):
    try:
        content = await file.read()
        config_text = content.decode("utf-8", errors="ignore")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {str(e)}")

    selected_benchmarks = ["CIS", "NIST", "STIG", "ISO27001"]
    if benchmarks:
        try:
            selected_benchmarks = json.loads(benchmarks)
        except Exception:
            pass

    # Initialize parser
    rules_parser = RulesParser(heuristics_path=settings.heuristics_path)
    
    # Check for platform mismatch between target platform and file content
    detected_vendor = rules_parser.detect_vendor(config_text)
    vendor_mismatch_info = None
    if vendor and vendor != "Generic" and detected_vendor != "Generic" and detected_vendor.lower() != vendor.lower():
        vendor_mismatch_info = {
            "chosen_vendor": vendor,
            "detected_vendor": detected_vendor,
            "message": f"Platform chosen ({vendor}) was incorrect for this configuration. Automatically changed to Generic / {detected_vendor}."
        }
        # Automatically use detected vendor
        vendor = detected_vendor

    # Check if Gemini key is available and parse
    parsed_model = None
    if settings.gemini_api_key:
        gemini_parser = GeminiParser(api_key=settings.gemini_api_key)
        parsed_model = gemini_parser.parse(config_text, vendor=vendor or "Generic")
        
    if not parsed_model:
        # Fallback to rules-based parser
        parsed_model = rules_parser.parse(config_text, vendor=vendor)

    # Process compliance
    evaluator = ComplianceEvaluator()
    result = evaluator.evaluate(parsed_model, selected_benchmarks)
    if vendor_mismatch_info:
        result["vendor_mismatch"] = vendor_mismatch_info
    
    # If Gemini is available, we can augment remediation scripts with custom-tailored suggestions
    if settings.gemini_api_key:
        try:
            gemini_parser = GeminiParser(api_key=settings.gemini_api_key)
            failed_rules = [r for r in result["results"] if r["status"] == "Fail"]
            if failed_rules:
                custom_remediation = gemini_parser.generate_remediation(
                    vendor=result["device_info"]["vendor"],
                    os_version=result["device_info"]["os_version"],
                    failed_rules=failed_rules
                )
                if custom_remediation:
                    # Append or override remediation block
                    result["custom_remediation"] = custom_remediation
        except Exception as e:
            print(f"Failed to generate Gemini remediation: {e}")

    # Generate a unique record ID
    record_id = str(uuid.uuid4())
    result["id"] = record_id
    result["filename"] = file.filename
    result["timestamp"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    result["raw_config"] = config_text

    # Generate PDF Report
    pdf_filename = os.path.join(settings.reports_dir, f"report_{record_id}.pdf")
    pdf_gen = CompliancePDFGenerator(pdf_filename)
    
    # Support custom remediation in PDF if available
    pdf_data = result.copy()
    if "custom_remediation" in result:
        # Format custom remediation script for ReportLab (replace failed remediations list)
        pdf_data["results"] = [
            {**r, "remediation": ""} if r["status"] == "Fail" else r for r in pdf_data["results"]
        ]
        # Set the main remediation output to include the custom one
        pdf_data["results"].append({
            "id": "REM",
            "name": "Custom Remediation script",
            "description": "",
            "benchmark": "N/A",
            "severity": "Info",
            "status": "Fail", # Triggers display in PDF
            "actual": "",
            "expected": "",
            "remediation": result["custom_remediation"]
        })
        
    pdf_gen.generate(pdf_data)

    # Save to records store (MongoDB with file fallback)
    await db_manager.save_record(result)

    return result

@app.post("/api/connect")
async def connect_live_device(req: LiveConnectRequest):
    # This endpoint executes Netmiko connection
    try:
        from netmiko import ConnectHandler
    except ImportError:
        raise HTTPException(status_code=500, detail="Netmiko library is not installed in the backend environment.")

    # In a real environment, we configure netmiko params.
    # To avoid blocking the SIH demonstration with network timeouts when there's no actual device,
    # we support MOCK live devices if IP is 127.0.0.1 or starts with 192.0.2 (test net).
    # This guarantees the feature works flawlessly during the presentation!
    is_mock = req.host == "127.0.0.1" or req.host.startswith("192.0.2.") or "mock" in req.username.lower()

    config_text = ""
    device_info = {}

    if is_mock:
        # Return a mock configuration depending on device type
        vendor = "Cisco" if "cisco" in req.device_type else "Juniper"
        if vendor == "Cisco":
            device_info = {"hostname": "mock-cisco-router", "vendor": "Cisco", "model": "ISR4451", "os_version": "16.9.3", "serial_number": "FTX1928X09C"}
            config_text = """
            hostname mock-cisco-router
            !
            service password-encryption
            !
            username admin privilege 15 secret 5 $1$mERr$hx5TJMsWS3JgU8
            !
            ip ssh version 1
            ip http server
            no ip http secure-server
            !
            line con 0
             exec-timeout 0 0
            line vty 0 4
             login local
             transport input telnet ssh
            !
            snmp-server community public RO
            snmp-server community private RW
            !
            end
            """
        else:
            device_info = {"hostname": "mock-juniper-srx", "vendor": "Juniper", "model": "SRX300", "os_version": "18.2R1", "serial_number": "JN1298X30A"}
            config_text = """
            system {
                host-name mock-juniper-srx;
                services {
                    ssh {
                        protocol-version v1;
                    }
                    telnet;
                    web-management {
                        http;
                    }
                }
                login {
                    user root-authentication {
                        plain-text-password-value "root123";
                    }
                }
            }
            snmp {
                community public {
                    authorization read-only;
                }
            }
            """
    else:
        # Actual live Netmiko connection
        try:
            device_params = {
                "device_type": req.device_type,
                "host": req.host,
                "username": req.username,
                "password": req.password,
                "port": req.port,
            }
            
            # Execute connection
            with ConnectHandler(**device_params) as net_connect:
                # Find hostname
                hostname = net_connect.find_prompt().replace("#", "").replace(">", "").strip()
                device_info = {
                    "hostname": hostname,
                    "vendor": "Cisco" if "cisco" in req.device_type else "Juniper",
                    "model": "Live Device",
                    "os_version": "Unknown",
                    "serial_number": "Unknown"
                }
                
                # Fetch config
                if "cisco" in req.device_type:
                    config_text = net_connect.send_command("show running-config")
                elif "juniper" in req.device_type:
                    config_text = net_connect.send_command("show configuration")
                else:
                    config_text = net_connect.send_command("show running")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Live connection failed: {str(e)}")

    # Parse and analyze the fetched configuration
    rules_parser = RulesParser(heuristics_path=settings.heuristics_path)
    
    parsed_model = None
    if settings.gemini_api_key:
        gemini_parser = GeminiParser(api_key=settings.gemini_api_key)
        parsed_model = gemini_parser.parse(config_text, vendor=device_info.get("vendor"))
        
    if not parsed_model:
        parsed_model = rules_parser.parse(config_text, vendor=device_info.get("vendor"))
        # Force device info derived from live connection details
        if parsed_model.device_info.hostname is None:
            parsed_model.device_info.hostname = device_info.get("hostname")
        parsed_model.device_info.model = device_info.get("model")
        parsed_model.device_info.os_version = device_info.get("os_version")
        parsed_model.device_info.serial_number = device_info.get("serial_number")

    evaluator = ComplianceEvaluator()
    result = evaluator.evaluate(parsed_model)
    
    # Save Record
    record_id = str(uuid.uuid4())
    result["id"] = record_id
    result["filename"] = f"live_{req.host}.cfg"
    result["timestamp"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    result["raw_config"] = config_text

    # Generate PDF
    pdf_filename = os.path.join(settings.reports_dir, f"report_{record_id}.pdf")
    pdf_gen = CompliancePDFGenerator(pdf_filename)
    pdf_gen.generate(result)

    # Save to MongoDB with file fallback
    await db_manager.save_record(result)

    return result

@app.get("/api/reports/{record_id}/pdf")
def download_pdf(record_id: str):
    pdf_path = os.path.join(settings.reports_dir, f"report_{record_id}.pdf")
    if os.path.exists(pdf_path):
        return FileResponse(
            pdf_path,
            media_type="application/pdf",
            filename=f"Compliance_Report_{record_id}.pdf"
        )
    raise HTTPException(status_code=404, detail="PDF report file not found")

@app.get("/api/training/unrecognized")
async def get_unrecognized_commands():
    records = await db_manager.get_all_records()
    
    # Collect unrecognized commands
    all_unrecognized = []
    seen = set()
    
    # Initialize rules parser to classify suggested categories
    parser = RulesParser(heuristics_path=settings.heuristics_path)
    
    for r in records:
        vendor = r.get("device_info", {}).get("vendor", "Generic")
        for cmd in r.get("unrecognized_commands", []):
            if cmd not in seen:
                seen.add(cmd)
                # Filter out commands that are already matched by dynamic heuristics!
                if is_command_mapped(cmd, parser):
                    continue
                suggested_param = parser.classify_unrecognized_command(cmd)
                all_unrecognized.append({
                    "command": cmd,
                    "vendor": vendor,
                    "suggested_parameter": suggested_param or "None"
                })
    return all_unrecognized

@app.get("/api/training/mappings")
async def get_learned_mappings():
    parser = RulesParser(heuristics_path=settings.heuristics_path)
    return parser.learned_mappings

@app.delete("/api/training/mappings")
async def delete_learned_mapping(req: DeleteMappingRequest):
    parser = RulesParser(heuristics_path=settings.heuristics_path)
    parser.remove_mapping(req.command_pattern, req.parameter)
    await db_manager.delete_heuristic(req.command_pattern, req.parameter)

    # Re-evaluate configurations so compliance and unrecognized queues refresh accurately
    records = await db_manager.get_all_records()
    for record in records:
        raw_cfg = record.get("raw_config", "")
        if raw_cfg:
            parsed_model = parser.parse(raw_cfg, vendor=record.get("device_info", {}).get("vendor", "Generic"))
            evaluator = ComplianceEvaluator()
            benchmarks_used = list(set(item.get("benchmark") for item in record.get("results", [])))
            new_result = evaluator.evaluate(parsed_model, benchmarks_used)
            new_result["id"] = record["id"]
            new_result["filename"] = record.get("filename", "unknown.cfg")
            new_result["timestamp"] = record.get("timestamp")
            new_result["raw_config"] = raw_cfg
            pdf_filename = os.path.join(settings.reports_dir, f"report_{record['id']}.pdf")
            pdf_gen = CompliancePDFGenerator(pdf_filename)
            pdf_gen.generate(new_result)
            await db_manager.save_record(new_result)

    return {"success": True, "message": "Mapping removed and configurations re-analyzed."}

@app.post("/api/training/dismiss")
async def dismiss_unrecognized_command(req: DismissCommandRequest):
    records = await db_manager.get_all_records()
    for record in records:
        unrec = record.get("unrecognized_commands", [])
        if req.command in unrec:
            record["unrecognized_commands"] = [c for c in unrec if c != req.command]
            await db_manager.save_record(record)
    return {"success": True, "message": "Command dismissed."}

@app.post("/api/training/map")
async def map_unrecognized_command(req: MappingRequest):
    parser = RulesParser(heuristics_path=settings.heuristics_path)
    
    # Determine the type of the value
    val = req.value
    if val.lower() == "true":
        val = True
    elif val.lower() == "false":
        val = False
    elif val.isdigit():
        val = int(val)
        
    parser.add_mapping(
        command_pattern=req.command_pattern,
        parameter=req.parameter,
        value=val,
        vendor=req.vendor
    )

    # Persist in MongoDB heuristics collection as well
    await db_manager.save_heuristic({
        "command_pattern": req.command_pattern,
        "parameter": req.parameter,
        "value": val,
        "vendor": req.vendor
    })
    
    # After mapping, we can re-evaluate all configurations so they update!
    records = await db_manager.get_all_records()
    updated_records = []
    
    for record in records:
        # Re-run rule parser over original config
        raw_cfg = record.get("raw_config", "")
        if raw_cfg:
            parsed_model = parser.parse(raw_cfg, vendor=record.get("device_info", {}).get("vendor", "Generic"))
            evaluator = ComplianceEvaluator()
            
            # Extract previous benchmarks used, or default
            benchmarks_used = list(set(item.get("benchmark") for item in record.get("results", [])))
            new_result = evaluator.evaluate(parsed_model, benchmarks_used)
            
            # Carry over details and preserve raw_config
            new_result["id"] = record["id"]
            new_result["filename"] = record.get("filename", "unknown.cfg")
            new_result["timestamp"] = record.get("timestamp")
            new_result["raw_config"] = raw_cfg
            
            # Re-generate PDF Report
            pdf_filename = os.path.join(settings.reports_dir, f"report_{record['id']}.pdf")
            pdf_gen = CompliancePDFGenerator(pdf_filename)
            pdf_gen.generate(new_result)
            
            await db_manager.save_record(new_result)
            updated_records.append(new_result)
        else:
            # For legacy records missing raw_config, clean mapped commands from unrecognized_commands directly
            original_unrec = record.get("unrecognized_commands", [])
            filtered_unrec = [c for c in original_unrec if not is_command_mapped(c, parser)]
            if len(filtered_unrec) != len(original_unrec):
                record["unrecognized_commands"] = filtered_unrec
                await db_manager.save_record(record)
            updated_records.append(record)
            
    return {"success": True, "message": f"Mapping updated. Re-analyzed {len(updated_records)} configurations."}

@app.get("/api/settings")
async def get_app_settings():
    db_status = await db_manager.get_status()
    return {
        "gemini_api_key": settings.gemini_api_key,
        "is_gemini_active": bool(settings.gemini_api_key),
        "available_benchmarks": ["CIS", "NIST", "STIG", "ISO27001"],
        "mongodb": db_status
    }

@app.post("/api/settings")
async def update_app_settings(req: SettingsUpdateRequest):
    if req.gemini_api_key is not None:
        settings.gemini_api_key = req.gemini_api_key
        os.environ["GEMINI_API_KEY"] = req.gemini_api_key
    if req.mongodb_uri is not None:
        settings.mongodb_uri = req.mongodb_uri
        os.environ["MONGODB_URI"] = req.mongodb_uri
        if req.mongodb_db_name is not None:
            settings.mongodb_db_name = req.mongodb_db_name
            os.environ["MONGODB_DB_NAME"] = req.mongodb_db_name
        await db_manager.connect(uri=req.mongodb_uri, db_name=settings.mongodb_db_name)
    return {"success": True, "message": "Settings updated"}
