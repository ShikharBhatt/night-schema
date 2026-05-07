require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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
  const client = await pool.connect();
  try {
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

    // Get foreign keys
    const fkResult = await client.query(`
      SELECT
        tc.table_schema,
        tc.table_name,
        kcu.column_name,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name,
        rc.update_rule,
        rc.delete_rule
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.referential_constraints rc
        ON tc.constraint_name = rc.constraint_name
        AND tc.table_schema = rc.constraint_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = rc.unique_constraint_name
        AND ccu.table_schema = rc.unique_constraint_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY tc.table_schema, tc.table_name;
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
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
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
