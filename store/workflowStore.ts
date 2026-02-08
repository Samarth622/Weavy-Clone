import { create } from "zustand";

interface WorkflowState {
  nodes: any[];
  edges: any[];
  workflowName: string;
  workflowId: string | null;
  isRunning: boolean;

  expandedWorkflow: string | null;
  runsByWorkflow: Record<string, any[]>;

  setNodes: (nodes: any[]) => void;
  setEdges: (edges: any[]) => void;
  setWorkflowName: (name: string) => void;
  setWorkflowId: (id: string | null) => void;
  setIsRunning: (value: boolean) => void;

  setExpandedWorkflow: (id: string | null) => void;
  setRunsForWorkflow: (id: string, runs: any[]) => void;

  resetWorkflow: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  nodes: [],
  edges: [],
  workflowName: "Untitled Workflow",
  workflowId: null,
  isRunning: false,
  expandedWorkflow: null,
  runsByWorkflow: {},

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setWorkflowName: (workflowName) => set({ workflowName }),
  setWorkflowId: (workflowId) => set({ workflowId }),
  setIsRunning: (isRunning) => set({ isRunning }),

  setExpandedWorkflow: (expandedWorkflow) => set({ expandedWorkflow }),

  setRunsForWorkflow: (id, runs) =>
    set((state) => ({
      runsByWorkflow: {
        ...state.runsByWorkflow,
        [id]: runs,
      },
    })),

  resetWorkflow: () =>
    set({
      nodes: [],
      edges: [],
      workflowName: "Untitled Workflow",
      workflowId: null,
    }),
}));
