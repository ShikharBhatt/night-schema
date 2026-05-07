import React, { useState, useMemo } from "react";
import { Search, Table2, Link, RefreshCw, ChevronRight, X } from "lucide-react";

export default function Sidebar({
  schema,
  searchTerm,
  onSearchChange,
  onFocusTable,
  onRefetch,
  loading,
}) {
  const [expandedTable, setExpandedTable] = useState(null);

  const filtered = useMemo(() => {
    if (!schema) return [];
    const q = searchTerm.toLowerCase().trim();
    if (!q) return schema.tables;
    return schema.tables.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.schema.toLowerCase().includes(q) ||
        t.columns.some(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.displayType?.toLowerCase().includes(q)
        )
    );
  }, [schema, searchTerm]);

  const stats = useMemo(() => {
    if (!schema) return null;
    const totalCols = schema.tables.reduce((a, t) => a + t.columns.length, 0);
    const schemas = new Set(schema.tables.map((t) => t.schema));
    return {
      tables: schema.tables.length,
      relationships: schema.relationships.length,
      columns: totalCols,
      schemas: schemas.size,
    };
  }, [schema]);

  return (
    <aside
      style={{
        width: "280px",
        minWidth: "280px",
        height: "100%",
        background: "#0f0f16",
        borderRight: "1px solid #1e1e2a",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 16px 16px",
          borderBottom: "1px solid #1e1e2a",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "11px",
                color: "#4f8ef7",
                fontFamily: "IBM Plex Mono, monospace",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "2px",
              }}
            >
              ERD Explorer
            </div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "#e8e8f0",
                fontFamily: "IBM Plex Sans, sans-serif",
              }}
            >
              Schema Viewer
            </div>
          </div>
          <button
            onClick={onRefetch}
            disabled={loading}
            title="Refresh schema"
            style={{
              background: "transparent",
              border: "1px solid #2a2a3a",
              borderRadius: "6px",
              color: "#8888a0",
              cursor: "pointer",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#1a1a24";
              e.currentTarget.style.color = "#e8e8f0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#8888a0";
            }}
          >
            <RefreshCw
              size={14}
              style={{
                animation: loading ? "spin 1s linear infinite" : "none",
              }}
            />
          </button>
        </div>

        {/* Search */}
        <div style={{ position: "relative" }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#55556a",
              pointerEvents: "none",
            }}
          />
          <input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tables, columns, types..."
            style={{
              width: "100%",
              background: "#13131a",
              border: "1px solid #2a2a3a",
              borderRadius: "6px",
              padding: "8px 32px 8px 32px",
              color: "#e8e8f0",
              fontSize: "12px",
              fontFamily: "IBM Plex Mono, monospace",
              outline: "none",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#4f8ef7")}
            onBlur={(e) => (e.target.style.borderColor = "#2a2a3a")}
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: "#55556a",
                cursor: "pointer",
                padding: "2px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Stats bar */}
      {stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1px",
            background: "#1e1e2a",
            borderBottom: "1px solid #1e1e2a",
          }}
        >
          {[
            { label: "Tables", value: stats.tables, icon: Table2 },
            { label: "Relations", value: stats.relationships, icon: Link },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              style={{
                background: "#0f0f16",
                padding: "10px 12px",
                display: "flex",
                flexDirection: "column",
                gap: "2px",
              }}
            >
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#e8e8f0",
                  fontFamily: "IBM Plex Mono, monospace",
                }}
              >
                {value}
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "#55556a",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Icon size={10} />
                {label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table list */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {searchTerm && (
          <div
            style={{
              padding: "8px 16px",
              fontSize: "11px",
              color: "#55556a",
              fontFamily: "IBM Plex Mono, monospace",
              borderBottom: "1px solid #1a1a22",
            }}
          >
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </div>
        )}

        {filtered.map((table) => (
          <TableListItem
            key={table.id}
            table={table}
            searchTerm={searchTerm}
            isExpanded={expandedTable === table.id}
            onToggle={() =>
              setExpandedTable(expandedTable === table.id ? null : table.id)
            }
            onFocus={() => onFocusTable(table.id)}
          />
        ))}

        {filtered.length === 0 && searchTerm && (
          <div
            style={{
              padding: "32px 16px",
              textAlign: "center",
              color: "#44445a",
              fontSize: "12px",
              fontFamily: "IBM Plex Mono, monospace",
            }}
          >
            No matches for "{searchTerm}"
          </div>
        )}
      </div>

      {/* Footer legend */}
      <div
        style={{
          borderTop: "1px solid #1e1e2a",
          padding: "10px 16px",
          display: "flex",
          gap: "12px",
          fontSize: "10px",
          color: "#44445a",
          fontFamily: "IBM Plex Mono, monospace",
          flexWrap: "wrap",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ color: "#fbbf24" }}>🔑</span> PK
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ color: "#4f8ef7" }}>→</span> FK
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: "#34d399",
              display: "inline-block",
            }}
          />
          NOT NULL
        </span>
      </div>
    </aside>
  );
}

