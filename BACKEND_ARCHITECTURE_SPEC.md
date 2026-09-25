# TeleBot Studio & Engine — Complete Backend Architecture Specification (A to Z)

> **Purpose of this document:**  
> This document provides an exhaustive, production-grade technical specification for building the complete backend for the TeleBot Platform. Any AI or software engineer can read this document and implement the full backend system from scratch without ambiguity.

---

## Table of Contents
1. [System Overview & Architecture](#1-system-overview--architecture)
2. [Tech Stack Recommendation](#2-tech-stack-recommendation)
3. [Database Schema (PostgreSQL + Prisma/Drizzle)](#3-database-schema)
4. [Authentication & Email OTP System](#4-authentication--email-otp-system)
5. [Telegram Bot Engine Architecture](#5-telegram-bot-engine-architecture)
6. [High-Performance Multi-Bot Broadcast Worker](#6-high-performance-multi-bot-broadcast-worker)
7. [RESTful API Endpoints Specification](#7-restful-api-endpoints-specification)
8. [Real-time Events (WebSockets / SSE)](#8-real-time-events)
9. [Bot Sandboxing & Command Execution](#9-bot-sandboxing--command-execution)
10. [Docker Compose & Deployment Architecture](#10-docker-compose--deployment-architecture)

---

## 1. System Overview & Architecture

TeleBot Studio is a centralized, cloud-native Telegram Bot management, development, and mass broadcast distribution platform. It enables users to:
- Connect multiple Telegram Bots via API Token (`@BotFather`).
- Develop, customize, and execute commands, custom handlers, and workflows with category folders.
- Persist bot-specific key-value database records and secure environment variables.
- Execute synchronized mass broadcasts across multiple bots with audience targeting limits, real-time live per-bot delivery metrics, and pause/resume/clean capabilities.
- Share or transfer bots between users with verification codes.
- Explore and fork bots from a public Bot Store community marketplace.

### Architecture Diagram
```
+-------------------------------------------------------------+
|                      React SPA Client                       |
+-------------------------------------------------------------+
                              | HTTPS / WSS
                              v
+-------------------------------------------------------------+
|                   API Gateway / Express Server              |
|        (Auth, Bot Orchestration, CRUD, Broadcast API)       |
+-------------------------------------------------------------+
            |                          |                  |
            v                          v                  v
+-----------------------+   +-------------------+  +-------------------+
|  PostgreSQL Database  |   |   Redis Cluster   |  |   BullMQ Queue    |
| (Users, Bots, State)  |   | (Cache, Pub/Sub)  |  | (Broadcast Tasks) |
+-----------------------+   +-------------------+  +-------------------+
                                                          |
                                                          v
                                            +---------------------------+
                                            |   Broadcast Worker Pool   |
                                            | (Multi-Bot Dispatch Rate  |
                                            |  Limiter: 30 msgs/sec)    |
                                            +---------------------------+
                                                          |
                                                          v
                                            +---------------------------+
                                            |     Telegram Bot API      |
                                            |   (api.telegram.org)      |
                                            +---------------------------+
```

---

## 2. Tech Stack Recommendation

- **Language & Runtime:** Node.js (v20+ LTS) with TypeScript or Python 3.12 (FastAPI).
- **Web Framework:** Express.js / Fastify (Node.js) or FastAPI (Python).
- **ORM / Database Access:** Prisma ORM or Drizzle ORM for PostgreSQL.
- **Relational Database:** PostgreSQL 15+ (acid transactions, JSONB support for rich Telegram structures).
- **Key-Value Store & Queue:** Redis 7+ for caching, session stores, distributed locks, and BullMQ task queues.
- **Telegram Bot SDK:** `grammY` (preferred for Node.js due to high performance and plugin ecosystem) or `Telegraf` / `aiogram` (Python).
- **Email Delivery (OTP):** Resend, SendGrid, or Nodemailer (SMTP) for 6-digit email verification codes.
- **Security & Cryptography:** `bcryptjs` / `argon2` for passwords; `crypto` (AES-256-GCM) for bot token encryption at rest.

---

## 3. Database Schema

### 3.1 User & Auth Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(120) NOT NULL,
    avatar_url VARCHAR(500),
    plan VARCHAR(50) DEFAULT 'Creator Pro Node',
    is_email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE email_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_email_otps_lookup ON email_otps(email, code, is_used);
```

### 3.2 Bots Table
```sql
CREATE TABLE bots (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_encrypted TEXT NOT NULL,
    token_mask VARCHAR(20) NOT NULL, -- e.g. 718293****:AAH...
    name VARCHAR(120) NOT NULL,
    username VARCHAR(120) NOT NULL,
    status VARCHAR(20) DEFAULT 'working', -- 'working' | 'stopped' | 'error'
    ping_ms INTEGER DEFAULT 18,
    total_commands INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    total_sent INTEGER DEFAULT 0,
    uptime_pct NUMERIC(5, 2) DEFAULT 99.98,
    is_favorite BOOLEAN DEFAULT FALSE,
    memory_mb INTEGER DEFAULT 64,
    cpu_pct NUMERIC(4, 1) DEFAULT 0.5,
    description TEXT,
    version VARCHAR(20) DEFAULT 'v1.0.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_bots_user ON bots(user_id);
```

### 3.3 Bot Folders & Commands Tables
```sql
CREATE TABLE bot_folders (
    id VARCHAR(50) PRIMARY KEY,
    bot_id VARCHAR(50) REFERENCES bots(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) DEFAULT 'Folder',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bot_commands (
    id VARCHAR(50) PRIMARY KEY,
    bot_id VARCHAR(50) REFERENCES bots(id) ON DELETE CASCADE,
    folder_id VARCHAR(50) REFERENCES bot_folders(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL, -- e.g. /start, /help
    description TEXT,
    code_snippet TEXT NOT NULL,
    response_type VARCHAR(50) DEFAULT 'text', -- 'text' | 'inline_keyboard' | 'custom_code'
    aliases JSONB DEFAULT '[]'::jsonb, -- e.g. ["/help", "/support"]
    is_pinned BOOLEAN DEFAULT FALSE,
    is_in_trash BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    run_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_bot_commands_bot ON bot_commands(bot_id, is_in_trash);
```

### 3.4 Bot Environment Variables & Database Keys
```sql
CREATE TABLE bot_env_vars (
    id VARCHAR(50) PRIMARY KEY,
    bot_id VARCHAR(50) REFERENCES bots(id) ON DELETE CASCADE,
    key VARCHAR(120) NOT NULL,
    value_encrypted TEXT NOT NULL,
    is_secret BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(bot_id, key)
);

CREATE TABLE bot_db_records (
    id VARCHAR(50) PRIMARY KEY,
    bot_id VARCHAR(50) REFERENCES bots(id) ON DELETE CASCADE,
    record_key VARCHAR(255) NOT NULL,
    record_value JSONB NOT NULL,
    value_type VARCHAR(20) DEFAULT 'string', -- 'string' | 'number' | 'json' | 'boolean'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(bot_id, record_key)
);
```

### 3.5 Broadcast Campaigns & Per-Bot Details
```sql
CREATE TABLE broadcast_campaigns (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    target_bot_ids JSONB NOT NULL, -- array of bot IDs
    target_bot_usernames JSONB NOT NULL,
    message_type VARCHAR(30) DEFAULT 'Text',
    message_text TEXT NOT NULL,
    parse_mode VARCHAR(20) DEFAULT 'HTML',
    inline_buttons JSONB DEFAULT '[]'::jsonb,
    language_filter VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Active', -- 'Active' | 'Done' | 'Paused' | 'Failed'
    target_user_limit INTEGER, -- null for unlimited/all
    total_target_users INTEGER NOT NULL DEFAULT 0,
    sent_count INTEGER NOT NULL DEFAULT 0,
    in_progress_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    cleaned_failed BOOLEAN DEFAULT FALSE,
    delivery_speed VARCHAR(50) DEFAULT '30 msgs/sec',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE broadcast_bot_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broadcast_id VARCHAR(50) REFERENCES broadcast_campaigns(id) ON DELETE CASCADE,
    bot_id VARCHAR(50) REFERENCES bots(id) ON DELETE CASCADE,
    bot_name VARCHAR(120) NOT NULL,
    bot_username VARCHAR(120) NOT NULL,
    target_count INTEGER NOT NULL DEFAULT 0,
    sent_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Delivering', -- 'Delivering' | 'Done' | 'Paused' | 'Failed'
    speed VARCHAR(50) DEFAULT '30 msgs/sec',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(broadcast_id, bot_id)
);

CREATE TABLE broadcast_failed_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broadcast_id VARCHAR(50) REFERENCES broadcast_campaigns(id) ON DELETE CASCADE,
    bot_id VARCHAR(50) REFERENCES bots(id) ON DELETE CASCADE,
    telegram_id VARCHAR(50) NOT NULL,
    name VARCHAR(120),
    username VARCHAR(120),
    error_reason TEXT NOT NULL,
    failed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Authentication & Email OTP System

### 4.1 Flow
1. **Initiate Registration:**  
   Client posts `{ name, email, password }` to `/api/auth/register-init`.
2. **OTP Generation & Sending:**  
   Backend generates a secure 6-digit number (e.g. `crypto.randomInt(100000, 999999)`), stores it in `email_otps` with a 10-minute expiry, and dispatches an HTML email to the user's Gmail address.
3. **Verify Code & Create Account:**  
   Client posts `{ email, code, name, password }` to `/api/auth/verify-otp-register`.  
   Backend verifies:
   - Record exists where `email = input.email`, `code = input.code`, `is_used = false`, `expires_at > now()`.
   - Hashes password using `bcrypt` (12 rounds) or `argon2id`.
   - Creates the `users` row with `is_email_verified = true`.
   - Generates JWT access token (1 day) and refresh token (30 days).
   - Marks OTP as used.

---

## 5. Telegram Bot Engine Architecture

### 5.1 Dynamic Bot Lifecycle
Each active bot in the database is dynamically spawned in memory:
```typescript
import { Bot } from 'grammy';

class BotManager {
  private activeBots = new Map<string, Bot>();

  async startBot(botId: string, decryptedToken: string) {
    if (this.activeBots.has(botId)) return;
    const bot = new Bot(decryptedToken);

    // Register dynamic commands from DB
    await this.registerCommands(botId, bot);

    // Start long-polling or register webhook
    bot.start({
      onStart: (info) => console.log(`Bot @${info.username} started`),
    });

    this.activeBots.set(botId, bot);
  }

  async stopBot(botId: string) {
    const bot = this.activeBots.get(botId);
    if (bot) {
      await bot.stop();
      this.activeBots.delete(botId);
    }
  }
}
```

---

## 6. High-Performance Multi-Bot Broadcast Worker

### 6.1 Multi-Bot Partitioning Strategy
When user creates a broadcast targeting multiple bots:
1. Divide `targetUserLimit` evenly among chosen bots (e.g. 10,000 target / 4 bots = 2,500 users per bot).
2. Insert a row in `broadcast_bot_stats` for each bot.
3. Push chunked jobs into BullMQ with rate-limiters:
   - **Telegram Rate Limits:** Maximum 30 messages per second per bot instance.
   - Respect `retry_after` header on HTTP 429 Flood Wait errors.
4. **Pause / Resume Functionality:**  
   When a user clicks "Pause Campaign", update DB status to `'Paused'` and pause the BullMQ queue corresponding to `broadcast_id`. Clicking "Resume Campaign" unpauses the queue.
5. **Live Per-Bot Status:**  
   Each message success or failure increments `sent_count` or `failed_count` in `broadcast_bot_stats` and `broadcast_campaigns` in Redis, broadcasting updates over WebSocket.

---

## 7. RESTful API Endpoints Specification

### Auth Endpoints
- `POST /api/auth/send-otp`  
  Request: `{ email: string }`  
  Response: `{ success: true, message: "Code sent" }`

- `POST /api/auth/verify-otp-register`  
  Request: `{ name: string, email: string, password: string, code: string }`  
  Response: `{ token: string, user: UserProfile }`

- `POST /api/auth/login`  
  Request: `{ email: string, password: string }`  
  Response: `{ token: string, user: UserProfile }`

### Bot Endpoints
- `GET /api/bots` — List user's bots.
- `POST /api/bots` — Connect new bot by Telegram Token (`token`).
- `GET /api/bots/:id` — Get bot details, commands, metrics.
- `PATCH /api/bots/:id` — Update bot settings (name, description).
- `POST /api/bots/:id/start` — Start bot worker.
- `POST /api/bots/:id/stop` — Stop bot worker.
- `DELETE /api/bots/:id` — Move bot to Recycle Bin or permanent delete.

### Commands Endpoints
- `GET /api/bots/:id/commands` — Get commands for bot.
- `POST /api/bots/:id/commands` — Create a new command.
- `PUT /api/bots/:id/commands/:cmdId` — Update command name, code, folder.
- `POST /api/bots/:id/commands/trash` — Move commands to Archive Bin.
- `POST /api/bots/:id/commands/restore` — Restore commands from Archive Bin.
- `DELETE /api/bots/:id/commands/permanent` — Permanently delete commands.

### Broadcast Endpoints
- `GET /api/broadcasts` — List all campaigns with pagination.
- `POST /api/broadcasts` — Dispatch new broadcast (supports multi-bot and target user limit).
- `GET /api/broadcasts/:id` — Full details with aggregate and per-bot stats.
- `POST /api/broadcasts/:id/pause` — Pause active campaign.
- `POST /api/broadcasts/:id/resume` — Resume paused campaign.
- `DELETE /api/broadcasts/:id` — Delete broadcast campaign.
- `POST /api/broadcasts/:id/clean-failed` — Clean and purge failed recipient entries.

---

## 8. Real-time Events (WebSockets / SSE)

Path: `wss://yourdomain.com/ws/telemetry`

**Events Sent to Client:**
1. `broadcast:progress`: `{ broadcastId, sentCount, progressPct, botStats: [...] }`
2. `bot:status`: `{ botId, status: 'working' | 'stopped', pingMs: 14 }`
3. `command:executed`: `{ botId, commandName, executionTimeMs }`

---

## 9. Bot Sandboxing & Command Execution

Custom command codes (e.g. JavaScript or Python scripts entered in Bot Studio) are evaluated inside an isolated sandbox using `isolated-vm` (Node.js) or a containerized worker pool:
```typescript
import ivm from 'isolated-vm';

export async function executeUserCode(code: string, context: { text: string; userId: number }) {
  const isolate = new ivm.Isolate({ memoryLimit: 64 });
  const ivmContext = await isolate.createContext();
  const jail = ivmContext.global;
  await jail.set('global', jail.derefInto());

  // Inject Telegram message context
  await jail.set('ctx', new ivm.ExternalCopy(context).copyInto());

  const script = await isolate.compileScript(code);
  return await script.run(ivmContext, { timeout: 2000 });
}
```

---

## 10. Docker Compose & Deployment

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_DB: telebot_studio
      POSTGRES_USER: telebot_user
      POSTGRES_PASSWORD: secure_postgres_password
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

  api-server:
    build: .
    restart: always
    ports:
      - "4000:4000"
    environment:
      PORT: 4000
      DATABASE_URL: "postgresql://telebot_user:secure_postgres_password@postgres:5432/telebot_studio?schema=public"
      REDIS_URL: "redis://redis:6379"
      JWT_SECRET: "your_super_secret_jwt_key_here"
      ENCRYPTION_KEY: "32_byte_aes_encryption_key_here"
      RESEND_API_KEY: "re_your_resend_api_key_here"
    depends_on:
      - postgres
      - redis

volumes:
  pgdata:
  redisdata:
```

This completes the exhaustive specifications from A to Z for constructing the entire backend.
