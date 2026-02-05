"use client";

import NodeShell from "./NodeShell";

export default function CropNode({ id, onDelete }: any) {
  return (
    <NodeShell
      id={id}
      onDelete={onDelete}
      title="Crop"
      leftLabel="File"
      rightLabel="File"
      leftColor="#f97316"
      rightColor="#e5e5e5"
    >
      {/* Preview */}
      <div className="bg-[linear-gradient(45deg,#2a2a2a_25%,transparent_25%),linear-gradient(-45deg,#2a2a2a_25%,transparent_25%)] 
                      bg-[size:20px_20px] 
                      h-64 rounded-md mb-4" />

      {/* Controls */}
      <div className="space-y-3 text-xs text-gray-400">
        <div className="flex items-center justify-between">
          <span>Aspect ratio</span>
          <select className="bg-[#222] border border-[#2a2a2a] px-2 py-1 rounded text-xs">
            <option>Custom</option>
          </select>
        </div>

        <div className="flex gap-2">
          <input
            className="bg-[#222] border border-[#2a2a2a] px-2 py-1 rounded w-full"
            placeholder="W 1024"
          />
          <input
            className="bg-[#222] border border-[#2a2a2a] px-2 py-1 rounded w-full"
            placeholder="H 1024"
          />
        </div>
      </div>
    </NodeShell>
  );
}
