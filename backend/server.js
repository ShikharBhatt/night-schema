const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

function getPgSslConfig() {
  const connectionString = process.env.DATABASE_URL || "";
  const sslFromUrl = getSslModeFromConnectionString(connectionString);
  const sslMode = (process.env.PGSSLMODE || "").toLowerCase();
  const forceSsl = process.env.DB_SSL === "true";
  const resolvedSslMode = sslMode || sslFromUrl;
  const optionalSslModes = new Set(["disable", "prefer", "allow"]);

  // node-postgres does not implement libpq-style sslmode=prefer fallback behavior.
  // Treat prefer/allow as non-forcing unless SSL is explicitly requested.
  if (!forceSsl && (!resolvedSslMode || optionalSslModes.has(resolvedSslMode))) {
    return false;
  }

  const caCert = process.env.PG_CA_CERT;
  if (caCert) {
    return {
      rejectUnauthorized: true,
      ca: caCert.replace(/\\n/g, "\n"),
    };
  }

  // Useful for cloud providers that require TLS but don't provide a CA bundle in env.
  return { rejectUnauthorized: false };
}

function getSslModeFromConnectionString(connectionString) {
  try {
    const parsed = new URL(connectionString);
    return (parsed.searchParams.get("sslmode") || "").toLowerCase();
  } catch {
    return "";
  }
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false, 
  connectionTimeoutMillis: 10000,
});

