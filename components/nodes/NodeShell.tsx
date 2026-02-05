import { Handle, Position } from "reactflow";
import { MoreHorizontal, Trash2 } from "lucide-react";

interface NodeShellProps {
  id: string;
  title: string;
  children: React.ReactNode;
  onDelete?: (id: string) => void;
  leftLabel?: string;
  rightLabel?: string;
  leftColor?: string;
  rightColor?: string;
}

export default function NodeShell({
  id,
  title,
  children,
  onDelete,
  leftLabel,
  rightLabel,
  leftColor = "#7C3AED",
  rightColor = "#7C3AED",
}: NodeShellProps) {
  return (
    <div className="relative bg-[#1b1b1b] border border-[#2a2a2a] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] min-w-[260px]">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
        <span className="text-sm font-medium text-gray-200">
          {title}
        </span>

        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              onClick={() => {
                console.log("Deleting:", id);
                onDelete(id);
              }}
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
