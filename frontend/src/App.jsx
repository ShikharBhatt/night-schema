import React, { useState, useCallback } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { useSchema } from "./hooks/useSchema";
import Sidebar from "./components/Sidebar";
import ERDCanvas from "./components/ERDCanvas";

export default function App() {
  const { schema, loading, error, refetch } = useSchema();
  const [searchTerm, setSearchTerm] = useState("");
  const [focusTarget, setFocusTarget] = useState(null);
  const [isLightTheme, setIsLightTheme] = useState(true);

  const handleFocusTable = useCallback((tableId, columnName = null) => {
    setFocusTarget({ tableId, columnName, nonce: Date.now() });
  }, []);

  const toggleTheme = useCallback(() => {
    setIsLightTheme(prev => !prev);
  }, []);

  // Clear focus when user starts searching
  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
    if (term && focusTarget) {
      setFocusTarget(null);
    }
  }, [focusTarget]);

  return (
    <div
      className={isLightTheme ? "light-theme" : ""}
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
        onSearchChange={handleSearchChange}
        onFocusTable={handleFocusTable}
        onRefetch={refetch}
        loading={loading}
        isLightTheme={isLightTheme}
        onToggleTheme={toggleTheme}
        focusTarget={focusTarget}
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
              focusTarget={focusTarget}
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
        color: "var(--text-muted)",
        fontFamily: "IBM Plex Mono, monospace",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "2px solid var(--border)",
          borderTop: "2px solid var(--accent)",
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
      <div style={{ fontSize: "16px", color: "var(--danger)", fontWeight: 600 }}>
        Connection Failed
      </div>
      <div
        style={{
          fontSize: "12px",
          color: "var(--text-secondary)",
          maxWidth: "400px",
          lineHeight: 1.6,
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          padding: "16px",
        }}
      >
        {error}
      </div>
      <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.8 }}>
        Make sure your backend is running:<br />
        <span style={{ color: "var(--accent)" }}>cd backend && npm run dev</span>
        <br />and <span style={{ color: "var(--accent)" }}>DATABASE_URL</span> is set in <span style={{ color: "var(--accent)" }}>.env</span>
      </div>
      <button
        onClick={onRetry}
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          color: "var(--text-primary)",
          fontSize: "12px",
          fontFamily: "IBM Plex Mono, monospace",
          padding: "8px 20px",
          cursor: "pointer",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--accent)";
          e.currentTarget.style.color = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.color = "var(--text-primary)";
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