// Health check
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Full schema introspection
app.get("/api/schema", async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    // Get all tables in non-system schemas
    const tablesResult = await client.query(`
      SELECT
        t.table_schema,
        t.table_name,
        obj_description(
          (quote_ident(t.table_schema) || '.' || quote_ident(t.table_name))::regclass,
          'pg_class'
        ) AS table_comment,
        (SELECT reltuples::bigint FROM pg_class WHERE oid = (quote_ident(t.table_schema) || '.' || quote_ident(t.table_name))::regclass) AS estimated_rows
      FROM information_schema.tables t
      WHERE t.table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
        AND t.table_type = 'BASE TABLE'
      ORDER BY t.table_schema, t.table_name;
    `);

    // Get all columns
    const columnsResult = await client.query(`
      SELECT
        c.table_schema,
        c.table_name,
        c.column_name,
        c.ordinal_position,
        c.data_type,
        c.udt_name,
        c.character_maximum_length,
        c.numeric_precision,
        c.numeric_scale,
        c.is_nullable,
        c.column_default,
        col_description(
          (quote_ident(c.table_schema) || '.' || quote_ident(c.table_name))::regclass,
          c.ordinal_position
        ) AS column_comment
      FROM information_schema.columns c
      WHERE c.table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY c.table_schema, c.table_name, c.ordinal_position;
    `);

    // Get primary keys
    const pkResult = await client.query(`
      SELECT
        kcu.table_schema,
        kcu.table_name,
        kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast');
    `);

    // Get unique constraints
    const uniqueResult = await client.query(`
      SELECT
        kcu.table_schema,
        kcu.table_name,
        kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'UNIQUE'
        AND tc.table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast');
    `);

    // Get foreign keys (pg_catalog is more reliable than information_schema for FK mapping)
    const fkResult = await client.query(`
      SELECT
        src_ns.nspname AS table_schema,
        src_tbl.relname AS table_name,
        src_col.attname AS column_name,
        tgt_ns.nspname AS foreign_table_schema,
        tgt_tbl.relname AS foreign_table_name,
        tgt_col.attname AS foreign_column_name,
        con.conname AS constraint_name,
        CASE con.confupdtype
          WHEN 'a' THEN 'NO ACTION'
          WHEN 'r' THEN 'RESTRICT'
          WHEN 'c' THEN 'CASCADE'
          WHEN 'n' THEN 'SET NULL'
          WHEN 'd' THEN 'SET DEFAULT'
          ELSE 'NO ACTION'
        END AS update_rule,
        CASE con.confdeltype
          WHEN 'a' THEN 'NO ACTION'
          WHEN 'r' THEN 'RESTRICT'
          WHEN 'c' THEN 'CASCADE'
          WHEN 'n' THEN 'SET NULL'
          WHEN 'd' THEN 'SET DEFAULT'
          ELSE 'NO ACTION'
        END AS delete_rule
      FROM pg_constraint con
      JOIN pg_class src_tbl ON src_tbl.oid = con.conrelid
      JOIN pg_namespace src_ns ON src_ns.oid = src_tbl.relnamespace
      JOIN pg_class tgt_tbl ON tgt_tbl.oid = con.confrelid
      JOIN pg_namespace tgt_ns ON tgt_ns.oid = tgt_tbl.relnamespace
      JOIN LATERAL unnest(con.conkey) WITH ORDINALITY AS src_key(attnum, ord) ON true
      JOIN LATERAL unnest(con.confkey) WITH ORDINALITY AS tgt_key(attnum, ord)
        ON tgt_key.ord = src_key.ord
      JOIN pg_attribute src_col
        ON src_col.attrelid = src_tbl.oid
        AND src_col.attnum = src_key.attnum
      JOIN pg_attribute tgt_col
        ON tgt_col.attrelid = tgt_tbl.oid
        AND tgt_col.attnum = tgt_key.attnum
      WHERE con.contype = 'f'
        AND src_tbl.relkind IN ('r', 'p')
        AND src_ns.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY src_ns.nspname, src_tbl.relname, con.conname, src_key.ord;
    `);

    // Get indexes
    const indexResult = await client.query(`
      SELECT
        schemaname AS table_schema,
        tablename AS table_name,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY schemaname, tablename, indexname;
    `);

    // Build lookup sets
    const pkSet = new Set(
      pkResult.rows.map((r) => `${r.table_schema}.${r.table_name}.${r.column_name}`)
    );
    const uniqueSet = new Set(
      uniqueResult.rows.map((r) => `${r.table_schema}.${r.table_name}.${r.column_name}`)
    );
    const fkSet = new Set(
      fkResult.rows.map((r) => `${r.table_schema}.${r.table_name}.${r.column_name}`)
    );

    // Group columns by table
    const columnsByTable = {};
    for (const col of columnsResult.rows) {
      const key = `${col.table_schema}.${col.table_name}`;
      if (!columnsByTable[key]) columnsByTable[key] = [];
      const colKey = `${key}.${col.column_name}`;
      columnsByTable[key].push({
        name: col.column_name,
        position: col.ordinal_position,
        dataType: col.udt_name || col.data_type,
        displayType: buildDisplayType(col),
        isNullable: col.is_nullable === "YES",
        default: col.column_default,
        comment: col.column_comment,
        isPrimaryKey: pkSet.has(colKey),
        isForeignKey: fkSet.has(colKey),
        isUnique: uniqueSet.has(colKey),
      });
    }

    // Group indexes by table
    const indexesByTable = {};
    for (const idx of indexResult.rows) {
      const key = `${idx.table_schema}.${idx.table_name}`;
      if (!indexesByTable[key]) indexesByTable[key] = [];
      indexesByTable[key].push({
        name: idx.indexname,
        definition: idx.indexdef,
      });
    }

    // Build tables
    const tables = tablesResult.rows.map((t) => {
      const key = `${t.table_schema}.${t.table_name}`;
      return {
        schema: t.table_schema,
        name: t.table_name,
        id: key,
        comment: t.table_comment,
        estimatedRows: parseInt(t.estimated_rows) || 0,
        columns: columnsByTable[key] || [],
        indexes: indexesByTable[key] || [],
      };
    });

    // Build foreign key relationships
    const relationships = fkResult.rows.map((fk) => ({
      sourceTable: `${fk.table_schema}.${fk.table_name}`,
      sourceColumn: fk.column_name,
      targetTable: `${fk.foreign_table_schema}.${fk.foreign_table_name}`,
      targetColumn: fk.foreign_column_name,
      constraintName: fk.constraint_name,
      updateRule: fk.update_rule,
      deleteRule: fk.delete_rule,
    }));

    res.json({
      tables,
      relationships,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Schema introspection error:", err);
    res.status(500).json({
      error: err.message || err.code || "Schema introspection failed",
    });
  } finally {
    if (client) client.release();
  }
});

function buildDisplayType(col) {
  const base = col.udt_name || col.data_type;
  if (col.character_maximum_length) return `${base}(${col.character_maximum_length})`;
  if (col.numeric_precision && col.numeric_scale)
    return `${base}(${col.numeric_precision},${col.numeric_scale})`;
  if (col.numeric_precision) return `${base}(${col.numeric_precision})`;
  return base;
}

app.listen(PORT, () => {
  console.log(`ERD Explorer backend running on http://localhost:${PORT}`);
  console.log(`Schema endpoint: http://localhost:${PORT}/api/schema`);
});
