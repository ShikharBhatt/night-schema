import React, { useState, useCallback } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { useSchema } from "./hooks/useSchema";
import Sidebar from "./components/Sidebar";
import ERDCanvas from "./components/ERDCanvas";

export default function App() {
  const { schema, loading, error, refetch } = useSchema();
  const [searchTerm, setSearchTerm] = useState("");
  const [focusTableId, setFocusTableId] = useState(null);

  const handleFocusTable = useCallback((id) => {
    setFocusTableId(id);
  }, []);

  const handleFocusDone = useCallback(() => {
    setFocusTableId(null);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Sidebar
        schema={schema}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onFocusTable={handleFocusTable}
        onRefetch={refetch}
        loading={loading}
      />

      <main style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {loading && !schema && (
          <LoadingState />
        )}
        {error && !schema && (
          <ErrorState error={error} onRetry={refetch} />
        )}
        {schema && (
          <ReactFlowProvider>
            <ERDCanvas
              schema={schema}
              searchTerm={searchTerm}
              focusTableId={focusTableId}
              onFocusDone={handleFocusDone}
            />
          </ReactFlowProvider>
        )}

        {/* Search result count overlay */}
        {schema && searchTerm && (
          <SearchOverlay schema={schema} searchTerm={searchTerm} />
        )}
      </main>
    </div>
  );
}

function LoadingState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: "16px",
        color: "#55556a",
        fontFamily: "IBM Plex Mono, monospace",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "2px solid #1e1e2a",
          borderTop: "2px solid #4f8ef7",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <div style={{ fontSize: "13px" }}>Introspecting schema...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: "16px",
        fontFamily: "IBM Plex Mono, monospace",
        textAlign: "center",
        padding: "32px",
      }}
    >
      <div style={{ fontSize: "40px" }}>⚠</div>
      <div style={{ fontSize: "16px", color: "#f87171", fontWeight: 600 }}>
        Connection Failed
      </div>
      <div
        style={{
          fontSize: "12px",
          color: "#55556a",
          maxWidth: "400px",
          lineHeight: 1.6,
          background: "#13131a",
          border: "1px solid #2a2a3a",
          borderRadius: "8px",
          padding: "16px",
        }}
      >
        {error}
      </div>
      <div style={{ fontSize: "11px", color: "#44445a", lineHeight: 1.8 }}>
        Make sure your backend is running:<br />
        <span style={{ color: "#4f8ef7" }}>cd backend && npm run dev</span>
        <br />and <span style={{ color: "#4f8ef7" }}>DATABASE_URL</span> is set in <span style={{ color: "#4f8ef7" }}>.env</span>
      </div>
      <button
        onClick={onRetry}
        style={{
          background: "#1a1a24",
          border: "1px solid #2a2a3a",
          borderRadius: "6px",
          color: "#e8e8f0",
          fontSize: "12px",
          fontFamily: "IBM Plex Mono, monospace",
          padding: "8px 20px",
          cursor: "pointer",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#4f8ef7";
          e.currentTarget.style.color = "#4f8ef7";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#2a2a3a";
          e.currentTarget.style.color = "#e8e8f0";
        }}
      >
        Retry Connection
      </button>
    </div>
  );
}

function SearchOverlay({ schema, searchTerm }) {
  const q = searchTerm.toLowerCase();
  const matchedTables = schema.tables.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.schema.toLowerCase().includes(q) ||
      t.columns.some(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.displayType?.toLowerCase().includes(q)
      )
  );

  return (
    <div
      style={{
        position: "absolute",
        top: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#13131a",
        border: "1px solid #2a2a3a",
        borderRadius: "20px",
        padding: "6px 14px",
        fontSize: "11px",
        fontFamily: "IBM Plex Mono, monospace",
        color: "#8888a0",
        pointerEvents: "none",
        display: "flex",
        gap: "6px",
        alignItems: "center",
        boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
        zIndex: 10,
      }}
    >
      <span style={{ color: "#4f8ef7" }}>{matchedTables.length}</span>
      {matchedTables.length === 1 ? "table" : "tables"} matching
      <span style={{ color: "#e8e8f0" }}>"{searchTerm}"</span>
    </div>
  );
}
