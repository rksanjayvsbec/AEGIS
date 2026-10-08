# Aegis Network Security Compliance Auditor 🛡️
### AI-Driven Multi-Vendor Network Compliance Auditor (SIH 2026 - Problem Statement 155)

Aegis is an AI-augmented, vendor-agnostic Network Security Compliance Auditor designed to automate and simplify cybersecurity audits for complex enterprise networks consisting of heterogeneous, multi-vendor hardware (Cisco, Juniper, Palo Alto, Arista, SONiC, etc.). 

It translates proprietary configuration syntaxes into standard structures, audits configurations against leading frameworks (CIS, NIST, DISA STIGs, ISO 27001), offers interactive training interfaces (the low-code dynamic learning loop), and compiles actionable compliance reports with PDF printing.

---

## 🚀 Key Features

1. **Unified Ingestion Dashboard**: Ingest raw config files (`.cfg`, `.conf`, `.txt`, `.xml`) in single or bulk batches, or audit running devices live via SSH connection.
2. **AI-Powered Parser (Dual-Engine)**:
   - **Local Pattern & NLP Classifier**: Normalizes configurations using regular expression mapping heuristics combined with a lightweight text categorizer. Works completely offline.
   - **Generative AI Extractor (Optional)**: Uses Google Gemini models for structured data normalization of complex vendor-specific configurations.
3. **Interactive Heuristic Training Loop**: A dedicated GUI allowing administrators to view unrecognized CLI commands, map them to standard parameters, and update the parsing engine instantly without code modifications or service restarts.
4. **Multi-Framework Evaluator**: Scores configurations against CIS Benchmarks, NIST SP 800-53, DISA STIG, and ISO/IEC 27001 parameters.
5. **Actionable PDF Reports**: Generates professional PDF reports via ReportLab containing an executive compliance score gauge, detailed compliance findings, and copy-paste ready vendor-specific CLI remediation scripts.

---

## 🛠️ Project Structure

```text
sih project/
├── backend/
│   ├── main.py                 # FastAPI Application Routing Entrypoint
│   ├── config.py               # Settings and Environment Configuration
│   ├── heuristics.json         # Dynamically updated user-trained command mappings
│   ├── records.json            # Flat-file database storage for scan results
│   ├── parsers/
│   │   ├── base_parser.py      # Unified SecurityBaseline Pydantic Schema
│   │   ├── rules_parser.py     # Local pattern matcher, NLP mapping classifier
│   │   └── gemini_parser.py    # Optional Gemini-powered Normalization engine
│   ├── compliance/
│   │   ├── benchmarks.py       # Security rules definition (CIS, NIST, STIG, ISO)
│   │   └── evaluator.py        # Compliance check evaluator scoring logic
│   ├── reports/
│   │   └── pdf_generator.py    # ReportLab PDF report generation engine
│   ├── samples/                # Sample non-compliant configuration files
│   │   ├── cisco_ios.cfg
│   │   └── juniper_junos.conf
│   └── requirements.txt        # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Main layout, tabs navigation and State manager
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx   # Visual statistics overview & devices inventory list
│   │   │   ├── Ingestion.tsx   # File uploads & live SSH credentials interface
│   │   │   ├── Training.tsx    # Low-code training dashboard mapping unrecognized lines
│   │   │   ├── Reports.tsx     # Policy details findings page & terminal script copy
│   │   │   └── Settings.tsx    # Integration settings & frameworks guide
│   │   └── index.css           # Styling directives
│   ├── index.html
│   ├── package.json            # Node JS package dependencies
│   └── vite.config.ts          # Vite build environment settings with backend proxy
├── run.sh                      # Unified execution launcher (installs and runs both servers)
├── ARCHITECTURE.md             # Core architecture diagram & technical design document
└── PRESENTATION.md             # Technical Pitch slides outline
```

---

## ⚙️ Setup and Installation

### Prerequisites
- Python 3.9+ (with pip)
- Node.js v16+ (with npm)

