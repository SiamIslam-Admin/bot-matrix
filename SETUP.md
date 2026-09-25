# BOT MATRIX — Complete Setup (Frontend + Backend)

একটাই প্রজেক্টে সব আছে।

## ফোল্ডার স্ট্রাকচার

```
bot-matrix/
├── src/                      # React ফ্রন্টএন্ড (সব পেজ)
│   ├── components/           # Dashboard, Bots, Studio, Broadcast, Chats, Settings...
│   ├── services/apiService.ts  # শুধু backend API (মক ডাটা নেই)
│   └── ...
├── backend-server/           # FastAPI ব্যাকএন্ড (ZIP-এর সব ফাংশন)
│   ├── backend/
│   │   ├── routers/          # bots, webhook, commands, matrix_api, broadcast...
│   │   ├── sandbox/          # বট কোড এক্সিকিউশন + libs
│   │   ├── telegram/         # Telegram Bot API wrapper
│   │   └── ...
│   ├── run.py
│   ├── Dockerfile
│   └── requirements.txt
├── package.json
├── vite.config.ts            # /api → backend proxy
└── SETUP.md
```

## চালানো

### ১. ব্যাকএন্ড
```bash
cd backend-server
cp .env.example .env
# SECRET_KEY ও BASE_URL এডিট করুন
pip install -r requirements.txt
python run.py
# → http://127.0.0.1:8000
```

### ২. ফ্রন্টএন্ড
```bash
# রিপো রুটে
npm install   # বা bun install
npm run dev
# → http://127.0.0.1:5173  (/api প্রক্সি করে backend-এ)
```

## সিকিউরিটি
- JWT Bearer token (`localStorage.access_token`)
- 401 হলে অটো লগআউট
- Password bcrypt
- Bot token DB-তে, লিস্টে শুধু mask
- CORS env দিয়ে কন্ট্রোল
- Client metadata লগইন/রেজিস্টারে সেভ

## পেজ → API ম্যাপিং
| পেজ | API |
|------|-----|
| Login/Register | POST /api/auth/login, /register, /register/send-otp |
| My Bots | GET/POST /api/bots, toggle-status |
| Bot Studio | /api/bots/{id}/commands |
| Chats | GET /api/chats/{botId} |
| Broadcast | /api/broadcasts |
| Database | /api/database/{botId} |
| Store | /api/store/bots |
| Settings | /api/settings |
| Notifications | /api/notifications |
| Error logs | /api/bots/{id}/logs |

## ডিপ্লয়
`backend-server/DEPLOY.md` দেখুন (Railway / Render / VPS Docker)।
`BASE_URL` অবশ্যই পাবলিক HTTPS হতে হবে (Telegram webhook)।
