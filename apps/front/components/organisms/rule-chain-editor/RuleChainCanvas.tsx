"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  type Node,
  type Edge,
  type Connection,
  BackgroundVariant,
  MarkerType,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { InputNode } from "./nodes/InputNode";
import { RuleNode } from "./nodes/RuleNode";
import type { RuleNodeDefinition } from "@/types/ruleChainTypes";
import { NodeConfigPanel, isConfigurableNode } from "./NodeConfigPanel";
import { RULE_NODE_DEFINITIONS } from "@/lib/constants/ruleNodeDefinitions";

// ─── Custom node types map ────────────────────────────────────────────────────
const NODE_TYPES: NodeTypes = {
  ruleInput: InputNode as any,
  ruleNode: RuleNode as any,
};

// ─── Starting Input node ──────────────────────────────────────────────────────
const INITIAL_NODES: Node[] = [
  {
    id: "input-start",
    type: "ruleInput",
    position: { x: 60, y: 200 },
    data: {
      label: "Input",
      nodeType: "input",
      category: "Flow",
      color: "bg-green-300 dark:bg-green-600",
      isInput: true,
    },
    draggable: false,
    selectable: false,
    deletable: false,
  },
];

let nodeSeq = 1;
const newId = () => `rule_${nodeSeq++}`;

// ─── Inner canvas (must sit inside ReactFlowProvider) ─────────────────────────
interface CanvasInnerProps {
  canvasApiRef: React.MutableRefObject<CanvasApi | null>;
  initialMetadata?: any;
}

export interface CanvasApi {
  addNode: (def: RuleNodeDefinition) => void;
  getRuleChainMetadata: () => {
    nodes: any[];
    connections: any[];
    firstNodeIndex?: number;
  };
  loadRuleChainMetadata: (metadata: any) => void;
}

