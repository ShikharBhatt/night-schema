import React, { useState, useMemo } from "react";
import { Search, Table2, Link, RefreshCw, ChevronRight, X, Sun, Moon } from "lucide-react";

export default function Sidebar({
  schema,
  searchTerm,
  onSearchChange,
  onFocusTable,
  onRefetch,
  loading,
  isLightTheme,
  onToggleTheme,
  focusTarget,
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
        background: "var(--bg-panel)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 16px 16px",
          borderBottom: "1px solid var(--border)",
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
                color: "var(--accent)",
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
                color: "var(--text-primary)",
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
              border: "1px solid var(--border)",
              borderRadius: "6px",
              color: "var(--text-secondary)",
              cursor: "pointer",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-hover)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <RefreshCw
              size={14}
              style={{
                animation: loading ? "spin 1s linear infinite" : "none",
              }}
            />
          </button>
          <button
            onClick={onToggleTheme}
            title={isLightTheme ? "Switch to dark theme" : "Switch to light theme"}
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              color: "var(--text-secondary)",
              cursor: "pointer",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
              marginLeft: "8px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-hover)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            {isLightTheme ? <Moon size={14} /> : <Sun size={14} />}
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
              color: "var(--text-muted)",
              pointerEvents: "none",
            }}
          />
          <input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tables, columns, types..."
            style={{
              width: "100%",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              padding: "8px 32px 8px 32px",
              color: "var(--text-primary)",
              fontSize: "12px",
              fontFamily: "IBM Plex Mono, monospace",
              outline: "none",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
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
                color: "var(--text-muted)",
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
            background: "var(--border)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {[
            { label: "Tables", value: stats.tables, icon: Table2 },
            { label: "Relations", value: stats.relationships, icon: Link },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              style={{
                background: "var(--bg-card)",
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
                  color: "var(--text-primary)",
                  fontFamily: "IBM Plex Mono, monospace",
                }}
              >
                {value}
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "var(--text-muted)",
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
              color: "var(--text-muted)",
              fontFamily: "IBM Plex Mono, monospace",
              borderBottom: "1px solid var(--border-subtle)",
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
            onFocusColumn={(columnName) => onFocusTable(table.id, columnName)}
            isFocusedTable={focusTarget?.tableId === table.id}
            focusedColumn={focusTarget?.tableId === table.id ? focusTarget?.columnName : null}
          />
        ))}

        {filtered.length === 0 && searchTerm && (
          <div
            style={{
              padding: "32px 16px",
              textAlign: "center",
              color: "var(--text-muted)",
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
          borderTop: "1px solid var(--border)",
          padding: "10px 16px",
          display: "flex",
          gap: "12px",
          fontSize: "10px",
          color: "var(--text-muted)",
          fontFamily: "IBM Plex Mono, monospace",
          flexWrap: "wrap",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ color: "var(--pk-color)" }}>🔑</span> PK
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ color: "var(--fk-color)" }}>→</span> FK
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: "var(--success)",
              display: "inline-block",
            }}
          />
          NOT NULL
        </span>
      </div>
    </aside>
  );
}

function TableListItem({ table, searchTerm, isExpanded, onToggle, onFocus, onFocusColumn, isFocusedTable, focusedColumn }) {
  const q = searchTerm.toLowerCase();
  const matchingCols = q
    ? table.columns.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.displayType?.toLowerCase().includes(q)
      )
    : [];

  return (
    <div style={{ borderBottom: "1px solid var(--border-subtle)" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "8px 12px",
          cursor: "pointer",
          gap: "6px",
          transition: "background 0.1s",
          background: isFocusedTable ? "var(--accent-dim)" : "transparent",
          borderLeft: isFocusedTable ? "3px solid var(--accent)" : "3px solid transparent",
        }}
        onMouseEnter={(e) => {
          if (!isFocusedTable) e.currentTarget.style.background = "var(--bg-hover)";
        }}
        onMouseLeave={(e) => {
          if (!isFocusedTable) e.currentTarget.style.background = "transparent";
        }}
      >
        <button
          onClick={onToggle}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
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
            color: "var(--text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            cursor: "pointer",
          }}
          onClick={onFocus}
          title="Focus table on canvas"
        >
          {table.schema !== "public" && (
            <span style={{ color: "var(--text-muted)" }}>{table.schema}.</span>
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
            color: "var(--text-muted)",
            cursor: "pointer",
            padding: "2px 4px",
            fontSize: "10px",
            fontFamily: "IBM Plex Mono, monospace",
            transition: "all 0.15s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "transparent";
            e.currentTarget.style.color = "var(--text-muted)";
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
            background: "var(--bg)",
          }}
        >
          {table.columns.map((col) => {
            const isMatch =
              q &&
              (col.name.toLowerCase().includes(q) ||
                col.displayType?.toLowerCase().includes(q));
            const markers = [];
            if (col.isPrimaryKey) markers.push({ symbol: "🔑", color: "var(--pk-color)", title: "Primary Key" });
            if (col.isForeignKey) markers.push({ symbol: "→", color: "var(--fk-color)", title: "Foreign Key" });
            if (col.isUnique && !col.isPrimaryKey) markers.push({ symbol: "◆", color: "var(--purple)", title: "Unique" });
            return (
              <div
                key={col.name}
                onClick={() => onFocusColumn?.(col.name)}
                title="Focus field on canvas"
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "3px 12px 3px 28px",
                  gap: "6px",
                  background:
                    focusedColumn === col.name
                      ? "var(--accent-dim)"
                      : isMatch
                      ? "var(--accent-dim)"
                      : "transparent",
                  borderLeft:
                    focusedColumn === col.name
                      ? "2px solid var(--accent)"
                      : isMatch
                      ? "2px solid var(--accent)"
                      : "2px solid transparent",
                  marginLeft: "0",
                  cursor: "pointer",
                  fontWeight: focusedColumn === col.name ? 600 : 400,
                }}
              >
                <div
                  style={{
                    width: "28px",
                    display: "flex",
                    gap: "3px",
                    flexShrink: 0,
                    alignItems: "center",
                  }}
                >
                  {markers.map((marker, index) => (
                    <span
                      key={`${col.name}-marker-${index}`}
                      title={marker.title}
                      style={{
                        fontSize: "10px",
                        lineHeight: 1,
                        color: marker.color,
                      }}
                    >
                      {marker.symbol}
                    </span>
                  ))}
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    fontFamily: "IBM Plex Mono, monospace",
                    color: col.isPrimaryKey ? "var(--pk-color)" : "var(--text-secondary)",
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
                    color: "var(--text-muted)",
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
                color: "var(--accent)",
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
                color: "var(--text-muted)",
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
      <span style={{ color: "var(--accent)", fontWeight: 600 }}>
        {text.slice(idx, idx + term.length)}
      </span>
      {text.slice(idx + term.length)}
    </>
  );
}
