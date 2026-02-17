"use client";

import { useRef } from "react";
import { useReactFlow } from "reactflow";
import NodeShell from "./NodeShell";

export default function PromptNode({ id, onDelete, data, selected }: any) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { setNodes } = useReactFlow();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    // ✅ Proper React Flow update
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                prompt: value,
              },
            }
          : node
      )
    );

    // Auto resize
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  };

  return (
    <NodeShell
      id={id}
      onDelete={onDelete}
      status={data?.status}
      title="Prompt"
      rightLabel="Prompt"
      rightColor="#7C3AED"
      selected={selected}
    >
      <textarea
        ref={textareaRef}
        value={data?.prompt || ""}
        onChange={handleChange}
        placeholder="Write your prompt..."
        className="w-full bg-[#222] text-gray-200 text-sm 
                   rounded-md p-3 
                   border border-[#2a2a2a] 
                   resize-none outline-none 
                   focus:border-[#7C3AED] 
                   leading-relaxed"
        rows={3}
      />
    </NodeShell>
  );
}
