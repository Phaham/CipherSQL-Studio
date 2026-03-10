const { Pool } = require("pg");

/**
 * Shared connection pool used across the app.
 * Individual sandbox queries run through sandboxService which
 * sets the search_path on a dedicated client from this pool.
 */

const pgPool = new Pool({
  host: process.env.PG_HOST || "localhost",
  port: parseInt(process.env.PG_PORT, 10) || 5432,
  database: process.env.PG_DATABASE || "ciphersqlstudio_sandbox",
  user: process.env.PG_USER || "postgres",
  password: process.env.PG_PASSWORD,
  max: 20,  // max pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  statement_timeout: parseInt(process.env.QUERY_TIMEOUT_MS, 10) || 5000,
});

pgPool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err.message);
});

module.exports = { pgPool };
