"use client";

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  Edge,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import "reactflow/dist/style.css";
import { useMemo, useCallback, useRef } from "react";

import UploadImageNode from "../nodes/UploadImageNode";
import UploadVideoNode from "../nodes/UploadVideoNode";
import CropNode from "../nodes/CropNode";
import ExtractFrameNode from "../nodes/ExtractFrameNode";
import PromptNode from "../nodes/PromptNode";
import LLMNode from "../nodes/LLMNode";

interface Props {
  nodes: any[];
  setNodes: any;
  edges: any[];
  setEdges: any;
  onSelectionChange?: (ids: string[]) => void;
}

/* ============================================
   OUTPUT TYPE MAPPING (OUTSIDE COMPONENT)
============================================ */
const getNodeOutputType = (
  type: string
): string | null => {
  switch (type) {
    case "prompt":
      return "text";
    case "uploadImage":
      return "image";
    case "uploadVideo":
      return "video";
    case "extract":
      return "image";
    case "crop":
      return "image";
    case "llm":
      return "text";
    default:
      return null;
  }
};

export default function WorkflowCanvas({
  nodes,
  setNodes,
  edges,
  setEdges,
  onSelectionChange,
}: Props) {
  /* ============================================
     SELECTION LOOP PREVENTION
  ============================================ */
  const selectionRef = useRef<string[]>([]);

  const handleSelectionChange = useCallback(
    (elements: any) => {
      const ids =
        elements?.nodes?.map((n: any) => n.id) ||
        [];

      if (
        JSON.stringify(ids) ===
        JSON.stringify(selectionRef.current)
      ) {
        return;
      }

      selectionRef.current = ids;

      onSelectionChange?.(ids);
    },
    [onSelectionChange]
  );

  /* ============================================
     DELETE NODE
  ============================================ */
  const handleDeleteNode = useCallback(
    (id: string) => {
      setNodes((nds: any[]) =>
        nds.filter((n) => n.id !== id)
      );

      setEdges((eds: any[]) =>
        eds.filter(
          (e) =>
            e.source !== id &&
            e.target !== id
        )
      );
    },
    [setNodes, setEdges]
  );

  /* ============================================
     NODE TYPES
  ============================================ */
  const nodeTypes = useMemo(
    () => ({
      llm: (props: any) => (
        <LLMNode
          {...props}
          onDelete={handleDeleteNode}
        />
      ),
      uploadImage: (props: any) => (
        <UploadImageNode
          {...props}
          onDelete={handleDeleteNode}
        />
      ),
      uploadVideo: (props: any) => (
        <UploadVideoNode
          {...props}
          onDelete={handleDeleteNode}
        />
      ),
      crop: (props: any) => (
        <CropNode
          {...props}
          onDelete={handleDeleteNode}
        />
      ),
      extract: (props: any) => (
        <ExtractFrameNode
          {...props}
          onDelete={handleDeleteNode}
        />
      ),
      prompt: (props: any) => (
        <PromptNode
          {...props}
          onDelete={handleDeleteNode}
        />
      ),
    }),
    [handleDeleteNode]
  );

  /* ============================================
     TYPE-SAFE CONNECTION VALIDATION
  ============================================ */
  const isValidConnection = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find(
        (n) => n.id === connection.source
      );

      const targetNode = nodes.find(
        (n) => n.id === connection.target
      );

      if (!sourceNode || !targetNode)
        return false;

      const outputType =
        getNodeOutputType(sourceNode.type);

      // Cannot connect INTO these
      if (
        ["prompt", "uploadImage", "uploadVideo"].includes(
          targetNode.type
        )
      ) {
        return false;
      }

      if (targetNode.type === "extract") {
        return outputType === "video";
      }

      if (targetNode.type === "crop") {
        return outputType === "image";
      }

      if (targetNode.type === "llm") {
        return (
          outputType === "text" ||
          outputType === "image"
        );
      }

      return false;
    },
    [nodes]
  );

  /* ============================================
     NODE / EDGE CHANGE HANDLERS
  ============================================ */
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds: any[]) =>
        applyNodeChanges(changes, nds)
      );
    },
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds: any[]) =>
        applyEdgeChanges(changes, eds)
      );
    },
    [setEdges]
  );

  /* ============================================
     CONNECT EDGE
  ============================================ */
  const onConnect = useCallback(
    (connection: Connection) => {
      if (!isValidConnection(connection))
        return;

      const newEdge: any = {
        ...connection,
        id: `${connection.source}-${connection.target}-${Date.now()}`,
        animated: true,
        style: {
          stroke: "#7C3AED",
          strokeWidth: 2,
        },
      };

      setEdges((eds: Edge[]) =>
        addEdge(newEdge, eds)
      );
    },
    [setEdges, isValidConnection]
  );

  /* ============================================
     UI
  ============================================ */
  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onSelectionChange={
          handleSelectionChange
        }
        fitView
      >
        <MiniMap
          position="bottom-right"
          pannable
          zoomable
          nodeStrokeColor={(n) => {
            if (n.type === "llm")
              return "#7C3AED";
            if (n.type === "uploadImage")
              return "#10b981";
            if (n.type === "uploadVideo")
              return "#3b82f6";
            if (n.type === "extract")
              return "#f59e0b";
            if (n.type === "crop")
              return "#ef4444";
            if (n.type === "prompt")
              return "#14b8a6";
            return "#999";
          }}
          nodeColor={() => "#1b1b1b"}
          maskColor="rgba(0,0,0,0.6)"
        />

        <Background
          gap={20}
          size={1}
          color="#1f1f1f"
        />

        <Controls />
      </ReactFlow>
    </div>
  );
}
