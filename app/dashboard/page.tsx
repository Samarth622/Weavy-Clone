"use client";

import { useState, useCallback } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import WorkflowCanvas from "@/components/canvas/WorkflowCanvas";

export default function DashboardPage() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);

  const runWorkflow = async () => {
    // Reset all nodes
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, status: "idle" },
      }))
    );

    const incomingCount: Record<string, number> = {};
    const adjacency: Record<string, string[]> = {};

    nodes.forEach((node) => {
      incomingCount[node.id] = 0;
      adjacency[node.id] = [];
    });

    edges.forEach((edge) => {
      incomingCount[edge.target]++;
      adjacency[edge.source].push(edge.target);
    });

    let queue = Object.keys(incomingCount).filter(
      (id) => incomingCount[id] === 0
    );

    let processedCount = 0;

    while (queue.length > 0) {
      const currentBatch = [...queue];
      queue = [];

      await Promise.all(
        currentBatch.map(async (nodeId) => {
          processedCount++;

          setNodes((nds) =>
            nds.map((n) =>
              n.id === nodeId
                ? { ...n, data: { ...n.data, status: "running" } }
                : n
            )
          );

          await new Promise((res) =>
            setTimeout(res, 1000 + Math.random() * 1000)
          );

          setNodes((nds) =>
            nds.map((n) =>
              n.id === nodeId
                ? { ...n, data: { ...n.data, status: "success" } }
                : n
            )
          );
        })
      );

      currentBatch.forEach((nodeId) => {
        adjacency[nodeId].forEach((neighborId) => {
          incomingCount[neighborId]--;
          if (incomingCount[neighborId] === 0) {
            queue.push(neighborId);
          }
        });
      });
    }

    // 🚨 Cycle Detection
    if (processedCount !== nodes.length) {
      alert("Cycle detected! Workflow must be acyclic.");

      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: { ...n.data, status: "error" },
        }))
      );
    }
  };


  return (
    <div className="flex h-screen flex-col bg-[#0f0f0f]">

      {/* Top Navigation */}
      <header className="h-14 border-b border-[#1f1f1f] bg-[#111111] flex items-center justify-between px-6">
        <div className="text-sm font-semibold tracking-tight">
          Weavy Clone
        </div>
        <div className="w-8 h-8 rounded-full bg-[#1f1f1f]" />
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside className="w-64 border-r border-[#1f1f1f] bg-[#121212]">
          <Sidebar setNodes={setNodes} />
        </aside>

        {/* Canvas Section */}
        <main className="flex-1 flex flex-col bg-[#0f0f0f]">

          {/* Canvas Header */}
          <div className="h-14 border-b border-[#1f1f1f] flex items-center justify-between px-6">
            <div className="text-sm font-medium text-gray-400">
              Untitled Workflow
            </div>

            <button
              onClick={() => {
                console.log("Run clicked");
                runWorkflow();
              }}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-sm font-medium px-4 py-2 rounded-md transition-colors"
            >
              Run
            </button>
          </div>

          {/* Canvas Body */}
          <div className="flex-1 relative">
            <WorkflowCanvas
              nodes={nodes}
              setNodes={setNodes}
              edges={edges}
              setEdges={setEdges}
            />
          </div>

        </main>

        {/* Right Panel */}
        <aside className="w-[300px] border-l border-[#1f1f1f] bg-[#121212]" />

      </div>
    </div>
  );
}
