# 🤖 AI Workflow Automation Backend

A **production-grade, Zapier-like automation backend** built with Node.js, Express, PostgreSQL, Prisma, and BullMQ. Demonstrates event-driven architecture, async job processing, relational database design, and modular API design.

---

## 🏗️ Architecture Overview

```
External System
      │
      ▼
POST /api/v1/events          ← Event arrives (e.g. "user_signup")
      │
      ▼
Event Service                ← Persists event to PostgreSQL
      │
      ▼
Find matching Workflows      ← Queries DB by triggerType
      │
      ▼
BullMQ Queue (Redis)         ← Job pushed asynchronously
      │
      ▼
Worker Process               ← Picks up job (separate process)
      │
      ▼
Workflow Engine              ← Runs steps sequentially
      │
   ┌──┴──────────────┐
   │                 │
Email Handler    Webhook Handler   Delay Handler
(nodemailer)     (axios POST)      (sleep N sec)
   │
   ▼
ExecutionLog → PostgreSQL    ← Every step result saved
```

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL (via Prisma ORM) |
| Queue | BullMQ |
| Cache/Queue Backend | Redis (ioredis) |
| Auth | JWT + bcryptjs |
| Validation | Zod |
| Logging | Winston |
| HTTP Client | Axios |
| Email | Nodemailer |

---

## 📁 Project Structure

```
src/
 ├── config/          # DB, Redis, Env config
 ├── modules/
 │    ├── auth/       # Register, Login
 │    ├── user/       # Profile
 │    ├── workflow/   # CRUD workflows + steps
 │    ├── event/      # Trigger ingestion
 │    └── execution/  # Execution history + logs
 ├── services/
 │    ├── workflowEngine.js   # Core orchestration logic
 │    ├── queueService.js     # BullMQ queue management
 │    └── actionHandlers.js   # Email, Webhook, Delay
 ├── queues/
 │    ├── worker.js     # Standalone worker process
 │    └── processors.js # Job handler
 ├── middleware/        # Auth, Error, Rate limiter
 ├── utils/             # Logger, Helpers
 ├── routes/            # Central router
 └── app.js / index.js
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL running locally
- Redis running locally

### 1. Install

```bash
npm install
```

### 2. Configure

```bash
cp .env.example .env
# Edit .env with your DB and Redis credentials
```

### 3. Database Setup

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Start API Server

```bash
npm run dev
```

### 5. Start Worker (separate terminal)

```bash
npm run worker
```

---

## 📡 API Reference

### Auth

| Method | Endpoint | Body | Auth |
|---|---|---|---|
| POST | `/api/v1/auth/register` | `{ email, password }` | ❌ |
| POST | `/api/v1/auth/login` | `{ email, password }` | ❌ |
| GET | `/api/v1/users/me` | — | ✅ |

### Workflows

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/v1/workflows` | ✅ |
| GET | `/api/v1/workflows` | ✅ |
| GET | `/api/v1/workflows/:id` | ✅ |
| PUT | `/api/v1/workflows/:id` | ✅ |
| DELETE | `/api/v1/workflows/:id` | ✅ |

### Events (Trigger System)

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/v1/events` | ❌ (rate limited) |
| GET | `/api/v1/events` | ✅ |

### Executions

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/v1/executions/workflow/:workflowId` | ✅ |
| GET | `/api/v1/executions/:id` | ✅ |

### Health

```
GET /api/v1/health
```

---

## 🔁 Example: End-to-End Workflow

### 1. Register

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Password1"}'
```

### 2. Create a Workflow

```bash
curl -X POST http://localhost:3000/api/v1/workflows \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "User Signup Automation",
    "triggerType": "user_signup",
    "steps": [
      {
        "stepOrder": 1,
        "actionType": "email",
        "config": {
          "to": "{{email}}",
          "subject": "Welcome!",
          "body": "Hi, welcome aboard {{email}}!"
        }
      },
      {
        "stepOrder": 2,
        "actionType": "webhook",
        "config": {
          "url": "https://webhook.site/your-id",
          "method": "POST"
        }
      },
      {
        "stepOrder": 3,
        "actionType": "delay",
        "config": { "seconds": 5 }
      }
    ]
  }'
```

### 3. Fire an Event (triggers the workflow)

```bash
curl -X POST http://localhost:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{"type":"user_signup","payload":{"email":"newuser@test.com"}}'
```

**Response:** `202 Accepted` — job queued immediately

### 4. Check Execution Results

```bash
curl http://localhost:3000/api/v1/executions/workflow/<workflowId> \
  -H "Authorization: Bearer <token>"
```

---

## 🗄️ Database Schema

```
User ──< Workflow ──< WorkflowStep
              │
              └──< Execution ──< ExecutionLog

Event (stored independently, linked to Execution via eventId)
```

### Key Design Decisions

- **BCNF Normalized** — no redundancy, no anomalies
- **Cascade Deletes** — deleting a workflow removes its steps, executions, and logs
- **Indexed** — `triggerType`, `userId`, `status` all indexed for fast lookups
- **Prisma Transactions** — workflow + steps created atomically

---

## 🛡️ Security Features

- **bcryptjs** — passwords hashed with cost factor 12
- **JWT** — stateless auth, 7-day expiry
- **Helmet** — secure HTTP headers (XSS, HSTS, CSP)
- **Rate Limiting** — 3 tiers: API (100/15min), Auth (10/15min), Events (60/min)
- **Zod Validation** — all inputs validated before processing
- **Ownership Checks** — users can only access their own workflows

---

## 🧠 System Architecture Highlights

| Concept | Implementation |
|---|---|
| Event-Driven Architecture | `/events` endpoint triggers async workflow runs |
| Async Job Processing | BullMQ + Redis — API never blocks on heavy work |
| Queue Reliability | 3 retries with exponential backoff on failure |
| Graceful Shutdown | Worker drains active jobs before exiting |
| Modular Architecture | Each module (auth/workflow/event) is fully self-contained |
| Execution Observability | Every step result logged to PostgreSQL |
| Template Interpolation | Email/webhook config supports `{{payload_field}}` syntax |
| Horizontal Scalability | Run multiple worker processes for high throughput |

---

## 👨‍💻 Author

**Saad Arif**
- GitHub: [@Saad-Arif-20](https://github.com/Saad-Arif-20)
- LinkedIn: [@saad--arif](https://www.linkedin.com/in/saad--arif/)

Built with Node.js, Express, PostgreSQL, BullMQ, and Redis © 2026
