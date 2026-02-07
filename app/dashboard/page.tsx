"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import WorkflowCanvas from "@/components/canvas/WorkflowCanvas";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

export default function DashboardPage() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [savedWorkflows, setSavedWorkflows] = useState<any[]>([]);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [workflowRuns, setWorkflowRuns] = useState<any[]>([]);
  const router = useRouter();

  const { user, isLoaded } = useUser();

  const loadRuns = async (id: string) => {
    try {
      const res = await fetch(`/api/workflows/${id}/runs`);

      if (!res.ok) return;

      const data = await res.json();
      setWorkflowRuns(data);
    } catch (err) {
      console.error("Failed to load runs:", err);
    }
  };

  // ------------------------
  // Load Saved Workflows
  // ------------------------
  const loadWorkflows = async () => {
    try {
      const res = await fetch("/api/workflows");

      const text = await res.text();

      if (!text) {
        console.warn("Empty response from API");
        return;
      }

      const data = JSON.parse(text);
      setSavedWorkflows(data);
    } catch (err) {
      console.error("Failed to load workflows:", err);
    }
  };


  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push("/sign-in");
      return;
    }

    loadWorkflows();
  }, [isLoaded, user]);



  // ------------------------
  // Create New Workflow
  // ------------------------
  const handleNewWorkflow = () => {
    setNodes([]);
    setEdges([]);
    setWorkflowName("Untitled Workflow");
    setWorkflowId(null);

  };

  // ------------------------
  // Save Workflow
  // ------------------------
  const handleSaveWorkflow = async () => {
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: workflowId,
          name: workflowName,
          nodes,
          edges,
        }),
      });

      const text = await res.text(); // safer

      if (!text) {
        alert("Empty response from server");
        return;
      }

      const data = JSON.parse(text);

      if (res.ok) {
        setWorkflowId(data.id);
        loadWorkflows();
      } else {
        alert(data.error || "Failed to save workflow");
      }

    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  };

  const handleReplayRun = (run: any) => {
    setNodes(prev =>
      prev.map(node => {
        const nodeRun = run.nodeRuns.find(
          (n: any) => n.nodeId === node.id
        );

        return {
          ...node,
          data: {
            ...node.data,
            status: nodeRun?.status || "idle",
            result: nodeRun?.output || null,
          },
        };
      })
    );
  };



  const pollRunStatus = (runId: string) => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/run-status/${runId}`);

      if (!res.ok) return;

      const data = await res.json();
      if (!data.nodeRuns) return;

      setNodes(prev =>
        prev.map(node => {
          const nodeRun = data.nodeRuns.find(
            (n: any) => n.nodeId === node.id
          );

          return {
            ...node,
            data: {
              ...node.data,
              status: nodeRun?.status || "idle",
              result: nodeRun?.output || node.data?.result,
            },
          };
        })
      );

      if (data.status === "success" || data.status === "error") {
        clearInterval(interval);
        setIsRunning(false);

        loadRuns(workflowId!);
      }
    }, 500); // 🔥 Faster polling
  };



  const handleRun = async () => {
    if (!workflowId) {
      alert("Please save workflow first.");
      return;
    }

    setIsRunning(true);

    setNodes(prev =>
      prev.map(node => ({
        ...node,
        data: {
          ...node.data,
          status: "idle",
          result: null
        }
      }))
    );


    const res = await fetch("/api/run-workflow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workflowId,
        nodes,
        edges,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      setIsRunning(false);
      return;
    }

    pollRunStatus(data.runId);
  };



  // ------------------------
  // Load Existing Workflow
  // ------------------------
  const handleLoadWorkflow = (workflow: any) => {
    setNodes(workflow.nodes);
    setEdges(workflow.edges);
    setWorkflowName(workflow.name);
    setWorkflowId(workflow.id);

    loadRuns(workflow.id);
  };

  return (
    <div className="flex h-screen flex-col bg-[#0f0f0f]">

      {/* Top Navbar */}
      <header className="h-14 border-b border-[#1f1f1f] bg-[#111111] flex items-center justify-between px-6">
        <div className="text-sm font-semibold text-gray-200">
          Weavy Clone
        </div>
        <UserButton />
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* LEFT SIDEBAR */}
        <aside className="w-64 border-r border-[#1f1f1f] bg-[#121212]">
          <Sidebar setNodes={setNodes} />
        </aside>

        {/* MAIN AREA */}
        <main className="flex-1 flex flex-col bg-[#0f0f0f]">

          {/* HEADER BAR */}
          <div className="h-14 border-b border-[#1f1f1f] bg-[#111111] flex items-center justify-between px-6">

            {/* LEFT */}
            <div className="flex items-center gap-4">
              <input
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="bg-transparent text-sm font-semibold text-gray-200 
                outline-none border-b border-transparent 
                focus:border-[#7C3AED] transition w-56"
              />
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">

              <button
                onClick={handleNewWorkflow}
                className="bg-[#1f1f1f] hover:bg-[#2a2a2a] text-sm px-3 py-1.5 rounded-md transition"
              >
                + New
              </button>

              <button
                onClick={handleSaveWorkflow}
                className="bg-[#1f1f1f] hover:bg-[#2a2a2a] text-sm px-4 py-2 rounded-md transition"
              >
                Save
              </button>

              <button
                onClick={handleRun}
                disabled={isRunning}
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-sm font-medium px-4 py-2 rounded-md transition disabled:opacity-50"
              >
                {isRunning ? "Running..." : "Run"}
              </button>

            </div>
          </div>

          {/* CANVAS */}
          <WorkflowCanvas
            nodes={nodes}
            setNodes={setNodes}
            edges={edges}
            setEdges={setEdges}
          />

        </main>

        {/* RIGHT PANEL - SAVED WORKFLOWS */}
        <aside className="w-[300px] border-l border-[#1f1f1f] bg-[#121212] p-4 overflow-y-auto">

          {/* WORKFLOW RUN HISTORY */}
          {workflowId && (
            <>
              <div className="text-xs uppercase tracking-wider text-gray-500 mb-4">
                Run History
              </div>

              <div className="space-y-3 mb-6">
                {workflowRuns.map((run) => (
                  <div
                    key={run.id}
                    onClick={() => handleReplayRun(run)}
                    className="cursor-pointer bg-[#1c1c1c] p-3 rounded-md border border-[#2a2a2a] text-xs text-gray-300 hover:border-[#7C3AED] transition"
                  >
                    <div className="font-medium mb-1">
                      Run {run.id.slice(0, 6)}
                    </div>
                    <div className="text-gray-500 text-[11px]">
                      {new Date(run.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* SAVED WORKFLOWS */}
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-4">
            Saved Workflows
          </div>

          <div className="space-y-3">
            {savedWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                onClick={() => handleLoadWorkflow(workflow)}
                className="cursor-pointer bg-[#1c1c1c] p-3 rounded-md border border-[#2a2a2a] text-xs text-gray-300 hover:border-[#7C3AED] transition"
              >
                <div className="font-medium mb-1">
                  {workflow.name}
                </div>
                <div className="text-gray-500 text-[11px]">
                  {new Date(workflow.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

        </aside>

      </div>
    </div>
  );
}
