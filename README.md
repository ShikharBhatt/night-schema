# Night Schema

A local, self-hosted ERD (Entity Relationship Diagram) viewer for your PostgreSQL database. Visualize your entire schema, explore foreign key relationships, and search tables and columns — all in a clean, interactive canvas.

## Architecture

```
night-schema/
├── backend/          # Node.js + Express — schema introspection API
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/         # Vite + React + React Flow — interactive ERD
    ├── src/
    │   ├── App.jsx
    │   ├── components/
    │   │   ├── ERDCanvas.jsx   — React Flow canvas
    │   │   ├── Sidebar.jsx     — search + table list
    │   │   └── TableNode.jsx   — individual table card
    │   ├── hooks/
    │   │   ├── useSchema.js    — fetch schema from backend
    │   │   └── useLayout.js    — schema → React Flow nodes/edges
    │   └── styles/
    │       └── global.css
    └── package.json
```

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your Postgres connection:
```
DATABASE_URL=postgresql://user:password@localhost:5432/your_database
PORT=3001
```

Start the backend:
```bash
npm run dev       # with auto-reload (uses nodemon)
# or
npm start         # plain node
```

Test it's working:
```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/schema | head -c 500
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## Features

- **Interactive ERD canvas** — drag tables, zoom, pan
- **Auto-layout** — tables positioned automatically in a grid
- **Foreign key edges** — visual arrows between related tables
- **Search** — type anything to highlight matching tables and columns
  - Searches: table names, column names, data types, schema names
  - Dims non-matching nodes and edges
  - Highlights matching rows inside each table card
  - Shows match count overlay on canvas
- **Sidebar table list** — click ⌖ to fly to any table on the canvas
- **Column details** — PK 🔑, NOT NULL indicators, data type coloring
- **Minimap** — navigate large schemas easily
- **Estimated row counts** — shown per table
- **Refresh** — re-introspect the live schema without restarting

## What the backend introspects

| Data | Source |
|------|--------|
| Base tables | `information_schema.tables` filtered to `BASE TABLE` |
| Columns + types | `information_schema.columns` |
| Primary keys | `pg_catalog.pg_constraint` + `pg_attribute` |
| Foreign keys | `pg_catalog.pg_constraint` + `pg_attribute` |
| Unique constraints | `pg_catalog.pg_constraint` + `pg_attribute` |
| Indexes | `pg_indexes` |
| Table comments | `obj_description()` via table `regclass` |
| Column comments | `col_description()` |
| Estimated row counts | `pg_class.reltuples` |

Only non-system schemas are included. The backend excludes `pg_catalog`, `information_schema`, and `pg_toast`.

## Tips

- **Large schemas** — the minimap (bottom-right) helps navigate
- **Multiple schemas** — schema name shown in grey above table name
- **Drag tables** — rearrange the layout as you prefer
- **Ctrl/Cmd + scroll** — zoom in/out on canvas