function CanvasInner({ canvasApiRef, initialMetadata }: CanvasInnerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // ── Config panel state ──────────────────────────────────────────────────
  const [configNode, setConfigNode] = useState<Node | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  // ── Add node (click from library) ──────────────────────────────────────
  const addNodeAtCenter = useCallback(
    (def: RuleNodeDefinition) => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      const cx = rect ? rect.left + rect.width / 2 : 600;
      const cy = rect ? rect.top + rect.height / 2 : 400;
      const position = screenToFlowPosition({ x: cx, y: cy });

      const newNode: Node = {
        id: newId(),
        type: "ruleNode",
        position: {
          x: position.x + (Math.random() - 0.5) * 80,
          y: position.y + (Math.random() - 0.5) * 80,
        },
        data: {
          label: def.label,
          nodeType: def.type,
          typeName: def.label,
          category: def.category,
          color: def.color,
          description: "",
          configuration: undefined, // filled when user configures
        },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [screenToFlowPosition, setNodes],
  );

  const getRuleChainMetadata = useCallback(() => {
    // 1) Filter out input node; TB doesn't save it as a "rule node", it uses `firstNodeIndex`.
    const actualNodes = nodes.filter((n) => n.id !== "input-start");

    // Create an object map of ID -> sequence index for building connections
    const nodeIdToIndex: Record<string, number> = {};
    actualNodes.forEach((n, idx) => {
      nodeIdToIndex[n.id] = idx;
    });

    // Determine firstNodeIndex (connection FROM input node)
    const startEdge = edges.find((e) => e.source === "input-start");
    const firstNodeIndex = startEdge
      ? nodeIdToIndex[startEdge.target]
      : undefined;

    // 2) Build nodes payload
    const tbNodes = actualNodes.map((n) => {
      const data = n.data as any;
      const tbNode: Record<string, any> = {
        type: data.nodeType,
        name: data.label,
        configurationVersion: data.configurationVersion || 1,
        configuration: data.configuration,
        additionalInfo: {
          description: data.description || "",
          layoutX: Math.round(n.position.x),
          layoutY: Math.round(n.position.y),
        },
        debugSettings: data.debugSettings || null,
        singletonMode: data.singletonMode || false,
        queueName: data.queueName || null,
      };

      // Only include id if it's an existing node retrieved from the backend
      if (data.originalId) {
        tbNode.id = { entityType: "RULE_NODE", id: data.originalId };
      }

      return tbNode;
    });

    // 3) Build connections payload (excluding input node)
    const connections = edges
      .filter((e) => e.source !== "input-start")
      .map((e) => {
        // By default ReactFlow edges don't have labeled success/failure.
        // Real implementations will eventually map labels or connection points.
        // Assuming "Success" for now.
        return {
          fromIndex: nodeIdToIndex[e.source],
          toIndex: nodeIdToIndex[e.target],
          type: "Success",
        };
      })
      .filter((c) => c.fromIndex !== undefined && c.toIndex !== undefined);

    return {
      nodes: tbNodes,
      connections,
      firstNodeIndex,
    };
  }, [nodes, edges]);

  const loadRuleChainMetadata = useCallback(
    (metadata: any) => {
      if (!metadata) return;

      // 1. Prepare base nodes list starting with input node
      const newNodes: Node[] = [...INITIAL_NODES];
      const newEdges: Edge[] = [];

      const tbNodes = metadata.nodes || [];
      const tbConnections = metadata.connections || [];

      // Create map for node index -> reactflow ID
      const indexToId: Record<number, string> = {};

      tbNodes.forEach((tbNode: any, idx: number) => {
        // Lookup definitions to restore visual color/category
        const definition = RULE_NODE_DEFINITIONS.find(
          (d) => d.type === tbNode.type,
        );
        const reactFlowId = `rule_${tbNode.id?.id || nodeSeq++}`;
        indexToId[idx] = reactFlowId;

        newNodes.push({
          id: reactFlowId,
          type: "ruleNode",
          position: {
            x: tbNode.additionalInfo?.layoutX || 100 + idx * 50,
            y: tbNode.additionalInfo?.layoutY || 200 + idx * 20,
          },
          data: {
            label: tbNode.name,
            nodeType: tbNode.type,
            typeName: definition?.label || "Unknown",
            category: definition?.category || "Unknown",
            color: definition?.color || "bg-slate-300 dark:bg-slate-600",
            description: tbNode.additionalInfo?.description || "",
            configuration: tbNode.configuration,
            configurationVersion: tbNode.configurationVersion || 1,
            debugSettings: tbNode.debugSettings || null,
            singletonMode: tbNode.singletonMode || false,
            queueName: tbNode.queueName || null,
            originalId: tbNode.id?.id,
          },
        });
      });

      // 2. Establish connections between nodes
      tbConnections.forEach((conn: any, idx: number) => {
        const fromId = indexToId[conn.fromIndex];
        const toId = indexToId[conn.toIndex];
        if (fromId && toId) {
          newEdges.push({
            id: `edge_${idx}_${fromId}_${toId}`,
            source: fromId,
            target: toId,
            animated: false,
            markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18 },
            style: { strokeWidth: 2, stroke: "#94a3b8" },
          });
        }
      });

      // 3. Setup first node connection
      if (
        metadata.firstNodeIndex !== undefined &&
        metadata.firstNodeIndex !== null
      ) {
        const firstTargetId = indexToId[metadata.firstNodeIndex];
        if (firstTargetId) {
          newEdges.push({
            id: `edge_startup_input_to_${firstTargetId}`,
            source: "input-start",
            target: firstTargetId,
            animated: false,
            markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18 },
            style: { strokeWidth: 2, stroke: "#94a3b8" },
          });
        }
      }

      setNodes(newNodes);
      setEdges(newEdges);

      // Defer fitView nicely after states reconcile
      setTimeout(() => {
        fitView({ padding: 0.3, duration: 400 });
      }, 50);
    },
    [setNodes, setEdges, fitView],
  );

  // Handle initialization if initialMetadata is passed
  useEffect(() => {
    if (initialMetadata) {
      loadRuleChainMetadata(initialMetadata);
    }
  }, [initialMetadata, loadRuleChainMetadata]);

  // Expose methods directly using ref
  canvasApiRef.current = {
    addNode: addNodeAtCenter,
    getRuleChainMetadata,
    loadRuleChainMetadata,
  };
  // ── Connections ─────────────────────────────────────────────────────────
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: false,
            markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18 },
            style: { strokeWidth: 2, stroke: "#94a3b8" },
          },
          eds,
        ),
      ),
    [setEdges],
  );

  // ── Drag-and-drop from sidebar ──────────────────────────────────────────
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const raw = event.dataTransfer.getData("application/rulenode");
      if (!raw) return;

      const def: RuleNodeDefinition = JSON.parse(raw);
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: newId(),
        type: "ruleNode",
        position,
        data: {
          label: def.label,
          nodeType: def.type,
          typeName: def.label,
          category: def.category,
          color: def.color,
          description: "",
          configuration: undefined,
        },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [screenToFlowPosition, setNodes],
  );

  // ── Node click → open config panel ─────────────────────────────────────
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const nodeType = (node.data as any)?.nodeType ?? "";
    if (isConfigurableNode(nodeType)) {
      setConfigNode(node);
      setPanelOpen(true);
    }
  }, []);

  // ── Save changes from config panel ─────────────────────────────────────
  const handleConfigSave = useCallback(
    (nodeId: string, name: string, description: string, configuration: any) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                data: { ...n.data, label: name, description, configuration },
              }
            : n,
        ),
      );
      // Update configNode so the panel title refreshes
      setConfigNode((prev) =>
        prev?.id === nodeId
          ? {
              ...prev,
              data: { ...prev.data, label: name, description, configuration },
            }
          : prev,
      );
      setPanelOpen(false);
    },
    [setNodes],
  );

  return (
    <div
      ref={wrapperRef}
      className="h-full w-full"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        deleteKeyCode="Delete"
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        className="dark:bg-slate-950"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          className="dark:opacity-30"
        />
        <Controls className="dark:[&>button]:bg-slate-800 dark:[&>button]:text-white dark:[&>button]:border-slate-700" />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === "ruleInput") return "#4ade80";
            const color = (node.data as any)?.color ?? "";
            if (color.includes("yellow")) return "#facc15";
            if (color.includes("green")) return "#4ade80";
            if (color.includes("blue")) return "#60a5fa";
            if (color.includes("orange")) return "#fb923c";
            if (color.includes("teal")) return "#2dd4bf";
            if (color.includes("red")) return "#f87171";
            return "#94a3b8";
          }}
          className="dark:bg-slate-900 dark:border-slate-700"
          maskColor="rgba(0,0,0,0.15)"
        />
      </ReactFlow>

      {/* Config side-panel — rendered outside ReactFlow to avoid pointer-event conflicts */}
      <NodeConfigPanel
        node={configNode}
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        onSave={handleConfigSave}
      />
    </div>
  );
}

// ─── Public wrapper ───────────────────────────────────────────────────────────
interface RuleChainCanvasProps {
  canvasApiRef: React.MutableRefObject<CanvasApi | null>;
  initialMetadata?: any;
}

export function RuleChainCanvas({
  canvasApiRef,
  initialMetadata,
}: RuleChainCanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner
        canvasApiRef={canvasApiRef}
        initialMetadata={initialMetadata}
      />
    </ReactFlowProvider>
  );
}
