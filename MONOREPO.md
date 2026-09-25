# BOT MATRIX — Single Project (Frontend + Backend)

## Structure
```
bot-matrix/
├── src/                    # React frontend — ALL pages
│   ├── components/         # Dashboard, Bots, Studio, Broadcast, Settings, ...
│   ├── services/apiService.ts
│   └── ...
├── backend-server/         # FastAPI + Telegram bot engine
│   ├── backend/            # Python package
│   ├── run.py
│   ├── Dockerfile
│   └── requirements.txt
├── package.json            # Frontend
└── server.ts               # Optional legacy mock (can remove later)
```

## Run
1. Backend: `cd backend-server && python run.py` → http://127.0.0.1:8000
2. Frontend: `npm run dev` → proxy `/api` to backend

All bot pages, auth, chats, broadcast, database, settings are in `src/components/`.
All real bot execution, webhooks, error logs are in `backend-server/`.
