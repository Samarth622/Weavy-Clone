"use client";

import ReactFlow, {
  Background,
  Controls,
} from "reactflow";
import "reactflow/dist/style.css";

export default function WorkflowCanvas() {
  return (
    <div className="w-full h-full">
      <ReactFlow fitView>
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
