"use client";

import { Upload } from "lucide-react";
import NodeShell from "./NodeShell";

export default function UploadVideoNode({ id, onDelete, data }: any) {
  return (
    <NodeShell
      id={id}
      onDelete={onDelete}
      status={data?.status}
      title="Video"
      rightLabel="Video"
      rightColor="#ef4444"
    >
      <div className="relative flex items-center justify-center 
                      bg-[linear-gradient(45deg,#2a2a2a_25%,transparent_25%),linear-gradient(-45deg,#2a2a2a_25%,transparent_25%)] 
                      bg-[size:20px_20px] 
                      h-64 rounded-md mb-4">

        <div className="flex flex-col items-center text-gray-400 text-sm">
          <Upload size={20} className="mb-2" />
          <span>Drag & drop video</span>
        </div>
      </div>
    </NodeShell>
  );
}
