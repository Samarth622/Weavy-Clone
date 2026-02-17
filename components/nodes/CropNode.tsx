"use client";

import { useReactFlow } from "reactflow";
import NodeShell from "./NodeShell";

export default function CropNode({ id, onDelete, data, selected }: any) {
  const { setNodes } = useReactFlow();

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                mode: value,
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
      status={data?.status}
      title="Crop Image"
      leftLabel="Image"
      rightLabel="Cropped"
      leftColor="#f59e0b"
      rightColor="#10b981"
      selected={selected}
    >
      <div className="space-y-4">

        {/* Mode Selector */}
        <select
          value={data?.mode || "full"}
          onChange={handleModeChange}
          className="w-full bg-[#222] border border-[#2a2a2a] px-3 py-2 rounded text-sm text-gray-200"
        >
          <option value="full">Full Image</option>
          <option value="1:1">Square (1:1)</option>
          <option value="16:9">16:9</option>
          <option value="4:3">4:3</option>
        </select>

        {/* Preview */}
        {data?.result ? (
          <img
            src={data.result}
            alt="Cropped"
            className="w-full rounded-md border border-[#2a2a2a]"
          />
        ) : (
          <div className="h-40 flex items-center justify-center text-xs text-gray-500 border border-[#2a2a2a] rounded-md">
            No crop applied yet
          </div>
        )}
      </div>
    </NodeShell>
  );
}
