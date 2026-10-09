import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from typing import Dict, Any

class CompliancePDFGenerator:
    def __init__(self, filename: str):
        self.filename = filename

    def generate(self, data: Dict[str, Any]):
        # Setup document
        doc = SimpleDocTemplate(
            self.filename,
            pagesize=letter,
            rightMargin=54, leftMargin=54, topMargin=54, bottomMargin=54
        )

        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=22,
            textColor=colors.HexColor("#1E3A8A"), # Navy Blue
            spaceAfter=15
        )
        
        subtitle_style = ParagraphStyle(
            'DocSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            textColor=colors.HexColor("#4B5563"), # Charcoal
            spaceAfter=30
        )
        
        h1_style = ParagraphStyle(
            'H1',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=15,
            textColor=colors.HexColor("#1E3A8A"),
            spaceBefore=15,
            spaceAfter=10
        )

        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9.5,
            textColor=colors.HexColor("#1F2937"),
            spaceAfter=8
        )

        code_style = ParagraphStyle(
            'Code',
            parent=styles['Normal'],
            fontName='Courier',
            fontSize=8,
            textColor=colors.HexColor("#111827"),
            backColor=colors.HexColor("#F3F4F6"),
            borderPadding=8,
            spaceAfter=10,
            leading=10
        )

        th_style = ParagraphStyle(
            'TableHeader',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9.5,
            textColor=colors.white,
            alignment=1 # Center
        )

        td_style = ParagraphStyle(
            'TableCell',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            textColor=colors.HexColor("#1F2937")
        )

        story = []

        # Header Block
        story.append(Paragraph("AI-DRIVEN NETWORK COMPLIANCE REPORT", title_style))
        story.append(Paragraph("Automated Vendor-Agnostic Security Audit & Remediation Guide", subtitle_style))
        story.append(Spacer(1, 10))

        # Device Info & Summary Card Layout
        device_info = data.get("device_info", {})
        score = data.get("compliance_score", 0.0)

        # Decide score color
        if score >= 80:
            score_color = colors.HexColor("#16A34A")  # Green
            score_text = "COMPLIANT"
        elif score >= 50:
            score_color = colors.HexColor("#EA580C")  # Orange
            score_text = "PARTIALLY COMPLIANT"
        else:
            score_color = colors.HexColor("#DC2626")  # Red
            score_text = "NON-COMPLIANT"

        summary_data = [
            [
                Paragraph("<b>Device Identification</b>", td_style),
                Paragraph("<b>Audit Score Summary</b>", td_style)
            ],
            [
                Paragraph(f"""
                <b>Hostname:</b> {device_info.get('hostname') or 'N/A'}<br/>
                <b>Vendor:</b> {device_info.get('vendor') or 'Generic'}<br/>
                <b>Model:</b> {device_info.get('model') or 'Unknown'}<br/>
                <b>OS Version:</b> {device_info.get('os_version') or 'Unknown'}<br/>
                <b>Serial No:</b> {device_info.get('serial_number') or 'Unknown'}
                """, td_style),
                Paragraph(f"""
                <font size="32" color="{score_color}"><b>{score}%</b></font><br/>
                <font color="{score_color}"><b>{score_text}</b></font><br/><br/>
                <b>Total Audits Checked:</b> {data.get('total_rules')}<br/>
                <b>Passed Audits:</b> {data.get('passed_rules_count')}<br/>
                <b>Failed Audits:</b> {data.get('failed_rules_count')}
                """, td_style)
            ]
        ]

        summary_table = Table(summary_data, colWidths=[3.25 * inch, 3.25 * inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (1, 0), colors.HexColor("#E5E7EB")),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#D1D5DB")),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ]))
        story.append(summary_table)
        story.append(Spacer(1, 20))

        # Compliance Findings Section
        story.append(Paragraph("Detailed Compliance Findings", h1_style))
        story.append(Paragraph("The following table lists the security baseline checks performed against selected frameworks (CIS, NIST SP 800-53, DISA STIGs, ISO/IEC 27001):", body_style))
        story.append(Spacer(1, 5))

        findings_headers = [
            Paragraph("<b>ID</b>", th_style),
            Paragraph("<b>Control Check</b>", th_style),
            Paragraph("<b>Framework</b>", th_style),
            Paragraph("<b>Severity</b>", th_style),
            Paragraph("<b>Status</b>", th_style)
        ]
        
        findings_data = [findings_headers]

        for res in data.get("results", []):
            status_text = res.get("status", "Fail")
            sev_text = res.get("severity", "Medium")
            
            # Status badge color
            if status_text == "Pass":
                status_color = "#16A34A" # Green
            else:
                status_color = "#DC2626" # Red
                
            # Severity badge color
            if sev_text == "Critical":
                sev_color = "#7F1D1D"
            elif sev_text == "High":
                sev_color = "#B91C1C"
            elif sev_text == "Medium":
                sev_color = "#C2410C"
            else:
                sev_color = "#4B5563"

            findings_data.append([
                Paragraph(f"<b>{res.get('id')}</b>", td_style),
                Paragraph(f"<b>{res.get('name')}</b><br/><font color='#4B5563'>{res.get('description')}</font>", td_style),
                Paragraph(res.get("benchmark"), td_style),
                Paragraph(f"<font color='{sev_color}'><b>{sev_text}</b></font>", td_style),
                Paragraph(f"<font color='{status_color}'><b>{status_text.upper()}</b></font>", td_style)
            ])

        findings_table = Table(findings_data, colWidths=[0.8 * inch, 3.2 * inch, 0.9 * inch, 0.8 * inch, 0.8 * inch])
        findings_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1E3A8A")),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F9FAFB")]),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(findings_table)
        story.append(Spacer(1, 20))

        # Remediation Section
        remediations = []
        for res in data.get("results", []):
            if res.get("status") == "Fail" and res.get("remediation"):
                remediations.append(res.get("remediation"))

        if remediations:
            story.append(PageBreak())
            story.append(Paragraph("Actionable Remediation CLI Script", h1_style))
            story.append(Paragraph("Execute the following command sequences on the device console/terminal to resolve the identified security non-compliance issues and harden the configurations:", body_style))
            story.append(Spacer(1, 5))
            
            # Combine all failed remediations into a clean CLI output script
            remediation_script = f"! --- AUTOMATED REMEDIATION CLI SCRIPT FOR {device_info.get('vendor', 'GENERIC').upper()} ---\n"
            remediation_script += f"! Hostname: {device_info.get('hostname') or 'N/A'}\n"
            remediation_script += f"! Generated: 2026-08-27\n\n"
            
            if device_info.get("vendor", "").lower() == "juniper":
                remediation_script = remediation_script.replace("!", "#")
                remediation_script += "configure\n\n"
                for rem in remediations:
                    remediation_script += f"{rem}\n"
                remediation_script += "\ncommit check\n# If check succeeds, execute: commit and-quit\n"
            else:
                # Cisco
                remediation_script += "configure terminal\n\n"
                for rem in remediations:
                    remediation_script += f"{rem}\n"
                remediation_script += "\nend\nwrite memory\n"

            story.append(Paragraph(remediation_script.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_style))

        # Build PDF
        doc.build(story)
        return self.filename
