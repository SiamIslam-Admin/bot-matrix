#!/usr/bin/env python3
"""One-command launcher for BOT MATRIX platform."""
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))


def ensure_env_file():
    env_path = os.path.join(ROOT, ".env")
    example_path = os.path.join(ROOT, ".env.example")
    if not os.path.exists(env_path) and os.path.exists(example_path):
        with open(example_path, "r") as src, open(env_path, "w") as dst:
            dst.write(src.read())
        print("[setup] Created .env from .env.example")


def ensure_dependencies():
    required = (
        "fastapi", "uvicorn", "sqlalchemy", "pydantic", "jose", "passlib",
        "multipart", "requests", "apscheduler", "dotenv", "aiosqlite",
        "email_validator",
    )
    missing = []
    for module in required:
        try:
            __import__(module)
        except ImportError:
            missing.append(module)
    if missing:
        print("[setup] Installing: " + ", ".join(missing))
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", os.path.join(ROOT, "requirements.txt")])


def main():
    ensure_env_file()
    ensure_dependencies()
    os.makedirs(os.path.join(ROOT, "storage"), exist_ok=True)
    import uvicorn
    sys.path.insert(0, ROOT)
    port = int(os.environ.get("PORT", "8000"))
    host = os.environ.get("HOST", "0.0.0.0")
    reload = os.environ.get("RELOAD", "false").lower() in ("1", "true", "yes")
    print(f"\n  BOT MATRIX Platform starting at http://{host}:{port}\n")
    uvicorn.run("backend.main:app", host=host, port=port, reload=reload, app_dir=ROOT)


if __name__ == "__main__":
    main()
