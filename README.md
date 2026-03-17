# CipherSQL Studio

A browser-based SQL learning platform where students can practice SQL queries against pre-configured assignments with real-time execution and AI-powered hints.

---

## Project Structure

```
ciphersql-studio/
├── frontend/          ← Next.js + SCSS
└── backend/           ← Node.js + Express
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js, SCSS, Redux Toolkit |
| Backend | Node.js, Express.js |
| Persistence DB | MongoDB Atlas |
| Sandbox DB | PostgreSQL (Supabase) |
| SQL Editor | Monaco Editor |
| AI Hints | OpenAI GPT-4o-mini |
| Auth | JWT (httpOnly cookies) |

---

## Architecture

```
User (Browser)
    │
    ├── Next.js Frontend
    │     ├── Redux Store (auth state)
    │     ├── Monaco Editor (SQL input)
    │     └── SCSS Styles
    │
    └── Express Backend
          ├── MongoDB Atlas         → assignments, users, progress
          └── PostgreSQL (Supabase) → per-assignment sandbox schemas
```

### Data Flow

```
1. User opens assignment   → GET /api/assignments/:id
                           → Backend builds sandbox in PostgreSQL
                           → Returns question + table schema to frontend

2. User runs query         → POST /api/query/run
                           → Query validated (SELECT only)
                           → Executed in isolated PostgreSQL schema
                           → Result compared against expected output
                           → Verdict + both outputs returned

3. User requests hint      → POST /api/hints
                           → LLM generates conceptual hint (never the answer)

4. Page refresh            → GET /api/auth/me
                           → Cookie sent automatically
                           → Redux store repopulated
```

### Sandbox Isolation

Each assignment gets its own PostgreSQL schema named `ws_<assignmentId>`:

```
Database: ciphersqlstudio_sandbox
├── Schema: ws_6634a1b2...     ← Assignment A
│   ├── employees
│   └── departments
└── Schema: ws_7723c4d9...     ← Assignment B
    ├── customers
    └── orders
```

Users can only query tables inside their assignment's schema — they cannot see or affect other schemas.

---

## Frontend

### Structure

```
frontend/
└── src/
    ├── app/
    │   ├── (auth)/            ← Login & Signup pages
    │   ├── assignments/       ← Assignment listing + attempt pages
    │   ├── layout.js
    │   ├── page.js
    │   └── providers.js       ← Redux Provider wrapper
    ├── components/
    │   ├── AiHint/            ← Get Hint button + hint display
    │   ├── Navbar/            ← Top navigation
    │   └── SqlEditor/         ← Monaco Editor wrapper
    └── store/
        ├── authSlice.js       ← Auth state (user, loading, error)
        └── store.js           ← Redux store config
```

### Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the development server:
```bash
npm run dev
```

Runs on `http://localhost:3000`

---

## Backend

### Structure

```
backend/
└── src/
    ├── config/
    │   ├── mongo.js            ← MongoDB connection
    │   └── postgres.js         ← PostgreSQL pool
    ├── controllers/
    │   ├── assignmentController.js
    │   ├── authController.js
    │   ├── hintController.js
    │   └── queryController.js
    ├── middleware/
    │   ├── errorHandler.js
    │   ├── protect.js          ← JWT auth middleware
    │   └── rateLimiter.js
    ├── models/
    │   ├── Assignment.js
    │   ├── User.js
    │   └── UserProgress.js
    ├── routes/
    │   ├── assignments.js
    │   ├── auth.js
    │   ├── hints.js
    │   └── query.js
    ├── services/
    │   ├── hintService.js      ← OpenAI integration
    │   ├── resultComparator.js ← Query result vs expected output
    │   └── sandboxService.js   ← PostgreSQL sandbox management
    └── index.js
```

### Setup

```bash
cd backend
npm install
```

Create a `.env` file:
```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ciphersqlstudio

# PostgreSQL (Supabase)
DATABASE_URL=postgresql://postgres:<password>@db.<project>.supabase.co:5432/postgres

# JWT
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=sk-...
```

Seed sample assignments into MongoDB:
```bash
node scripts/seed.js
```

Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

Runs on `http://localhost:5000`

---

## API Reference

### Auth

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/signup` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, sets cookie |
| POST | `/api/auth/logout` | Public | Clears cookie |
| GET | `/api/auth/me` | Protected | Get current user |
| GET | `/api/auth/profile` | Protected | Get user + solved assignments |

**Signup body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "mobileNo": "9876543210",
  "password": "secret123"
}
```

**Login body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

### Assignments

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/assignments` | Public | List all assignments |
| GET | `/api/assignments/:id` | Public | Load assignment + build sandbox |

### Query

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/query/run` | Protected | Run SQL query + get verdict |

**Body:**
```json
{
  "assignmentId": "6634a1b2...",
  "sql": "SELECT * FROM employees"
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "rows": [...],
    "fields": ["id", "name", "salary"],
    "rowCount": 4
  },
  "verdict": {
    "correct": true,
    "queryOutput": [...],
    "expectedOutput": [...]
  }
}
```

### Hints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/hints` | Public | Get AI hint for assignment |

**Body:**
```json
{
  "assignmentId": "6634a1b2...",
  "currentQuery": "SELECT * FROM employees WHERE"
}
```

---

## Security

- Only `SELECT` and `WITH` (CTEs) are allowed — everything else is rejected before touching the database
- Each query runs inside a `BEGIN READ ONLY` transaction
- `SET search_path` restricts users to their assignment's schema only
- JWT stored in `httpOnly` cookie — not accessible via JavaScript
- Rate limiting: 100 requests per hour per IP
- Helmet.js security headers on all responses
- Request body limited to 50kb
- Expected output never sent to the client

---

### Databases

- **MongoDB** - [MongoDB Atlas](https://atlas.mongodb.com) free tier
- **PostgreSQL** - [Supabase](https://supabase.com) free tier

---

## Scalability Note

The current architecture runs queries synchronously. For high-traffic scenarios, this can be upgraded to an async queue-based system using **BullMQ + Redis** where:

1. Query jobs are pushed to a Redis-backed queue
2. A separate sandbox worker processes jobs independently
3. Frontend polls a job status endpoint for results

This allows the sandbox server to scale independently from the main API server.
