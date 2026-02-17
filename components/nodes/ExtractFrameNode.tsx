"use client";

import { useReactFlow } from "reactflow";
import NodeShell from "./NodeShell";

export default function ExtractFrameNode({ id, onDelete, data, selected }: any) {
  const { setNodes } = useReactFlow();

  const handleTimestampChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(e.target.value);

    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                timestamp: isNaN(value) ? 1 : value,
              },
            }
          : node
      )
    );
  };

  return (
    <NodeShell
      id={id}
      onDelete={onDelete}
      title="Extract Frame"
      leftLabel="Video"
      status={data?.status}
      rightLabel="Image"
      leftColor="#ef4444"
      rightColor="#10b981"
      selected={selected}
    >
      {/* Preview */}
      {data?.result ? (
        <img
          src={data.result}
          alt="Extracted Frame"
          className="w-full rounded-md border border-[#2a2a2a] mb-4"
        />
      ) : (
        <div
          className="bg-[linear-gradient(45deg,#2a2a2a_25%,transparent_25%),linear-gradient(-45deg,#2a2a2a_25%,transparent_25%)]
                     bg-[size:20px_20px]
                     h-48 rounded-md mb-4 flex items-center justify-center text-xs text-gray-500 border border-[#2a2a2a]"
        >
          No frame extracted yet
        </div>
      )}

      {/* Simple Timestamp Control */}
      <div className="flex flex-col text-xs text-gray-400">
        <span className="mb-1">Extract at (seconds)</span>
        <input
          type="number"
          step="0.1"
          min="0"
          value={data?.timestamp ?? 0}
          onChange={handleTimestampChange}
          className="bg-[#222] border border-[#2a2a2a] px-3 py-2 rounded text-sm text-gray-200"
        />
      </div>
    </NodeShell>
  );
}
