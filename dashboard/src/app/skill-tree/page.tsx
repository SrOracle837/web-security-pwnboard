"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  type NodeTypes,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

interface TopicDef {
  name: string;
  category: string;
  starter: boolean;
  description: string;
  labs: { apprentice: number; practitioner: number; expert: number };
  prerequisites?: { topic: string; min_apprentice: number }[];
}

interface APIData {
  player: {
    player: { level: number };
    progress: Record<string, {
      apprentice?: { completed: string[] };
      practitioner?: { completed: string[] };
      expert?: { completed: string[] };
    }>;
  };
  skillTree: { topics: Record<string, TopicDef> };
}

const catColors: Record<string, { bg: string; border: string; text: string; progressBg: string }> = {
  "server-side": { bg: "#faf5f3", border: "#c0533e", text: "#c0533e", progressBg: "#c0533e" },
  "client-side": { bg: "#f3f7f4", border: "#548a6a", text: "#548a6a", progressBg: "#548a6a" },
  advanced: { bg: "#f6f4f1", border: "#9c9590", text: "#6b6560", progressBg: "#9c9590" },
};

interface TopicNodeData {
  [key: string]: unknown;
  label: string;
  category: string;
  completed: number;
  total: number;
  locked: boolean;
  description: string;
  prereqNames: string[];
  floatDelay: number;
}

