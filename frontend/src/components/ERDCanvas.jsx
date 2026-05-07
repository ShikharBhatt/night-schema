import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import TableNode from "./TableNode";
import { buildLayout } from "../hooks/useLayout";

const nodeTypes = { tableNode: TableNode };

export default function ERDCanvas({ schema, searchTerm, focusTableId, onFocusDone }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView, setCenter, getNode } = useReactFlow();
  const initialLayoutDone = useRef(false);

  // Rebuild layout when schema or search changes
  useEffect(() => {
    if (!schema) return;
    const { nodes: newNodes, edges: newEdges } = buildLayout(schema, searchTerm);
    setNodes(newNodes);
    setEdges(newEdges);

    if (!initialLayoutDone.current) {
      initialLayoutDone.current = true;
      // Fit after first render
      setTimeout(() => fitView({ padding: 0.15, duration: 400 }), 100);
    }
  }, [schema, searchTerm]);

  // Focus on a specific table when requested from sidebar
  useEffect(() => {
    if (!focusTableId) return;
    const node = getNode(focusTableId);
    if (node) {
      setCenter(
        node.position.x + 140,
        node.position.y + 100,
        { zoom: 1.2, duration: 500 }
      );
    }
    onFocusDone?.();
  }, [focusTableId]);

  return (
    <div style={{ flex: 1, height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.05}
        maxZoom={2}
        defaultEdgeOptions={{
          type: "smoothstep",
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#1e1e2a"
        />
        <Controls
          style={{ bottom: 24, left: 16 }}
          showInteractive={false}
        />
        <MiniMap
          style={{ bottom: 24, right: 16 }}
          nodeColor={(n) =>
            n.data?.isHighlighted
              ? "#4f8ef7"
              : n.data?.isDimmed
              ? "#111118"
              : "#1a1a24"
          }
          maskColor="rgba(0,0,0,0.6)"
          zoomable
          pannable
        />
      </ReactFlow>
    </div>
  );
}
