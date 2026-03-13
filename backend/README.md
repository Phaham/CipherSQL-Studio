# CipherSQL Studio - Backend

Node.js + Express backend for the CipherSQL Studio SQL learning platform.

## Architecture

```
Client (React)
    │
    ├── GET  /api/assignments          → List problems
    ├── GET  /api/assignments/:id      → Load problem + BUILD sandbox in PG
    ├── POST /api/query/run            → Execute SQL → compare → verdict
    └── POST /api/hints                → LLM hint (no solution leakage)
         │
         ├── MongoDB Atlas             (assignment data, user progress)
         └── PostgreSQL(Supabase)                (per-problem isolated sandbox schemas)
```

## How the Sandbox Works

Each assignment gets an isolated PostgreSQL **schema** named `ws_<assignmentId>`.

```
Database: ciphersqlstudio_sandbox
├── Schema: ws_6634a1b2...   ← Assignment A's tables
│   ├── employees
│   └── departments
│
└── Schema: ws_7723c4d9...   ← Assignment B's tables
    ├── customers
    └── orders
```

**When the user opens a problem** (`GET /api/assignments/:id`):
1. Backend fetches the assignment from MongoDB.
2. Creates the schema + tables in PostgreSQL from `sampleTables` JSON.
3. Returns question, tables, and schema info to frontend. **Expected output is never sent to the client.**

**When the user hits Run** (`POST /api/query/run`):
1. Query is validated — only `SELECT` / `WITH` allowed. Forbidden keywords rejected immediately.
2. Query runs inside the assignment's schema with `SET search_path TO ws_<id>`.
3. Wrapped in a `BEGIN READ ONLY` transaction for belt-and-suspenders safety.
4. Capped at `MAX_RESULT_ROWS` rows.
5. Result is compared against `expectedOutput` from MongoDB.
6. Client gets `{ result, verdict: { correct, message } }`.


**Authentication Flow**
```Signup → hash password with bcrypt → save user → return JWT
Login → verify password → return JWT
Frontend sends JWT in Authorization: Bearer <token> header on protected routes
protect middleware verifies the token and attaches req.user to the request

Profile endpoint:

GET /api/auth/profile — protected, returns user info + their solved assignments by querying UserProgress where userId = req.user.id and isCompleted = true
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js / Express.js |
| Sandbox DB | PostgreSQL (Supabase) |
| Persistence DB | MongoDB Atlas |
| LLM Hints | OpenAI GPT-4o-mini |

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Set up PostgreSQL

```bash
# set up supabase project
Create a project in Supabase, update this project's credentials in .env
```

### 4. Set up MongoDB

Point `MONGO_URI` in `.env` to your MongoDB Atlas cluster.

Seed sample assignments:
```bash
node scripts/seed.js
```

### 5. Start the server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

<!-- ## Scaling - What If 1k users run queries simultaneously

**Solution**
```bash
Instead of running the user's query directly and waiting for a response (synchronous), it becomes asynchronous:

User hits POST /api/query/run
Backend saves the job to Redis (via BullMQ queue) and immediately returns { jobId: "123", status: "queued" }
A separate Sandbox Server (worker) picks the job from the queue, runs the query on PostgreSQL, and sends the result back via a callback
Frontend polls GET /api/query/status/:jobId to check if the result is ready


Why this is useful at scale:

If 1k users run queries simultaneously, they don't all hammer PostgreSQL at once - the queue controls the load
The sandbox server can be scaled independently
Long running queries don't block the main server
``` -->

## API Reference

### `GET /api/assignments`
Returns all assignments (only needed values - such as title, description, question).

**Response:**
```json
{
  "success": true,
  "data": [
    { "_id": "...", "title": "...", "difficulty": "Easy", "question": "..." }
  ]
}
```

---

### `GET /api/assignments/:id`
Loads an assignment and builds its sandbox in PostgreSQL.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Select All Employees",
    "difficulty": "Easy",
    "question": "...",
    "sampleTables": [...],
    "expectedOutputType": "table"
  },
  "sandbox": {
    "schema": "ws_6634a1b2...",
    "tablesCreated": ["employees"]
  }
}
```

---

### `POST /api/query/run`
Executes a user's SQL query and returns a correctness verdict.

**Body:**
```json
{
  "assignmentId": "6634a1b2...",
  "sql": "SELECT * FROM employees",
  "userId": "session_abc123"
}
```

**Success Response:**
```json
{
  "success": true,
  "result": {
    "rows": [{ "id": 1, "name": "Alice", ... }],
    "fields": ["id", "name", "department", "salary"],
    "rowCount": 4,
    "truncated": false
  },
  "verdict": {
    "correct": true,
    "message": "✅ Correct! Your query matches the expected output."
  }
}
```

**SQL Error Response (still HTTP 200):**
```json
{
  "success": false,
  "error": {
    "type": "SQL_SYNTAX_ERROR",
    "message": "syntax error at or near \"SELEC\"",
    "position": "1"
  },
  "result": null,
  "verdict": null
}
```

**Forbidden Query Response:**
```json
{
  "success": false,
  "error": {
    "type": "SQL_VALIDATION_ERROR",
    "message": "Only SELECT queries are allowed."
  }
}
```

---

### `POST /api/hints`
Gets an LLM-generated hint (never a full solution).

**Body:**
```json
{
  "assignmentId": "6634a1b2...",
  "currentQuery": "SELECT * FROM employees WHERE"
}
```

**Response:**
```json
{
  "success": true,
  "hint": "Think about using the GROUP BY clause along with an aggregate function like COUNT() to group results by department."
}
```

## Security

- Only `SELECT` and `WITH` (CTEs) are allowed — all other statements return a validation error
- Each assignment runs in its own PostgreSQL schema (`SET search_path`)
- All user queries run inside `BEGIN READ ONLY` transactions
- `statement_timeout` prevents long-running queries
- Results capped at `MAX_RESULT_ROWS` (default 500)
- Rate limiting: 30 requests/minute per IP
- Helmet.js security headers
- Request body capped at 50kb


