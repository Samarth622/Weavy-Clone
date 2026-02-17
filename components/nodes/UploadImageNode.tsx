"use client";

import { useReactFlow } from "reactflow";
import { Upload } from "lucide-react";
import NodeShell from "./NodeShell";

export default function UploadImageNode({ id, data, onDelete, selected }: any) {
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
                  image: base64,
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
      title="Upload Image"
      rightLabel="Image"
      rightColor="#10b981"
      selected={selected}
    >
      <div className="space-y-4">

        {/* Upload Button */}
        <label className="flex items-center justify-center gap-2 bg-[#222] hover:bg-[#2a2a2a] border border-[#2a2a2a] rounded-md px-4 py-3 text-sm text-gray-300 cursor-pointer transition">
          <Upload size={16} />
          {data?.fileName || "Choose Image"}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </label>

        {/* Preview */}
        {data?.image && (
          <div className="border border-[#2a2a2a] rounded-md overflow-hidden">
            <img
              src={data.image}
              alt="Preview"
              className="w-full max-h-[180px] object-cover"
            />
          </div>
        )}
      </div>
    </NodeShell>
  );
}
