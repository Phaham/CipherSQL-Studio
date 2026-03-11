const { pgPool } = require("../config/postgres");

const SCHEMA_PREFIX = "ws_";
const MAX_ROWS = 500;

const DATA_TYPE_MAP = {
  INTEGER: "INTEGER",
  TEXT: "TEXT",
  REAL: "REAL",
  BOOLEAN: "BOOLEAN",
  DATE: "DATE",
  TIMESTAMP: "TIMESTAMP",
  NUMERIC: "NUMERIC",
  VARCHAR: "VARCHAR(255)",
};

// Only SELECT and WITH (CTEs) are allowed
function validateQuery(sql) {
  if (!sql || typeof sql !== "string" || sql.trim().length === 0) {
    return { valid: false, reason: "Query cannot be empty." };
  }

  if (!/^(SELECT|WITH)\b/i.test(sql.trim())) {
    return { valid: false, reason: "Only SELECT queries are allowed." };
  }

  return { valid: true, reason: null };
}

// Each assignment gets its own schema: ws_<assignmentId>
function getSchemaName(assignmentId) {
  return `${SCHEMA_PREFIX}${assignmentId}`;
}

// Build (or rebuild) the sandbox tables from assignment data
async function buildSandbox(assignment) {
  const schema = getSchemaName(assignment._id);
  const client = await pgPool.connect();

  try {
    await client.query("BEGIN");
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);

    for (const table of assignment.sampleTables) {
      const columnDefs = table.columns
        .map((col) => `"${col.columnName}" ${DATA_TYPE_MAP[col.dataType] || "TEXT"}`)
        .join(", ");

      await client.query(`DROP TABLE IF EXISTS "${schema}"."${table.tableName}"`);
      await client.query(`CREATE TABLE "${schema}"."${table.tableName}" (${columnDefs})`);

      for (const row of table.rows) {
        const colNames = table.columns.map((c) => c.columnName);
        const values = colNames.map((col) => row[col] ?? null);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");

        await client.query(
          `INSERT INTO "${schema}"."${table.tableName}" (${colNames.map((c) => `"${c}"`).join(", ")}) VALUES (${placeholders})`,
          values
        );
      }
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw new Error(`Sandbox build failed: ${err.message}`);
  } finally {
    client.release();
  }
}

// Run user's query inside the assignment's sandbox schema
async function executeQuery(assignmentId, sql) {
  const { valid, reason } = validateQuery(sql);
  if (!valid) {
    const err = new Error(reason);
    err.type = "SQL_VALIDATION_ERROR";
    throw err;
  }

  const schema = getSchemaName(assignmentId);
  const client = await pgPool.connect();

  try {
    await client.query(`SET search_path TO "${schema}"`);
    await client.query("BEGIN READ ONLY");

    const result = await client.query(
      `SELECT * FROM (${sql}) AS user_query LIMIT ${MAX_ROWS}`
    );

    await client.query("COMMIT");

    return {
      rows: result.rows,
      fields: result.fields.map((f) => f.name),
      rowCount: result.rows.length,
    };
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});

    if (err.type === "SQL_VALIDATION_ERROR") throw err;

    const pgError = new Error(err.message);
    pgError.type = "SQL_SYNTAX_ERROR";
    throw pgError;
  } finally {
    await client.query("RESET search_path").catch(() => {});
    client.release();
  }
}

module.exports = { buildSandbox, executeQuery, validateQuery };