### Quick Start (One-Click Runner)
The repository includes a unified shell script that automates dependency installations and starts both the FastAPI backend and React frontend concurrently.

1. Open your terminal and navigate to the project directory.
2. Run the startup script:
   ```bash
   ./run.sh
   ```
3. Access the interfaces:
   - **Administrative Web Portal**: `http://localhost:5173`
   - **FastAPI Interactive API Swagger Docs**: `http://localhost:8000/docs`

---

## 💡 Step-by-Step Demo Walkthrough

### 1. Ingest configuration files
- Go to the **Device Ingestion** tab.
- Choose a mock configuration to upload from `backend/samples/`:
  - `cisco_ios.cfg` (representative of a misconfigured Cisco Catalyst core switch).
  - `juniper_junos.conf` (representative of a Juniper SRX firewall running curly-brace hierarchical config).
- Leave "Target Vendor" as **Generic (Auto-Detect)**.
- Choose the compliance benchmarks you want to scan.
- Click **Upload/Drag** or upload the file.
- The auditor will automatically analyze the file, evaluate rules, and open the detailed report.

*Alternatively, test live SSH querying by using Host: `127.0.0.1`, Username: `mock`, Password: `any`, and clicking "Connect & Audit Device".*

### 2. View Compliance Findings & Remediation
- Review the compliance score (e.g. `20%` for failing multiple standard checks).
- Scroll down the list of findings to see exactly what parameters failed (e.g. Telnet service allowed on Cisco VTY line).
- Inspect the right pane containing the **Actionable CLI Remediation Script** customized for that vendor platform (`configure terminal` block for Cisco, or `set` commit-check block for Juniper). Click **Copy Script** to grab the commands.

### 3. Dynamic Learning via the Training Loop
- Go to the **Interactive Heuristics** tab.
- Under **Ingested Unrecognized Commands**, you will see CLI commands that the parsing engine flagged as security-relevant but could not extract (e.g. `snmp-server community public RO` or `username admin privilege 15 password adminpassword`).
- Beside `snmp-server community public RO`, click **Map**.
- The low-code editor will pre-fill.
- Change the target parameter to: **SNMP v3 Restricted Only (bool)**.
- Set the mapping value to: **false** (since legacy SNMP v1/v2 communities are active).
- Click **Apply & Retrain**.
- The engine writes the mapping template dynamically to `heuristics.json`, re-evaluates all uploaded configurations in real-time, and refreshes the database. 
- Go back to the dashboard and open the device report. You will see that the compliance checks score has updated because the engine now understands that command!

### 4. Enable Google Gemini (Optional)
- Go to the **System Settings** tab.
- Input your Google Gemini API Key and click **Save Gemini Settings**.
- Re-upload any configuration file. The backend will now leverage Gemini model structured prompts to extract variables and construct advanced, highly detailed hardening remediation scripts!

### 5. Connect MongoDB Backend (Local or Cloud Atlas)
- Aegis supports high-throughput persistence using **MongoDB** via asynchronous `motor` and `pymongo`:
  - **Option A (Via Settings UI)**: Navigate to **Settings** > **MongoDB Backend Cluster**, input your connection URI (e.g. `mongodb://127.0.0.1:27017` or MongoDB Atlas `mongodb+srv://...`), test latency, and click **Save & Connect**.
  - **Option B (Via Environment File)**: Copy `.env.example` to `.env` and set:
    ```bash
    MONGODB_URI=mongodb://127.0.0.1:27017
    # Or MongoDB Atlas:
    # MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
    MONGODB_DB_NAME=aegis_auditor
    ```
- **Resilient Fallback**: If MongoDB is not running or temporarily offline, Aegis operates seamlessly in **Local File Fallback Mode** (`records.json` and `heuristics.json`), ensuring zero-downtime audits.
- **One-Click Data Migration**: Click **"Migrate to MongoDB"** in Settings to instantly sync existing local file records and heuristics into your MongoDB cluster.
