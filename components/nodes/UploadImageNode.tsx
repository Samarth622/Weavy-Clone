import { useState } from "react";
import { Upload, ChevronDown, ChevronUp } from "lucide-react";
import NodeShell from "./NodeShell";

export default function UploadImageNode({ id, onDelete, data }: any) {
  const [expanded, setExpanded] = useState(false);

  return (
    <NodeShell
      id={id}
      onDelete={onDelete}
      title="File"
      rightLabel="File"
      rightColor="#e5e5e5"
      status={data?.status}
    >
      {/* Toggle Button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-gray-200"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Preview (Conditional) */}
      {expanded && (
        <div className="relative flex items-center justify-center 
                        bg-[linear-gradient(45deg,#2a2a2a_25%,transparent_25%),linear-gradient(-45deg,#2a2a2a_25%,transparent_25%)] 
                        bg-[size:20px_20px] 
                        h-48 rounded-md mb-4">

          <div className="flex flex-col items-center text-gray-400 text-sm">
            <Upload size={20} className="mb-2" />
            <span>Drag & drop or click to upload</span>
          </div>
        </div>
      )}

      <input
        className="w-full bg-[#222] border border-[#2a2a2a] px-3 py-2 rounded text-xs text-gray-300"
        placeholder="Paste a file link"
      />
    </NodeShell>
  );
}