function TopicNode({ data }: { data: TopicNodeData }) {
  const [hovered, setHovered] = useState(false);
  const c = catColors[data.category] || catColors["server-side"];
  const pct = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
  const mastered = pct === 100;

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{}}
    >
      <div
        className="px-5 py-4 rounded-xl min-w-[200px] transition-all duration-200"
        style={{
          background: data.locked ? "#faf8f5" : c.bg,
          border: `1.5px solid ${data.locked ? "#ddd8d0" : mastered ? "#548a6a" : c.border}`,
          opacity: data.locked ? 0.95 : 1,
          transform: hovered ? "scale(1.03)" : "none",
          boxShadow: hovered ? "0 6px 16px rgba(0,0,0,0.07)" : "0 1px 4px rgba(0,0,0,0.03)",
        }}
      >
        <Handle type="target" position={Position.Top} className="!bg-transparent !border-0" />

        <div className="flex items-center gap-1.5 mb-2">
          {data.locked && <span className="text-xs">{"\u{1F512}"}</span>}
          {mastered && <span className="text-xs">{"\u2713"}</span>}
          <p className="text-sm font-medium" style={{ color: data.locked ? "#9c9590" : c.text }}>
            {data.label}
          </p>
        </div>

        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "#eae6e0" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: mastered ? "#548a6a" : data.locked ? "transparent" : c.progressBg,
            }}
          />
        </div>

        <div className="flex items-center justify-between mt-1">
          <p className="text-xs" style={{ color: "#9c9590" }}>
            {data.locked ? "Locked" : `${data.completed}/${data.total}`}
          </p>
          {!data.locked && pct > 0 && (
            <p className="text-xs font-medium" style={{ color: mastered ? "#548a6a" : c.text }}>
              {pct}%
            </p>
          )}
        </div>

        <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0" />
      </div>

      {hovered && (
        <div
          className="absolute left-1/2 -translate-x-1/2 mb-2 w-56 p-3 rounded-xl text-xs pointer-events-none"
          style={{
            background: "#faf8f5",
            border: "1px solid #ddd8d0",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            bottom: "100%",
            zIndex: 1000,
          }}
        >
          <p className="font-medium text-foreground mb-1">{data.label}</p>
          <p className="text-muted leading-relaxed mb-2">{data.description}</p>
          {data.locked && data.prereqNames.length > 0 && (
            <div className="pt-2 border-t" style={{ borderColor: "#eae6e0" }}>
              <p className="text-muted font-medium mb-0.5">Requires:</p>
              {data.prereqNames.map((name, i) => (
                <p key={i} className="text-muted">{"\u2192"} {name}</p>
              ))}
            </div>
          )}
          {!data.locked && (
            <div className="pt-2 border-t" style={{ borderColor: "#eae6e0" }}>
              <div className="flex justify-between text-muted">
                <span>Progress</span>
                <span>{data.completed}/{data.total}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const nodeTypes: NodeTypes = { topic: TopicNode };

const W = 2400; // total width — fills wide screens
const R = 180;   // row height

function row(n: number, i: number): number {
  const gap = W / (n + 1);
  return Math.round(gap * (i + 1) - 80);
}

const positions: Record<string, { x: number; y: number }> = {
  // Row 0 — 7 Starters
  "sql-injection":        { x: row(7,0), y: R*0 },
  xss:                    { x: row(7,1), y: R*0 },
  authentication:         { x: row(7,2), y: R*0 },
  "access-control":       { x: row(7,3), y: R*0 },
  "command-injection":    { x: row(7,4), y: R*0 },
  "information-disclosure": { x: row(7,5), y: R*0 },
  "path-traversal":       { x: row(7,6), y: R*0 },
  // Row 1 — 5 nodes
  xxe:                    { x: row(5,0), y: R*1 },
  "nosql-injection":      { x: row(5,1), y: R*1 },
  csrf:                   { x: row(5,2), y: R*1 },
  "dom-based":            { x: row(5,3), y: R*1 },
  oauth:                  { x: row(5,4), y: R*1 },
  // Row 2 — 5 nodes
  "file-upload":          { x: row(5,0), y: R*2 },
  ssrf:                   { x: row(5,1), y: R*2 },
  "business-logic":       { x: row(5,2), y: R*2 },
  websockets:             { x: row(5,3), y: R*2 },
  "web-cache-deception":  { x: row(5,4), y: R*2 },
  // Row 3 — 5 nodes
  "api-testing":          { x: row(5,0), y: R*3 },
  clickjacking:           { x: row(5,1), y: R*3 },
  cors:                   { x: row(5,2), y: R*3 },
  "prototype-pollution":  { x: row(5,3), y: R*3 },
  jwt:                    { x: row(5,4), y: R*3 },
  // Row 4 — 3 nodes
  "race-conditions":      { x: row(3,0), y: R*4 },
  "http-host-header":     { x: row(3,1), y: R*4 },
  ssti:                   { x: row(3,2), y: R*4 },
  // Row 5 — 5 Advanced
  graphql:                    { x: row(5,0), y: R*5 },
  "http-request-smuggling":   { x: row(5,1), y: R*5 },
  "web-cache-poisoning":      { x: row(5,2), y: R*5 },
  "insecure-deserialization": { x: row(5,3), y: R*5 },
  "web-llm-attacks":          { x: row(5,4), y: R*5 },
};

export default function SkillTreePage() {
  const [data, setData] = useState<APIData | null>(null);

  useEffect(() => { fetch("/api/state").then((r) => r.json()).then(setData); }, []);

  const buildGraph = useCallback((): { nodes: Node[]; edges: Edge[] } => {
    if (!data) return { nodes: [], edges: [] };
    const { skillTree, player } = data;
    const topics = skillTree.topics;
    let idx = 0;

    const nodes: Node[] = Object.entries(topics).map(([id, def]) => {
      const p = player.progress[id];
      const completed = (p?.apprentice?.completed?.length ?? 0) + (p?.practitioner?.completed?.length ?? 0) + (p?.expert?.completed?.length ?? 0);
      const total = def.labs.apprentice + def.labs.practitioner + def.labs.expert;
      const prereqNames = (def.prerequisites || []).map((pr) => topics[pr.topic]?.name || pr.topic);
      idx++;

      return {
        id, type: "topic", position: positions[id] || { x: 0, y: 0 },
        data: {
          label: def.name, category: def.category, completed, total,
          locked: !def.starter, description: def.description, prereqNames,
          floatDelay: idx,
        } as TopicNodeData,
      };
    });

    const edges: Edge[] = [];
    for (const [id, def] of Object.entries(topics)) {
      if (def.prerequisites) {
        for (const pr of def.prerequisites) {
          const sourceProgress = player.progress[pr.topic];
          const sourceCompleted = (sourceProgress?.apprentice?.completed?.length ?? 0);
          const isActive = sourceCompleted >= pr.min_apprentice;

          edges.push({
            id: `${pr.topic}-${id}`,
            source: pr.topic,
            target: id,
            style: {
              stroke: isActive ? "#c0533e" : "#c8c2ba",
              strokeWidth: isActive ? 2 : 1.5,
              strokeDasharray: isActive ? undefined : "6 4",
            },
            animated: isActive,
          });
        }
      }
    }
    return { nodes, edges };
  }, [data]);

  if (!data) return <div className="flex items-center justify-center h-full text-muted">Loading...</div>;

  const { nodes, edges } = buildGraph();

  const legend = [
    { color: "#c0533e", label: "Server-side" },
    { color: "#548a6a", label: "Client-side" },
    { color: "#9c9590", label: "Advanced" },
  ];

  return (
    <div className="h-[calc(100vh-3rem)]">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Skill Tree</h1>
          <p className="text-sm text-muted mt-0.5">Hover topics for details. Dashed lines = locked prerequisites.</p>
        </div>
        <div className="flex items-center gap-4">
          {legend.map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
              <span className="text-xs text-muted">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="h-[calc(100%-3.5rem)] rounded-2xl border border-border overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.02 }}
          minZoom={0.3}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
        >
          <Background color="#ece8e2" gap={20} size={1} />
          <Controls className="!bg-card !border-border !rounded-xl [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-muted [&>button:hover]:!bg-surface-light" />
        </ReactFlow>
      </div>
    </div>
  );
}
