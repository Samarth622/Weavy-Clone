"use client";

import { useRef, useState } from "react";
import NodeShell from "./NodeShell";

export default function PromptNode({ id, onDelete, data }: any) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);

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
    >
      <textarea
        ref={textareaRef}
        value={text}
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
