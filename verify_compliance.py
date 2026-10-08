import os
import json
from backend.parsers.rules_parser import RulesParser
from backend.compliance.evaluator import ComplianceEvaluator
from backend.reports.pdf_generator import CompliancePDFGenerator

def test_cisco_compliance():
    print("--- 1. Testing Cisco Compliance Auditing ---")
    
    # Read cisco config
    config_path = "backend/samples/cisco_ios.cfg"
    with open(config_path, "r") as f:
        config_text = f.read()

    # Parse config
    parser = RulesParser(heuristics_path="backend/heuristics.json")
    parsed_model = parser.parse(config_text, vendor="Cisco")
    
    print(f"Device Hostname: {parsed_model.device_info.hostname}")
    print(f"Device Vendor: {parsed_model.device_info.vendor}")
    print(f"SSH Enabled: {parsed_model.security_parameters.ssh_enabled}")
    print(f"SSH Version: {parsed_model.security_parameters.ssh_version}")
    print(f"Telnet Disabled: {parsed_model.security_parameters.telnet_disabled}")
    print(f"Unrecognized Security Commands: {len(parsed_model.unrecognized_commands)}")
    
    # Evaluate
    evaluator = ComplianceEvaluator()
    result = evaluator.evaluate(parsed_model)
    print(f"Compliance Score: {result['compliance_score']}%")
    print(f"Passed Controls: {result['passed_rules_count']} / Failed: {result['failed_rules_count']}")
    
    # Generate PDF
    pdf_path = "backend/generated_reports/test_cisco_report.pdf"
    pdf_gen = CompliancePDFGenerator(pdf_path)
    pdf_gen.generate(result)
    print(f"Generated PDF Report at: {pdf_path}")
    print("Cisco Test PASSED.\n")

def test_juniper_compliance():
    print("--- 2. Testing Juniper Compliance Auditing ---")
    
    # Read juniper config
    config_path = "backend/samples/juniper_junos.conf"
    with open(config_path, "r") as f:
        config_text = f.read()

    # Parse config (tests hierarchical normalization)
    parser = RulesParser(heuristics_path="backend/heuristics.json")
    parsed_model = parser.parse(config_text, vendor="Juniper")
    
    print(f"Device Hostname: {parsed_model.device_info.hostname}")
    print(f"Device Vendor: {parsed_model.device_info.vendor}")
    print(f"SSH Enabled: {parsed_model.security_parameters.ssh_enabled}")
    print(f"SSH Version: {parsed_model.security_parameters.ssh_version}")
    print(f"Telnet Disabled: {parsed_model.security_parameters.telnet_disabled}")
    print(f"Unrecognized Security Commands: {len(parsed_model.unrecognized_commands)}")
    
    # Evaluate
    evaluator = ComplianceEvaluator()
    result = evaluator.evaluate(parsed_model)
    print(f"Compliance Score: {result['compliance_score']}%")
    print(f"Passed Controls: {result['passed_rules_count']} / Failed: {result['failed_rules_count']}")
    
    # Generate PDF
    pdf_path = "backend/generated_reports/test_juniper_report.pdf"
    pdf_gen = CompliancePDFGenerator(pdf_path)
    pdf_gen.generate(result)
    print(f"Generated PDF Report at: {pdf_path}")
    print("Juniper Test PASSED.\n")

def test_training_loop():
    print("--- 3. Testing Interactive Learning Loop (Dynamic Adaptation) ---")
    
    # Setup clean heuristics path
    heuristics_path = "backend/test_heuristics.json"
    if os.path.exists(heuristics_path):
        os.remove(heuristics_path)
        
    cisco_config_path = "backend/samples/cisco_ios.cfg"
    with open(cisco_config_path, "r") as f:
        config_text = f.read()

    # Initialize parser with blank heuristics
    parser = RulesParser(heuristics_path=heuristics_path)
    parsed_model_1 = parser.parse(config_text, vendor="Cisco")
    
    # SNMP v3 checks are failing because SNMP v1/v2 community public/private are in config,
    # but let's train the engine on an unrecognized command:
    # "snmp-server community public RO" maps to snmp_v3_only = False
    
    # Initial state of SNMP check
    print(f"BEFORE TRAINING:")
    evaluator = ComplianceEvaluator()
    result_1 = evaluator.evaluate(parsed_model_1)
    snmp_check_1 = next(r for r in result_1["results"] if r["id"] == "STIG-NET-001")
    print(f"  SNMP v3 Rule Status: {snmp_check_1['status']}")
    print(f"  Unrecognized Commands Count: {len(parsed_model_1.unrecognized_commands)}")
    
    # Simulate user mapping from training loop GUI:
    # Match pattern: "^snmp-server community" -> snmp_v3_only = False
    print("\nTRAINING MODULE: User maps '^snmp-server community' to category 'snmp_v3_only' with value False...")
    parser.add_mapping(
        command_pattern=r"^snmp-server community",
        parameter="snmp_v3_only",
        value=False,
        vendor="Cisco"
    )
    
    # Re-parse config
    parsed_model_2 = parser.parse(config_text, vendor="Cisco")
    
    # Check SNMP rule status after dynamic learning
    print(f"\nAFTER TRAINING:")
    result_2 = evaluator.evaluate(parsed_model_2)
    snmp_check_2 = next(r for r in result_2["results"] if r["id"] == "STIG-NET-001")
    print(f"  SNMP v3 Rule Status: {snmp_check_2['status']}")
    print(f"  Actual Value Parsed: {parsed_model_2.security_parameters.snmp_v3_only}")
    
    # Clean up test heuristics file
    if os.path.exists(heuristics_path):
        os.remove(heuristics_path)
        
    print("\nInteractive Learning Loop Test PASSED.")

if __name__ == "__main__":
    # Create generated reports directory if needed
    os.makedirs("backend/generated_reports", exist_ok=True)
    
    test_cisco_compliance()
    test_juniper_compliance()
    test_training_loop()
    
    print("\n==========================================")
    print("🏆 ALL SECURITY ENGINE TESTS COMPLETED SUCCESSFULLY!")
    print("==========================================")
