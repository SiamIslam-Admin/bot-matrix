# BOT MATRIX Backend — Deploy Anywhere

This folder is the FastAPI backend. Frontend lives at repo root (`src/`).

## One project structure
```
bot-matrix/
  src/                 # React frontend (all pages)
  backend-server/      # Python FastAPI backend (this folder)
  package.json
```

## Run both locally
```bash
# Terminal 1 — backend
cd backend-server && python run.py

# Terminal 2 — frontend
npm install && npm run dev
```

## Railway / Render / VPS
See Dockerfile and docker-compose.yml in this folder.
Set SECRET_KEY, BASE_URL (HTTPS), CORS_ORIGINS.
