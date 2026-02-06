"use client";

import { useState, useCallback } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import WorkflowCanvas from "@/components/canvas/WorkflowCanvas";

export default function DashboardPage() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [runHistory, setRunHistory] = useState<any[]>([]);

  const replayRun = useCallback((run: any) => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          status: run.nodeResults[node.id]?.status || "idle",
          result: run.nodeResults[node.id]?.result || null,
        },
      }))
    );
  }, []);

  const runWorkflow = useCallback(async () => {
    if (nodes.length === 0) return;

    const nodeSnapshot = nodes.map((n) => ({
      ...n,
      data: { ...n.data },
    }));

    const edgeSnapshot = [...edges];

    const incomingCount: Record<string, number> = {};
    const adjacency: Record<string, string[]> = {};

    nodeSnapshot.forEach((node) => {
      incomingCount[node.id] = 0;
      adjacency[node.id] = [];
    });

    edgeSnapshot.forEach((edge) => {
      incomingCount[edge.target]++;
      adjacency[edge.source].push(edge.target);
    });

    // Structural cycle check
    const tempIncoming = { ...incomingCount };
    let tempQueue = Object.keys(tempIncoming).filter(
      (id) => tempIncoming[id] === 0
    );

    let visited = 0;

    while (tempQueue.length > 0) {
      const id = tempQueue.shift()!;
      visited++;

      adjacency[id].forEach((neighbor) => {
        tempIncoming[neighbor]--;
        if (tempIncoming[neighbor] === 0) {
          tempQueue.push(neighbor);
        }
      });
    }

    if (visited !== nodeSnapshot.length) {
      alert("Cycle detected! Workflow must be acyclic.");
      return;
    }

    // Reset UI
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, status: "idle", result: null },
      }))
    );

    let queue = Object.keys(incomingCount).filter(
      (id) => incomingCount[id] === 0
    );

    const processed = new Set<string>();

    while (queue.length > 0) {
      const currentBatch = [...queue];
      queue = [];

      const results = await Promise.all(
        currentBatch.map(async (nodeId) => {
          processed.add(nodeId);

          const node = nodeSnapshot.find((n) => n.id === nodeId);
          if (!node) return { nodeId, failed: true };

          setNodes((nds) =>
            nds.map((n) =>
              n.id === nodeId
                ? { ...n, data: { ...n.data, status: "running" } }
                : n
            )
          );

          try {
            let output = null;
            let failed = false;

            // 🔥 REAL LLM EXECUTION
            if (node.type === "llm") {
              const parentIds = edgeSnapshot
                .filter((e) => e.target === nodeId)
                .map((e) => e.source);

              // Get full parent node objects
              const parentNodes = nodeSnapshot.filter((n) =>
                parentIds.includes(n.id)
              );

              // Extract text inputs
              const textInputs = parentNodes
                .map((n) => n.data?.prompt || n.data?.result)
                .filter(Boolean);

              // Extract image input
              const imageInput = parentNodes.find(
                (n) => n.data?.image
              );

              // Final prompt
              const finalPrompt =
                textInputs.join("\n") || "Describe this image.";


              const response = await fetch("/api/trigger-llm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  prompt: finalPrompt,
                  image: imageInput?.data?.image || null,
                }),
              });

              const data = await response.json();
              if (!response.ok) throw new Error(data.error);

              output = data;

            } else {
              // Simulated execution
              await new Promise((res) => setTimeout(res, 800));
              output = `Result from ${nodeId}`;
            }

            node.data.status = "success";
            node.data.result = output;

            setNodes((nds) =>
              nds.map((n) =>
                n.id === nodeId
                  ? {
                    ...n,
                    data: {
                      ...n.data,
                      status: "success",
                      result: output,
                    },
                  }
                  : n
              )
            );

            return { nodeId, failed: false };
          } catch (err) {
            node.data.status = "error";

            setNodes((nds) =>
              nds.map((n) =>
                n.id === nodeId
                  ? { ...n, data: { ...n.data, status: "error" } }
                  : n
              )
            );

            return { nodeId, failed: true };
          }
        })
      );

      results.forEach(({ nodeId, failed }) => {
        adjacency[nodeId].forEach((neighborId) => {
          incomingCount[neighborId]--;

          if (failed) {
            const snapshotNode = nodeSnapshot.find(
              (n) => n.id === neighborId
            );
            if (snapshotNode && !processed.has(neighborId)) {
              snapshotNode.data.status = "skipped";
              processed.add(neighborId);

              setNodes((nds) =>
                nds.map((n) =>
                  n.id === neighborId
                    ? {
                      ...n,
                      data: { ...n.data, status: "skipped" },
                    }
                    : n
                )
              );
            }
          }

          if (incomingCount[neighborId] === 0 &&
            !processed.has(neighborId)) {
            queue.push(neighborId);
          }
        });
      });
    }

    // Save history
    const snapshot: any = {};
    nodeSnapshot.forEach((node) => {
      snapshot[node.id] = {
        status: node.data?.status,
        result: node.data?.result,
      };
    });

    setRunHistory((prev) => [
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        nodeResults: snapshot,
      },
      ...prev,
    ]);
  }, [nodes, edges]);

  return (
    <div className="flex h-screen flex-col bg-[#0f0f0f]">
      <header className="h-14 border-b border-[#1f1f1f] bg-[#111111] flex items-center justify-between px-6">
        <div className="text-sm font-semibold">
          Weavy Clone
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-[#1f1f1f] bg-[#121212]">
          <Sidebar setNodes={setNodes} />
        </aside>

        <main className="flex-1 flex flex-col bg-[#0f0f0f]">
          <div className="h-14 border-b border-[#1f1f1f] flex items-center justify-between px-6">
            <div className="text-sm text-gray-400">
              Untitled Workflow
            </div>
            <button
              onClick={runWorkflow}
              className="bg-[#7C3AED] px-4 py-2 rounded-md"
            >
              Run
            </button>
          </div>

          <WorkflowCanvas
            nodes={nodes}
            setNodes={setNodes}
            edges={edges}
            setEdges={setEdges}
          />
        </main>

        <aside className="w-[300px] border-l border-[#1f1f1f] bg-[#121212] p-4">
          <div className="text-xs uppercase text-gray-500 mb-4">
            Workflow History
          </div>

          {runHistory.map((run) => (
            <div
              key={run.id}
              onClick={() => replayRun(run)}
              className="cursor-pointer bg-[#1c1c1c] p-3 rounded-md mb-3"
            >
              Run {run.id.slice(0, 6)}
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
