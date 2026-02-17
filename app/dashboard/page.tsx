"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import WorkflowCanvas from "@/components/canvas/WorkflowCanvas";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [workflowName, setWorkflowName] =
    useState("Untitled Workflow");
  const [savedWorkflows, setSavedWorkflows] =
    useState<any[]>([]);
  const [workflowId, setWorkflowId] =
    useState<string | null>(null);
  const [isRunning, setIsRunning] =
    useState(false);

  const [expandedWorkflow, setExpandedWorkflow] =
    useState<string | null>(null);
  const [runsByWorkflow, setRunsByWorkflow] =
    useState<Record<string, any[]>>({});

  const [selectedNodeIds, setSelectedNodeIds] =
    useState<string[]>([]);

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
      console.error("Load workflows error:", err);
    }
  };

  // -----------------------------
  // LOAD RUNS
  // -----------------------------
  const loadRunsForWorkflow = async (id: string) => {
    try {
      const res = await fetch(
        `/api/workflows/${id}/runs`
      );
      if (!res.ok) return;
      const data = await res.json();

      setRunsByWorkflow((prev) => ({
        ...prev,
        [id]: data,
      }));
    } catch (err) {
      console.error("Load runs error:", err);
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
    setSelectedNodeIds([]);
  };

  // -----------------------------
  // SAVE WORKFLOW
  // -----------------------------
  const handleSaveWorkflow = async () => {
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
      console.error("Save error:", err);
    }
  };

  // -----------------------------
  // POLL RUN STATUS
  // -----------------------------
  const pollRunStatus = (runId: string) => {
    const interval = setInterval(async () => {
      const res = await fetch(
        `/api/run-status/${runId}`
      );
      if (!res.ok) return;

      const data = await res.json();

      setNodes((prev) =>
        prev.map((node) => {
          const nodeRun =
            data.nodeRuns?.find(
              (n: any) =>
                n.nodeId === node.id
            );

          return {
            ...node,
            data: {
              ...node.data,
              status:
                nodeRun?.status || "idle",
              result:
                nodeRun?.output ??
                node.data?.result,
            },
          };
        })
      );

      if (
        data.status === "success" ||
        data.status === "error"
      ) {
        clearInterval(interval);
        setIsRunning(false);

        if (workflowId) {
          await loadRunsForWorkflow(
            workflowId
          );
        }
      }
    }, 3000);
  };

  // -----------------------------
  // RUN WORKFLOW
  // -----------------------------
  const handleRun = async (
    mode: "full" | "selected"
  ) => {
    if (!workflowId) {
      alert("Please save workflow first.");
      return;
    }

    if (
      mode === "selected" &&
      selectedNodeIds.length === 0
    ) {
      alert(
        "Please select at least one node."
      );
      return;
    }

    setIsRunning(true);

    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        data: {
          ...node.data,
          status: "idle",
          result: null,
        },
      }))
    );

    const executionScope =
      mode === "full"
        ? { type: "full" }
        : {
            type: "selected",
            nodeIds: selectedNodeIds,
          };

    const res = await fetch(
      "/api/run-workflow",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          workflowId,
          nodes,
          edges,
          executionScope,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      setIsRunning(false);
      return;
    }

    pollRunStatus(data.runId);
  };

  // -----------------------------
  // REPLAY RUN
  // -----------------------------
  const handleReplayRun = (run: any) => {
    setNodes((prev) =>
      prev.map((node) => {
        const nodeRun =
          run.nodeRuns.find(
            (n: any) =>
              n.nodeId === node.id
          );

        return {
          ...node,
          data: {
            ...node.data,
            status:
              nodeRun?.status || "idle",
            result:
              nodeRun?.output || null,
          },
        };
      })
    );
  };

  // -----------------------------
  // LOAD WORKFLOW
  // -----------------------------
  const handleWorkflowClick =
    async (workflow: any) => {
      setNodes(workflow.nodes);
      setEdges(workflow.edges);
      setWorkflowName(workflow.name);
      setWorkflowId(workflow.id);

      setExpandedWorkflow(
        expandedWorkflow === workflow.id
          ? null
          : workflow.id
      );

      if (
        !runsByWorkflow[workflow.id]
      ) {
        await loadRunsForWorkflow(
          workflow.id
        );
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
        <UserButton />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR */}
        <aside className="w-16 hover:w-64 transition-all bg-[#121212] border-r border-[#1f1f1f] overflow-hidden">
          <Sidebar setNodes={setNodes} />
        </aside>

        {/* MAIN */}
        <main className="flex-1 flex flex-col bg-[#0f0f0f]">
          {/* HEADER */}
          <div className="h-14 border-b border-[#1f1f1f] bg-[#111111] flex items-center justify-between px-6">
            <input
              value={workflowName}
              onChange={(e) =>
                setWorkflowName(
                  e.target.value
                )
              }
              className="bg-transparent text-sm font-semibold text-gray-200 outline-none border-b border-transparent focus:border-[#7C3AED]"
            />

            <div className="flex gap-3">
              <button
                onClick={
                  handleNewWorkflow
                }
                className="bg-[#1f1f1f] px-4 py-2 rounded-md"
              >
                + New
              </button>

              <button
                onClick={
                  handleSaveWorkflow
                }
                className="bg-[#1f1f1f] px-4 py-2 rounded-md"
              >
                Save
              </button>

              <button
                onClick={() =>
                  handleRun("full")
                }
                disabled={isRunning}
                className="bg-[#7C3AED] px-4 py-2 rounded-md"
              >
                {isRunning
                  ? "Running..."
                  : "Run Full"}
              </button>

              <button
                onClick={() =>
                  handleRun(
                    "selected"
                  )
                }
                disabled={isRunning}
                className="bg-[#2a2a2a] px-4 py-2 rounded-md"
              >
                Run Selected
              </button>
            </div>
          </div>

          {/* CANVAS */}
          <WorkflowCanvas
            nodes={nodes}
            setNodes={setNodes}
            edges={edges}
            setEdges={setEdges}
            onSelectionChange={
              setSelectedNodeIds
            }
          />
        </main>

        {/* RIGHT HISTORY PANEL */}
        <aside className="w-72 bg-[#121212] border-l border-[#1f1f1f] p-4 overflow-y-auto">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-4">
            Workflows
          </div>

          <div className="space-y-3">
            {savedWorkflows.map(
              (workflow) => (
                <div
                  key={workflow.id}
                >
                  <div
                    onClick={() =>
                      handleWorkflowClick(
                        workflow
                      )
                    }
                    className="cursor-pointer bg-[#1c1c1c] p-3 rounded-md border border-[#2a2a2a] text-sm text-gray-200 hover:border-[#7C3AED] transition"
                  >
                    <div className="font-medium">
                      {workflow.name}
                    </div>
                    <div className="text-gray-500 text-[11px]">
                      {new Date(
                        workflow.createdAt
                      ).toLocaleString()}
                    </div>
                  </div>

                  {expandedWorkflow ===
                    workflow.id && (
                    <div className="ml-4 mt-2 space-y-2">
                      {runsByWorkflow[
                        workflow.id
                      ]?.length ? (
                        runsByWorkflow[
                          workflow.id
                        ].map(
                          (run: any) => (
                            <div
                              key={run.id}
                              onClick={() =>
                                handleReplayRun(
                                  run
                                )
                              }
                              className="bg-[#181818] px-3 py-2 rounded text-xs text-gray-400 hover:bg-[#222] cursor-pointer"
                            >
                              Run{" "}
                              {run.id.slice(
                                0,
                                6
                              )}{" "}
                              —{" "}
                              {
                                run.status
                              }
                            </div>
                          )
                        )
                      ) : (
                        <div className="text-xs text-gray-500">
                          No runs yet
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
