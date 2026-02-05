"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import WorkflowCanvas from "@/components/canvas/WorkflowCanvas";

export default function DashboardPage() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);

  return (
    <div className="flex h-screen flex-col bg-[#0f0f0f]">

      <header className="h-14 border-b border-[#1f1f1f] bg-[#111111] flex items-center px-6">
        <div className="text-sm font-semibold">Weavy Clone</div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        <aside className="w-64 border-r border-[#1f1f1f] bg-[#121212]">
          <Sidebar setNodes={setNodes} />
        </aside>

        <main className="flex-1 flex flex-col bg-[#0f0f0f]">
          <WorkflowCanvas
            nodes={nodes}
            setNodes={setNodes}
            edges={edges}
            setEdges={setEdges}
          />
        </main>

        <aside className="w-[300px] border-l border-[#1f1f1f] bg-[#121212]" />

      </div>
    </div>
  );
}
