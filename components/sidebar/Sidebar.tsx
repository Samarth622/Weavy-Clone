"use client";

import {
  Image,
  Video,
  MessageSquare,
  Crop,
  Scissors,
  Brain, // ✅ LLM icon
} from "lucide-react";

interface Props {
  setNodes: any;
}

export default function Sidebar({ setNodes }: Props) {
  const addNode = (type: string) => {
    const newNode = {
      id: crypto.randomUUID(),
      type,
      position: {
        x: Math.random() * 400,
        y: Math.random() * 400,
      },
      data: {
        status: "idle",
        result: null,
      },
    };

    setNodes((prev: any[]) => [...prev, newNode]);
  };

  const items = [
    {
      type: "uploadImage",
      icon: <Image size={18} />,
      label: "Upload Image",
    },
    {
      type: "uploadVideo",
      icon: <Video size={18} />,
      label: "Upload Video",
    },
    {
      type: "prompt",
      icon: <MessageSquare size={18} />,
      label: "Prompt",
    },
    {
      type: "llm", // ✅ ADDED
      icon: <Brain size={18} />,
      label: "LLM",
    },
    {
      type: "crop",
      icon: <Crop size={18} />,
      label: "Crop",
    },
    {
      type: "extract",
      icon: <Scissors size={18} />,
      label: "Extract Frame",
    },
  ];

  return (
    <div className="h-full p-2 space-y-2">
      {items.map((item) => (
        <div
          key={item.type}
          onClick={() => addNode(item.type)}
          className="
            flex
            items-center
            gap-3
            px-3
            py-2
            rounded-md
            cursor-pointer
            text-gray-400
            hover:bg-[#1f1f1f]
            hover:text-white
            transition-all
          "
        >
          {/* Icon Always Visible */}
          <div className="min-w-[20px] flex justify-center">
            {item.icon}
          </div>

          {/* Text (visible only when sidebar expands) */}
          <span
            className="
              whitespace-nowrap
              opacity-0
              group-hover:opacity-100
              transition-all
              duration-300
            "
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
