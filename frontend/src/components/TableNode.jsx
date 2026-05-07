import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";

const TYPE_COLORS = {
  int: "#4f8ef7",
  int2: "#4f8ef7",
  int4: "#4f8ef7",
  int8: "#4f8ef7",
  serial: "#4f8ef7",
  bigserial: "#4f8ef7",
  numeric: "#4f8ef7",
  float4: "#4f8ef7",
  float8: "#4f8ef7",
  decimal: "#4f8ef7",
  varchar: "#34d399",
  text: "#34d399",
  char: "#34d399",
  bpchar: "#34d399",
  name: "#34d399",
  bool: "#fbbf24",
  timestamp: "#a78bfa",
  timestamptz: "#a78bfa",
  date: "#a78bfa",
  time: "#a78bfa",
  timetz: "#a78bfa",
  interval: "#a78bfa",
  uuid: "#f97316",
  json: "#f472b6",
  jsonb: "#f472b6",
  bytea: "#94a3b8",
  default: "#8888a0",
};

function getTypeColor(type) {
  return TYPE_COLORS[type?.toLowerCase()] || TYPE_COLORS.default;
}

function highlight(text, term) {
  if (!term || !text) return text;
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark
        style={{
          background: "var(--accent-dim)",
          color: "var(--text-primary)",
          borderRadius: "2px",
          padding: "0 1px",
        }}
      >
        {text.slice(idx, idx + term.length)}
      </mark>
      {text.slice(idx + term.length)}
    </>
  );
}

function getColumnMarkers(col) {
  const markers = [];
  if (col.isPrimaryKey) {
    markers.push({ symbol: "🔑", color: "var(--pk-color)", title: "Primary Key" });
  }
  if (col.isForeignKey) {
    markers.push({ symbol: "→", color: "var(--fk-color)", title: "Foreign Key" });
  }
  if (col.isUnique && !col.isPrimaryKey) {
    markers.push({ symbol: "◆", color: "var(--purple)", title: "Unique" });
  }
  return markers;
}

const TableNode = memo(({ data }) => {
  const {
    table,
    isHighlighted,
    isDimmed,
    matchingColumns,
    searchTerm,
    focusColumn,
  } = data;

  return (
    <div
      style={{
        background: isDimmed ? "var(--bg)" : "var(--bg-card)",
        border: `1px solid ${
          isHighlighted ? "var(--accent)" : isDimmed ? "var(--border-subtle)" : "var(--border)"
        }`,
        borderRadius: "8px",
        width: 280,
        fontFamily: "IBM Plex Mono, monospace",
        fontSize: "12px",
        opacity: isDimmed ? 0.35 : 1,
        transition: "all 0.2s ease",
        boxShadow: isHighlighted
          ? "var(--shadow-accent)"
          : "var(--shadow)",
        overflow: "hidden",
      }}
    >
      {/* Table header */}
      <div
        style={{
          background: isHighlighted
            ? "var(--table-header-bg)"
            : "var(--bg-panel)",
          padding: "10px 12px",
          borderBottom: `1px solid ${isHighlighted ? "var(--table-header-border)" : "var(--border)"}`,
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "20px",
            height: "20px",
            background: isHighlighted ? "var(--accent-dim)" : "var(--bg-hover)",
            border: `1px solid ${isHighlighted ? "var(--accent)" : "var(--border)"}`,
            borderRadius: "4px",
            fontSize: "10px",
          }}
        >
          ▦
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {table.schema !== "public" && (
            <div
              style={{
                fontSize: "9px",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "1px",
              }}
            >
              {highlight(table.schema, searchTerm)}
            </div>
          )}
          <div
            style={{
              color: "var(--text-primary)",
              fontWeight: 600,
              fontSize: "12px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {highlight(table.name, searchTerm)}
          </div>
        </div>
        {table.estimatedRows > 0 && (
          <span
            style={{
              fontSize: "9px",
              color: "var(--text-muted)",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "3px",
              padding: "1px 5px",
              flexShrink: 0,
            }}
          >
            ~{formatRows(table.estimatedRows)}
          </span>
        )}
      </div>

      {/* Columns */}
      <div style={{ padding: "4px 0" }}>
        {table.columns.map((col) => {
          const isColMatch = matchingColumns.has(col.name) || focusColumn === col.name;
          const markers = getColumnMarkers(col);
          return (
            <div
              key={col.name}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "4px 12px",
                gap: "6px",
                background: isColMatch
                  ? "var(--accent-dim)"
                  : "transparent",
                borderLeft: isColMatch
                  ? "2px solid var(--accent)"
                  : "2px solid transparent",
                position: "relative",
                minHeight: "26px",
              }}
            >
              {/* Source handle (outgoing FK) */}
              <Handle
                type="source"
                position={Position.Right}
                id={`${table.id}-${col.name}-source`}
                style={{
                  top: "50%",
                  transform: "translateY(-50%)",
                  right: -5,
                  width: 8,
                  height: 8,
                  background: "var(--bg-hover)",
                  border: "1.5px solid var(--border)",
                  borderRadius: "50%",
                  opacity: 0,
                  pointerEvents: "none",
                }}
              />
              {/* Target handle (incoming FK) */}
              <Handle
                type="target"
                position={Position.Left}
                id={`${table.id}-${col.name}-target`}
                style={{
                  top: "50%",
                  transform: "translateY(-50%)",
                  left: -5,
                  width: 8,
                  height: 8,
                  background: "var(--bg-hover)",
                  border: "1.5px solid var(--border)",
                  borderRadius: "50%",
                  opacity: 0,
                  pointerEvents: "none",
                }}
              />

              {/* Key indicator */}
              <div
                style={{
                  width: "28px",
                  display: "flex",
                  gap: "3px",
                  alignItems: "center",
                  flexShrink: 0,
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

              {/* Column name */}
              <span
                style={{
                  flex: 1,
                  color: col.isPrimaryKey
                    ? "var(--pk-color)"
                    : col.isNullable
                    ? "var(--text-secondary)"
                    : "var(--text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontWeight: col.isPrimaryKey ? 600 : 400,
                }}
              >
                {highlight(col.name, searchTerm)}
              </span>

              {/* Type badge */}
              <span
                style={{
                  fontSize: "10px",
                  color: getTypeColor(col.dataType),
                  flexShrink: 0,
                  opacity: 0.8,
                }}
              >
                {highlight(col.displayType, searchTerm)}
              </span>

              {/* Nullable dot */}
              {!col.isNullable && !col.isPrimaryKey && (
                <span
                  title="NOT NULL"
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "#34d399",
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {table.columns.length > 0 && (
        <div
          style={{
            borderTop: "1px solid #1a1a22",
            padding: "4px 12px",
            display: "flex",
            gap: "8px",
            fontSize: "10px",
            color: "#44445a",
          }}
        >
          <span>{table.columns.length} columns</span>
          {table.indexes?.length > 0 && (
            <span>{table.indexes.length} indexes</span>
          )}
        </div>
      )}
    </div>
  );
});

function formatRows(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

TableNode.displayName = "TableNode";
export default TableNode;
