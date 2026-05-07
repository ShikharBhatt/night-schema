/**
 * Converts schema into React Flow nodes/edges with a simple grid layout.
 * Tables are arranged in columns; connected tables are pulled toward each other.
 */

const NODE_WIDTH = 280;
const NODE_GAP_X = 80;
const NODE_GAP_Y = 60;
const HEADER_HEIGHT = 48;
const ROW_HEIGHT = 28;
const PADDING = 16;
const FOOTER_HEIGHT = 26;

export function buildLayout(schema, searchTerm = "") {
  const { tables, relationships } = schema;
  const search = searchTerm.toLowerCase().trim();

  // Determine which tables/columns match the search
  const tableMatches = new Set();
  const columnMatches = new Map(); // tableId -> Set of column names

  if (search) {
    for (const table of tables) {
      const tableNameMatch =
        table.name.toLowerCase().includes(search) ||
        table.schema.toLowerCase().includes(search);

      const matchingCols = new Set();
      for (const col of table.columns) {
        if (
          col.name.toLowerCase().includes(search) ||
          col.displayType?.toLowerCase().includes(search)
        ) {
          matchingCols.add(col.name);
        }
      }

      if (tableNameMatch || matchingCols.size > 0) {
        tableMatches.add(table.id);
        if (matchingCols.size > 0) {
          columnMatches.set(table.id, matchingCols);
        }
      }
    }
  }

  // Auto layout: simple column grid, 4 tables per column
  const COLS = Math.ceil(Math.sqrt(tables.length));
  const positions = {};
  const tableLayouts = tables.map((table, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const nodeHeight =
      HEADER_HEIGHT + table.columns.length * ROW_HEIGHT + FOOTER_HEIGHT + PADDING;

    return {
      id: table.id,
      col,
      row,
      nodeHeight,
    };
  });

  // Use per-row max heights to avoid overlaps when cards in the same row have different sizes.
  const rowHeights = new Map();
  for (const layout of tableLayouts) {
    const prev = rowHeights.get(layout.row) || 0;
    rowHeights.set(layout.row, Math.max(prev, layout.nodeHeight));
  }

  const rowOffsets = new Map();
  let accumulatedY = 0;
  const totalRows = Math.ceil(tables.length / COLS);
  for (let row = 0; row < totalRows; row += 1) {
    rowOffsets.set(row, accumulatedY);
    accumulatedY += (rowHeights.get(row) || 0) + NODE_GAP_Y;
  }

  for (const layout of tableLayouts) {
    positions[layout.id] = {
      x: layout.col * (NODE_WIDTH + NODE_GAP_X),
      y: rowOffsets.get(layout.row) || 0,
    };
  }

  // Build nodes
  const nodes = tables.map((table) => {
    const isHighlighted = search ? tableMatches.has(table.id) : false;
    const isDimmed = search && !tableMatches.has(table.id);
    const matchCols = columnMatches.get(table.id) || new Set();

    return {
      id: table.id,
      type: "tableNode",
      position: positions[table.id] || { x: 0, y: 0 },
      data: {
        table,
        isHighlighted,
        isDimmed,
        matchingColumns: matchCols,
        searchTerm: search,
      },
      draggable: true,
    };
  });

  // Build edges
  const edges = relationships.map((rel, i) => {
    const id = `${rel.sourceTable}-${rel.sourceColumn}->${rel.targetTable}-${rel.targetColumn}-${i}`;
    const isHighlighted =
      search &&
      (tableMatches.has(rel.sourceTable) || tableMatches.has(rel.targetTable));
    const isDimmed =
      search &&
      !tableMatches.has(rel.sourceTable) &&
      !tableMatches.has(rel.targetTable);

    return {
      id,
      source: rel.sourceTable,
      target: rel.targetTable,
      sourceHandle: `${rel.sourceTable}-${rel.sourceColumn}-source`,
      targetHandle: `${rel.targetTable}-${rel.targetColumn}-target`,
      type: "smoothstep",
      animated: isHighlighted,
      data: { rel },
      style: {
        stroke: isDimmed
          ? "#1e1e2a"
          : isHighlighted
          ? "#4f8ef7"
          : "#2a2a3a",
        strokeWidth: isHighlighted ? 2 : 1.5,
        opacity: isDimmed ? 0.2 : 1,
      },
      markerEnd: {
        type: "arrowclosed",
        color: isDimmed ? "#1e1e2a" : isHighlighted ? "#4f8ef7" : "#2a2a3a",
        width: 16,
        height: 16,
      },
    };
  });

  return { nodes, edges };
}
