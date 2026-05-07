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
          background: "rgba(79,142,247,0.35)",
          color: "#e8e8f0",
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

const TableNode = memo(({ data }) => {
  const { table, isHighlighted, isDimmed, matchingColumns, searchTerm } = data;

  return (
    <div
      style={{
        background: isDimmed ? "#111118" : "#1a1a24",
        border: `1px solid ${
          isHighlighted ? "#4f8ef7" : isDimmed ? "#1a1a22" : "#2a2a3a"
        }`,
        borderRadius: "8px",
        width: 280,
        fontFamily: "IBM Plex Mono, monospace",
        fontSize: "12px",
        opacity: isDimmed ? 0.35 : 1,
        transition: "all 0.2s ease",
        boxShadow: isHighlighted
          ? "0 0 0 1px #4f8ef7, 0 0 20px rgba(79,142,247,0.2)"
          : "0 4px 16px rgba(0,0,0,0.4)",
        overflow: "hidden",
      }}
    >
      {/* Table header */}
      <div
        style={{
          background: isHighlighted
            ? "linear-gradient(135deg, #1e2a42 0%, #192038 100%)"
            : "#13131a",
          padding: "10px 12px",
          borderBottom: `1px solid ${isHighlighted ? "#2a3a5a" : "#22222f"}`,
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
            background: isHighlighted ? "#4f8ef720" : "#22222f",
            border: `1px solid ${isHighlighted ? "#4f8ef750" : "#2a2a3a"}`,
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
                color: "#55556a",
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
              color: isHighlighted ? "#e8e8f0" : "#c0c0d0",
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
              color: "#55556a",
              background: "#0d0d0f",
              border: "1px solid #22222f",
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
          const isColMatch = matchingColumns.has(col.name);
          return (
            <div
              key={col.name}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "4px 12px",
                gap: "6px",
                background: isColMatch
                  ? "rgba(79,142,247,0.08)"
                  : "transparent",
                borderLeft: isColMatch
                  ? "2px solid #4f8ef7"
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
                  background: "#22222f",
                  border: "1.5px solid #2a2a3a",
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
                  background: "#22222f",
                  border: "1.5px solid #2a2a3a",
                  borderRadius: "50%",
                  opacity: 0,
                  pointerEvents: "none",
                }}
              />

              {/* Key indicator */}
              <span
                style={{
                  width: "14px",
                  fontSize: "10px",
                  flexShrink: 0,
                  color: col.isPrimaryKey
                    ? "#fbbf24"
                    : col.isUnique
                    ? "#a78bfa"
                    : "transparent",
                }}
                title={
                  col.isPrimaryKey
                    ? "Primary Key"
                    : col.isUnique
                    ? "Unique"
                    : ""
                }
              >
                {col.isPrimaryKey ? "🔑" : col.isUnique ? "◆" : "·"}
              </span>

              {/* Column name */}
              <span
                style={{
                  flex: 1,
                  color: col.isPrimaryKey
                    ? "#fbbf24"
                    : col.isNullable
                    ? "#8888a0"
                    : "#c8c8d8",
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