function TableListItem({ table, searchTerm, isExpanded, onToggle, onFocus }) {
  const q = searchTerm.toLowerCase();
  const matchingCols = q
    ? table.columns.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.displayType?.toLowerCase().includes(q)
      )
    : [];

  return (
    <div style={{ borderBottom: "1px solid #13131a" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "8px 12px",
          cursor: "pointer",
          gap: "6px",
          transition: "background 0.1s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#13131a")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <button
          onClick={onToggle}
          style={{
            background: "transparent",
            border: "none",
            color: "#55556a",
            cursor: "pointer",
            padding: "0",
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            transition: "transform 0.15s",
            transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
          }}
        >
          <ChevronRight size={12} />
        </button>

        <span
          style={{
            flex: 1,
            fontSize: "12px",
            fontFamily: "IBM Plex Mono, monospace",
            color: searchTerm ? "#e8e8f0" : "#c0c0d0",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          onClick={onToggle}
        >
          {table.schema !== "public" && (
            <span style={{ color: "#44445a" }}>{table.schema}.</span>
          )}
          {highlightText(table.name, searchTerm)}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onFocus();
          }}
          title="Focus on canvas"
          style={{
            background: "transparent",
            border: "1px solid transparent",
            borderRadius: "4px",
            color: "#55556a",
            cursor: "pointer",
            padding: "2px 4px",
            fontSize: "10px",
            fontFamily: "IBM Plex Mono, monospace",
            transition: "all 0.15s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#2a2a3a";
            e.currentTarget.style.color = "#4f8ef7";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "transparent";
            e.currentTarget.style.color = "#55556a";
          }}
        >
          ⌖
        </button>

        <span
          style={{
            fontSize: "10px",
            color: "#44445a",
            fontFamily: "IBM Plex Mono, monospace",
            flexShrink: 0,
          }}
        >
          {table.columns.length}
        </span>
      </div>

      {isExpanded && (
        <div
          style={{
            paddingBottom: "6px",
            background: "#0d0d0f",
          }}
        >
          {table.columns.map((col) => {
            const isMatch =
              q &&
              (col.name.toLowerCase().includes(q) ||
                col.displayType?.toLowerCase().includes(q));
            return (
              <div
                key={col.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "3px 12px 3px 28px",
                  gap: "6px",
                  background: isMatch
                    ? "rgba(79,142,247,0.06)"
                    : "transparent",
                  borderLeft: isMatch
                    ? "2px solid #4f8ef760"
                    : "2px solid transparent",
                  marginLeft: "0",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    color: col.isPrimaryKey ? "#fbbf24" : "#44445a",
                    width: "12px",
                    flexShrink: 0,
                  }}
                >
                  {col.isPrimaryKey ? "🔑" : "·"}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontFamily: "IBM Plex Mono, monospace",
                    color: col.isPrimaryKey ? "#fbbf24" : isMatch ? "#c8c8d8" : "#666680",
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {highlightText(col.name, searchTerm)}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontFamily: "IBM Plex Mono, monospace",
                    color: "#44445a",
                  }}
                >
                  {col.displayType}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {!isExpanded && matchingCols.length > 0 && (
        <div
          style={{
            paddingLeft: "28px",
            paddingBottom: "6px",
          }}
        >
          {matchingCols.slice(0, 3).map((col) => (
            <div
              key={col.name}
              style={{
                fontSize: "10px",
                fontFamily: "IBM Plex Mono, monospace",
                color: "#4f8ef7",
                padding: "1px 12px",
              }}
            >
              ↳ {col.name}
            </div>
          ))}
          {matchingCols.length > 3 && (
            <div
              style={{
                fontSize: "10px",
                fontFamily: "IBM Plex Mono, monospace",
                color: "#44445a",
                padding: "1px 12px",
              }}
            >
              +{matchingCols.length - 3} more
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function highlightText(text, term) {
  if (!term || !text) return text;
  const q = term.toLowerCase();
  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ color: "#4f8ef7", fontWeight: 600 }}>
        {text.slice(idx, idx + term.length)}
      </span>
      {text.slice(idx + term.length)}
    </>
  );
}
