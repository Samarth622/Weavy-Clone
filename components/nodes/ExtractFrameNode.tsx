"use client";

import NodeShell from "./NodeShell";

export default function ExtractFrameNode({ id, onDelete , data }: any) {
  return (
    <NodeShell
      id={id}
      onDelete={onDelete}
      title="Extract Video Frame"
      leftLabel="Video"
      status={data?.status}
      rightLabel="Frame"
      leftColor="#ef4444"
      rightColor="#10b981"
    >
      {/* Preview */}
      <div className="bg-[linear-gradient(45deg,#2a2a2a_25%,transparent_25%),linear-gradient(-45deg,#2a2a2a_25%,transparent_25%)] 
                      bg-[size:20px_20px] 
                      h-64 rounded-md mb-4" />

      {/* Controls */}
      <div className="flex gap-4 text-xs text-gray-400">
        <input
          className="bg-[#222] border border-[#2a2a2a] px-2 py-1 rounded w-20"
          placeholder="Frame 0"
        />
        <input
          className="bg-[#222] border border-[#2a2a2a] px-2 py-1 rounded w-32"
          placeholder="00:00:00"
        />
      </div>
    </NodeShell>
  );
}
