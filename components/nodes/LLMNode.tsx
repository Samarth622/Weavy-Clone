"use client";

import { Handle, Position } from "reactflow";
import { MoreHorizontal, Trash2 } from "lucide-react";

export default function LLMNode({ id, data, onDelete }: any) {
  const status = data?.status || "idle";

  const borderColor =
    status === "running"
      ? "border-purple-500 animate-pulse"
      : status === "success"
      ? "border-green-500"
      : status === "error"
      ? "border-red-500"
      : status === "skipped"
      ? "border-yellow-500"
      : "border-[#2a2a2a]";

  return (
    <div
      className={`relative bg-[#1b1b1b] border rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] min-w-[360px] ${borderColor}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
        <span className="text-sm font-medium text-gray-200">
          LLM
        </span>

        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              onClick={() => onDelete(id)}
              className="text-gray-400 hover:text-red-500 transition"
            >
              <Trash2 size={14} />
            </button>
          )}
          <MoreHorizontal size={16} className="text-gray-400" />
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">

        {/* Model Selector */}
        <div className="flex flex-col text-xs text-gray-400">
          <span className="mb-1">Model</span>
          <select
            value={data?.model || "gemini-3-flash-preview"}
            onChange={(e) => {
              data.model = e.target.value;
            }}
            className="bg-[#222] border border-[#2a2a2a] px-2 py-2 rounded text-sm text-gray-200"
          >
            <option value="gemini-3-flash-preview">
              Gemini 3 Flash
            </option>
          </select>
        </div>

        {/* Output Section */}
        <div className="bg-[#222] border border-[#2a2a2a] rounded-md p-3 text-xs text-gray-300 whitespace-pre-wrap min-h-[100px]">
          {status === "running" && (
            <span className="text-purple-400">
              Generating response...
            </span>
          )}

          {status === "error" && (
            <span className="text-red-400">
              Error generating response.
            </span>
          )}

          {status === "skipped" && (
            <span className="text-yellow-400">
              Skipped due to upstream failure.
            </span>
          )}

          {status === "success" && data?.result}

          {status === "idle" && (
            <span className="text-gray-500">
              Output will appear here after execution.
            </span>
          )}
        </div>
      </div>

      {/* INPUT HANDLES */}
      <Handle
        type="target"
        id="system_prompt"
        position={Position.Left}
        style={{ top: 90, background: "#f59e0b" }}
        className="!w-3 !h-3"
      />

      <Handle
        type="target"
        id="user_message"
        position={Position.Left}
        style={{ top: 140, background: "#7C3AED" }}
        className="!w-3 !h-3"
      />

      <Handle
        type="target"
        id="images"
        position={Position.Left}
        style={{ top: 190, background: "#10b981" }}
        className="!w-3 !h-3"
      />

      {/* OUTPUT HANDLE */}
      <Handle
        type="source"
        id="output"
        position={Position.Right}
        style={{ background: "#7C3AED" }}
        className="!w-3 !h-3"
      />
    </div>
  );
}
