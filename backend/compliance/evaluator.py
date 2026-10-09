from typing import Dict, Any, List, Tuple
from ..parsers.base_parser import SecurityBaselineModel
from .benchmarks import BENCHMARKS

class ComplianceEvaluator:
    def __init__(self):
        pass

    def evaluate(self, parsed_model: SecurityBaselineModel, selected_benchmarks: List[str] = None) -> Dict[str, Any]:
        if not selected_benchmarks:
            selected_benchmarks = ["CIS", "NIST", "STIG", "ISO27001"]

        results = []
        passed_count = 0
        failed_count = 0
        
        # Vendor check to customize remediation syntax
        vendor = parsed_model.device_info.vendor.lower()
        
        params = parsed_model.security_parameters

        for benchmark_name in selected_benchmarks:
            if benchmark_name not in BENCHMARKS:
                continue
                
            rules = BENCHMARKS[benchmark_name]
            for rule in rules:
                param_name = rule["parameter"]
                operator = rule["operator"]
                expected_val = rule["value"]
                actual_val = getattr(params, param_name, None)
                
                status = "Fail"
                
                # Check status based on operator
                if actual_val is not None:
                    if operator == "eq":
                        if actual_val == expected_val:
                            status = "Pass"
                    elif operator == "gte":
                        if isinstance(actual_val, (int, float)) and isinstance(expected_val, (int, float)):
                            if actual_val >= expected_val:
                                status = "Pass"
                    elif operator == "lte":
                        if isinstance(actual_val, (int, float)) and isinstance(expected_val, (int, float)):
                            if actual_val <= expected_val:
                                status = "Pass"
                else:
                    # Parameter wasn't extracted or configured. 
                    # If expected is True for disabling insecure things (e.g. telnet_disabled = True),
                    # actual being None is a Fail. If we explicitly assumed defaults, base_parser/rules_parser handles it.
                    status = "Fail"

                # Setup default remediation based on vendor
                remediation = ""
                if vendor == "juniper":
                    remediation = rule.get("remediation_juniper", "")
                else:
                    remediation = rule.get("remediation_cisco", "") # Default to Cisco CLI format

                results.append({
                    "id": rule["id"],
                    "name": rule["name"],
                    "description": rule["description"],
                    "benchmark": benchmark_name,
                    "severity": rule["severity"],
                    "status": status,
                    "actual": str(actual_val) if actual_val is not None else "Not Configured",
                    "expected": str(expected_val),
                    "remediation": remediation
                })
                
                if status == "Pass":
                    passed_count += 1
                else:
                    failed_count += 1

        total_rules = passed_count + failed_count
        score = (passed_count / total_rules * 100) if total_rules > 0 else 100.0

        return {
            "device_info": parsed_model.device_info.model_dump(),
            "compliance_score": round(score, 1),
            "total_rules": total_rules,
            "passed_rules_count": passed_count,
            "failed_rules_count": failed_count,
            "results": results,
            "unrecognized_commands": parsed_model.unrecognized_commands
        }
