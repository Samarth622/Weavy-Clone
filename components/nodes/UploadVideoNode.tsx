"use client";

import { useReactFlow } from "reactflow";
import { Upload } from "lucide-react";
import NodeShell from "./NodeShell";

export default function UploadVideoNode({ id, data, onDelete }: any) {
  const { setNodes } = useReactFlow();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;

      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id
            ? {
                ...node,
                data: {
                  ...node.data,
                  video: base64,
                  fileName: file.name,
                },
              }
            : node
        )
      );
    };

    reader.readAsDataURL(file);
  };

  return (
    <NodeShell
      id={id}
      onDelete={onDelete}
      status={data?.status}
      title="Upload Video"
      rightLabel="Video"
      rightColor="#3b82f6"
    >
      <div className="space-y-4">

        {/* Upload Button */}
        <label className="flex items-center justify-center gap-2 bg-[#222] hover:bg-[#2a2a2a] border border-[#2a2a2a] rounded-md px-4 py-3 text-sm text-gray-300 cursor-pointer transition">
          <Upload size={16} />
          {data?.fileName || "Choose Video"}
          <input
            type="file"
            accept="video/*"
            onChange={handleUpload}
            className="hidden"
          />
        </label>

        {/* Preview */}
        {data?.video && (
          <video
            src={data.video}
            controls
            className="w-full max-h-[180px] rounded-md border border-[#2a2a2a]"
          />
        )}
      </div>
    </NodeShell>
  );
}
