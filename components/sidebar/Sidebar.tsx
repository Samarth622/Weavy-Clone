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
    console.log("Adding node:", type);
    setNodes((prev: any[]) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type,
        position: {
          x: Math.random() * 400 + 200,
          y: Math.random() * 300 + 100,
        },
        data: {},
      },
    ]);
  };

  return (
    <div className="h-full flex flex-col px-4 py-5">
      
      <div className="text-xs uppercase tracking-wider text-gray-500 mb-4">
        Nodes
      </div>

      <div className="space-y-1.5">
        {nodes.map((node) => {
          const Icon = node.icon;
          return (
            <button
              key={node.label}
              onClick={() => addNode(node.type)}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium rounded-md 
                         bg-transparent hover:bg-[#1c1c1c] transition-colors"
            >
              <Icon size={16} className="text-gray-400" />
              <span>{node.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
