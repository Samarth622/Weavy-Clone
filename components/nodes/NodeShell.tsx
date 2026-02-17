import { Handle, Position } from "reactflow";
import { MoreHorizontal, Trash2 } from "lucide-react";

interface NodeShellProps {
  id: string;
  title: string;
  children: React.ReactNode;
  onDelete?: (id: string) => void;
  status?: "idle" | "running" | "success" | "error";
  leftLabel?: string;
  rightLabel?: string;
  leftColor?: string;
  rightColor?: string;
  selected?: boolean; // 🔥 IMPORTANT
}

export default function NodeShell({
  id,
  title,
  children,
  onDelete,
  status,
  leftColor = "#7C3AED",
  rightColor = "#7C3AED",
  selected,
}: NodeShellProps) {

  const statusBorder =
    status === "running"
      ? "border-purple-500 animate-pulse"
      : status === "success"
      ? "border-green-500"
      : status === "error"
      ? "border-red-500"
      : "border-[#2a2a2a]";

  // 🔥 Selection Highlight
  const selectionStyle = selected
    ? "ring-2 ring-[#7C3AED] shadow-[0_0_20px_rgba(124,58,237,0.6)]"
    : "";

  return (
    <div
      className={`relative bg-[#1b1b1b] border ${statusBorder} ${selectionStyle} rounded-xl min-w-[260px] transition-all duration-200`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
        <span className="text-sm font-medium text-gray-200">
          {title}
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

      <div className="p-4">{children}</div>

      <Handle
        type="target"
        position={Position.Left}
        style={{ background: leftColor }}
        className="!w-3 !h-3"
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: rightColor }}
        className="!w-3 !h-3"
      />
    </div>
  );
}
