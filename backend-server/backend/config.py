import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE_DIR = BASE_DIR / "storage"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)
(STORAGE_DIR / "captcha").mkdir(parents=True, exist_ok=True)


def _default_sqlite_url() -> str:
    db_path = (STORAGE_DIR / "platform.db").resolve()
    as_posix = db_path.as_posix()
    return f"sqlite:///{as_posix}"


def _normalize_database_url(url: str) -> str:
    url = (url or "").strip()
    if not url:
        return _default_sqlite_url()
    if not url.startswith("sqlite"):
        return url
    raw = url.replace("sqlite:///", "", 1).replace("\\", "/")
    if raw.startswith("./") or (not raw.startswith("/") and not (len(raw) > 1 and raw[1] == ":")):
        abs_path = (BASE_DIR / raw.lstrip("./")).resolve().as_posix()
        return f"sqlite:///{abs_path}"
    try:
        Path(raw).parent.mkdir(parents=True, exist_ok=True)
    except Exception:
        pass
    return f"sqlite:///{raw}"


SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

DATABASE_URL = _normalize_database_url(os.getenv("DATABASE_URL", _default_sqlite_url()))
STORAGE_DIR = str(STORAGE_DIR)

BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000")

DEFAULT_POINTS = int(os.getenv("DEFAULT_POINTS", "100000"))
POINTS_PER_COMMAND = int(os.getenv("POINTS_PER_COMMAND", "1"))
MAX_EXEC_SECONDS = int(os.getenv("MAX_EXEC_SECONDS", "160"))

TELEGRAM_API_ROOT = os.getenv("TELEGRAM_API_ROOT", "https://api.telegram.org").rstrip("/")
