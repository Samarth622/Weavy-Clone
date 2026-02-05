import {
  Type,
  Image,
  Video,
  Brain,
  Crop,
  Scissors,
} from 'lucide-react';

const nodes = [
  { label: "Text", icon: Type },
  { label: "Upload Image", icon: Image },
  { label: "Upload Video", icon: Video },
  { label: "LLM", icon: Brain },
  { label: "Crop Image", icon: Crop },
  { label: "Extract Frame", icon: Scissors },
];

export default function Sidebar() {
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
