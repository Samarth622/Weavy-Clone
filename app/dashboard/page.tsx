"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import WorkflowCanvas from "@/components/canvas/WorkflowCanvas";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [savedWorkflows, setSavedWorkflows] = useState<any[]>([]);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // History
  const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>(null);
  const [runsByWorkflow, setRunsByWorkflow] = useState<Record<string, any[]>>({});

  const router = useRouter();
  const { user, isLoaded } = useUser();

  // -----------------------------
  // AUTH CHECK
  // -----------------------------
  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push("/sign-in");
      return;
    }

    loadWorkflows();
  }, [isLoaded, user]);

  // -----------------------------
  // LOAD WORKFLOWS
  // -----------------------------
  const loadWorkflows = async () => {
    try {
      const res = await fetch("/api/workflows");
      if (!res.ok) return;

      const data = await res.json();
      setSavedWorkflows(data);
    } catch (err) {
      console.error("Failed to load workflows:", err);
    }
  };

  // -----------------------------
  // LOAD RUNS FOR WORKFLOW
  // -----------------------------
  const loadRunsForWorkflow = async (id: string) => {
    try {
      const res = await fetch(`/api/workflows/${id}/runs`);
      if (!res.ok) return;

      const data = await res.json();

      setRunsByWorkflow(prev => ({
        ...prev,
        [id]: data,
      }));
    } catch (err) {
      console.error("Failed to load runs:", err);
    }
  };

  // -----------------------------
  // NEW WORKFLOW
  // -----------------------------
  const handleNewWorkflow = () => {
    setNodes([]);
    setEdges([]);
    setWorkflowName("Untitled Workflow");
    setWorkflowId(null);
  };

  // -----------------------------
  // SAVE WORKFLOW
  // -----------------------------
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

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      setWorkflowId(data.id);
      alert("Workflow saved");
      loadWorkflows();
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  };

  // -----------------------------
  // REPLAY RUN
  // -----------------------------
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

  // -----------------------------
  // POLL RUN STATUS
  // -----------------------------
  const pollRunStatus = (runId: string) => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/run-status/${runId}`);
      if (!res.ok) return;

      const data = await res.json();

      setNodes(prev =>
        prev.map(node => {
          const nodeRun = data.nodeRuns?.find(
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

        if (workflowId) {
          await loadRunsForWorkflow(workflowId);
        }
      }
    }, 3000);
  };

  // -----------------------------
  // RUN WORKFLOW
  // -----------------------------
  const handleRun = async () => {
    if (!workflowId) {
      alert("Please save workflow first.");
      return;
    }

    setIsRunning(true);

    setNodes(prev =>
      prev.map(node => ({
        ...node,
        data: { ...node.data, status: "idle", result: null },
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

  // -----------------------------
  // LOAD WORKFLOW + TOGGLE RUNS
  // -----------------------------
  const handleWorkflowClick = async (workflow: any) => {
    // Load canvas
    setNodes(workflow.nodes);
    setEdges(workflow.edges);
    setWorkflowName(workflow.name);
    setWorkflowId(workflow.id);

    // Toggle expand
    setExpandedWorkflow(prev =>
      prev === workflow.id ? null : workflow.id
    );

    // Fetch runs if not loaded
    if (!runsByWorkflow[workflow.id]) {
      await loadRunsForWorkflow(workflow.id);
    }
  };

  // =============================
  // UI
  // =============================
  return (
    <div className="flex h-screen flex-col bg-[#0f0f0f]">

      {/* TOP BAR */}
      <header className="h-14 border-b border-[#1f1f1f] bg-[#111111] flex items-center justify-between px-6">
        <div className="text-sm font-semibold text-gray-200">
          Weavy Clone
        </div>
        <div className="flex items-center gap-3">
          {/* Mobile History Toggle */}
          <button
            onClick={() => setExpandedWorkflow(prev => prev ? null : "mobile")}
            className="md:hidden text-gray-400"
          >
            🕘
          </button>

          <UserButton />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        <div className="relative group">

          <aside
            className="
      h-full
      bg-[#121212]
      border-r border-[#1f1f1f]
      transition-all duration-300 ease-in-out
      w-16
      group-hover:w-64
      overflow-hidden
    "
          >
            <Sidebar setNodes={setNodes} />
          </aside>

        </div>

        {/* MAIN */}
        <main className="flex-1 flex flex-col bg-[#0f0f0f]">

          {/* HEADER */}
          <div className="h-14 border-b border-[#1f1f1f] bg-[#111111] 
flex items-center justify-between px-3 md:px-6">

            {/* Workflow Name */}
            <input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="bg-transparent text-sm font-semibold text-gray-200 
    outline-none border-b border-transparent 
    focus:border-[#7C3AED] transition 
    w-32 sm:w-40 md:w-56"
            />

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-2 md:gap-3">

              {/* + New */}
              <button
                onClick={handleNewWorkflow}
                className="bg-[#1f1f1f] hover:bg-[#2a2a2a] 
      px-3 py-2 md:px-3 md:py-1.5 
      rounded-md text-sm transition"
              >
                <span className="md:hidden">＋</span>
                <span className="hidden md:inline">+ New</span>
              </button>

              {/* Save */}
              <button
                onClick={handleSaveWorkflow}
                className="bg-[#1f1f1f] hover:bg-[#2a2a2a] 
      px-3 py-2 md:px-4 md:py-2 
      rounded-md text-sm transition"
              >
                <span className="md:hidden">💾</span>
                <span className="hidden md:inline">Save</span>
              </button>

              {/* Run */}
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="bg-[#7C3AED] hover:bg-[#6D28D9] 
      px-3 py-2 md:px-4 md:py-2 
      rounded-md text-sm transition 
      disabled:opacity-50"
              >
                <span className="md:hidden">
                  {isRunning ? "⏳" : "▶"}
                </span>
                <span className="hidden md:inline">
                  {isRunning ? "Running..." : "Run"}
                </span>
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

        {/* RIGHT PANEL */}
        <aside
          className={`
          fixed md:static
          top-14 right-0
          h-[calc(100vh-56px)]
          bg-[#121212]
          border-l border-[#1f1f1f]
          transition-transform duration-300
          w-72
          z-40
          ${expandedWorkflow ? "translate-x-0" : "translate-x-full"}
          md:translate-x-0
        `}
        >
          <div className="p-4 overflow-y-auto h-full">

            <div className="text-xs uppercase tracking-wider text-gray-500 mb-4">
              Workflows
            </div>

            <div className="space-y-3">
              {savedWorkflows.map(workflow => (
                <div key={workflow.id}>
                  <div
                    onClick={() => handleWorkflowClick(workflow)}
                    className="cursor-pointer bg-[#1c1c1c] p-3 rounded-md border border-[#2a2a2a] text-sm text-gray-200 hover:border-[#7C3AED] transition"
                  >
                    <div className="font-medium">{workflow.name}</div>
                    <div className="text-gray-500 text-[11px]">
                      {new Date(workflow.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {expandedWorkflow === workflow.id && (
                    <div className="ml-4 mt-2 space-y-2">
                      {runsByWorkflow[workflow.id]?.length ? (
                        runsByWorkflow[workflow.id].map((run: any) => (
                          <div
                            key={run.id}
                            onClick={() => handleReplayRun(run)}
                            className="bg-[#181818] px-3 py-2 rounded text-xs text-gray-400 hover:bg-[#222] cursor-pointer"
                          >
                            Run {run.id.slice(0, 6)} — {run.status}
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-gray-500">
                          No runs yet
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </aside>

      </div>
    </div>
  );
}
