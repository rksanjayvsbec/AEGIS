import os

# Try loading .env from project root or backend directory if present
def _load_env():
    for env_path in [
        os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"),
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
    ]:
        if os.path.exists(env_path):
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            k = k.strip()
                            v = v.strip().strip("'\"")
                            if k and k not in os.environ:
                                os.environ[k] = v
            except Exception:
                pass

_load_env()

is_vercel = bool(os.environ.get("VERCEL"))

class Settings:
    app_name: str = "AI Network Security Compliance Auditor"
    app_version: str = "1.0.0"
    heuristics_path: str = "/tmp/heuristics.json" if is_vercel else os.path.join(os.path.dirname(os.path.abspath(__file__)), "heuristics.json")
    reports_dir: str = "/tmp/generated_reports" if is_vercel else os.path.join(os.path.dirname(os.path.abspath(__file__)), "generated_reports")
    gemini_api_key: str = os.environ.get("GEMINI_API_KEY", "")
    mongodb_uri: str = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
    mongodb_db_name: str = os.environ.get("MONGODB_DB_NAME", "aegis_auditor")

settings = Settings()

# Seed /tmp/heuristics.json in Vercel if needed
if is_vercel:
    try:
        base_heuristics = os.path.join(os.path.dirname(os.path.abspath(__file__)), "heuristics.json")
        if os.path.exists(base_heuristics) and not os.path.exists(settings.heuristics_path):
            with open(base_heuristics, "r") as src, open(settings.heuristics_path, "w") as dst:
                dst.write(src.read())
    except Exception:
        pass

# Ensure reports directory exists
try:
    os.makedirs(settings.reports_dir, exist_ok=True)
except Exception:
    pass
