"use client";

import ReactFlow, {
  Background,
  Controls,
  addEdge,
  Connection,
  Edge,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import { useMemo, useRef, useState } from "react";

import { useCallback } from "react";

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

export default function WorkflowCanvas({
  nodes,
  setNodes,
  edges,
  setEdges,
  onSelectionChange,
}: Props) {

  const previousSelection = useRef<string[]>([]);

  const handleDeleteNode = useCallback(
    (id: string) => {
      setNodes((nds: any[]) => nds.filter((n) => n.id !== id));
      setEdges((eds: any[]) =>
        eds.filter((e) => e.source !== id && e.target !== id)
      );
    },
    [setNodes, setEdges]
  );

  const nodeTypes = useMemo(() => ({
    llm: (props: any) => (
      <LLMNode {...props} onDelete={handleDeleteNode} />
    ),
    uploadImage: (props: any) => (
      <UploadImageNode {...props} onDelete={handleDeleteNode} />
    ),
    uploadVideo: (props: any) => (
      <UploadVideoNode {...props} onDelete={handleDeleteNode} />
    ),
    crop: (props: any) => (
      <CropNode {...props} onDelete={handleDeleteNode} />
    ),
    extract: (props: any) => (
      <ExtractFrameNode {...props} onDelete={handleDeleteNode} />
    ),
    prompt: (props: any) => (
      <PromptNode {...props} onDelete={handleDeleteNode} />
    ),
  }), [handleDeleteNode]);


  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds: any[]) => applyNodeChanges(changes, nds));
    },
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds: any[]) => applyEdgeChanges(changes, eds));
    },
    [setEdges]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge: any = {
        ...connection,
        id: `${connection.source}-${connection.target}`,
        animated: true,
        style: { stroke: "#7C3AED", strokeWidth: 2 },
      };
      setEdges((eds: Edge[]) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        onSelectionChange={(elements) => {
          const ids =
            elements?.nodes?.map((n) => n.id) || [];

          const prev = previousSelection.current;

          const isSame =
            ids.length === prev.length &&
            ids.every((id, i) => id === prev[i]);

          if (!isSame) {
            previousSelection.current = ids;
            onSelectionChange?.(ids);
          }
        }}

      >
        <Background gap={20} size={1} color="#1f1f1f" />
        <Controls />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === "llm") return "#7C3AED";
            if (n.type === "uploadImage") return "#10B981";
            if (n.type === "uploadVideo") return "#F59E0B";
            return "#9CA3AF";
          }}
        />
      </ReactFlow>
    </div>
  );
}
