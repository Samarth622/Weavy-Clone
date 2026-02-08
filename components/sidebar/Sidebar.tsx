"use client";

import {
  Type,
  Image,
  Video,
  Brain,
  Crop,
  Scissors,
} from "lucide-react";

interface SidebarProps {
  setNodes: any;
}

const nodes = [
  { label: "Text", icon: Type, type: "prompt" },
  { label: "Upload Image", icon: Image, type: "uploadImage" },
  { label: "Upload Video", icon: Video, type: "uploadVideo" },
  { label: "LLM", icon: Brain, type: "llm" },
  { label: "Crop Image", icon: Crop, type: "crop" },
  { label: "Extract Frame", icon: Scissors, type: "extract" },
];

export default function Sidebar({ setNodes }: SidebarProps) {

  const addNode = (type: string) => {
    setNodes((prev: any[]) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type,
        position: { x: 300, y: 200 },
        data: {
          status: "idle",
          result: null,
        },
      },
    ]);
  };

  return (
    <div className="h-full flex flex-col py-5">

      {/* Title */}
      <div className="px-4 text-xs uppercase tracking-wider text-gray-500 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        Nodes
      </div>

      {/* Node List */}
      <div className="space-y-1 px-2">
        {nodes.map((node) => {
          const Icon = node.icon;

          return (
            <button
              key={node.label}
              onClick={() => addNode(node.type)}
              className="
                group/item
                flex items-center
                w-full
                px-3 py-2.5
                rounded-md
                hover:bg-[#1c1c1c]
                transition-all
              "
            >
              {/* Icon */}
              <div className="min-w-[24px] flex justify-center">
                <Icon size={18} className="text-gray-400 group-hover/item:text-white transition-colors" />
              </div>

              {/* Label (hidden when collapsed) */}
              <span
                className="
                  ml-3
                  text-sm
                  text-gray-300
                  whitespace-nowrap
                  opacity-0
                  translate-x-2
                  group-hover:opacity-100
                  group-hover:translate-x-0
                  transition-all duration-200
                "
              >
                {node.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
