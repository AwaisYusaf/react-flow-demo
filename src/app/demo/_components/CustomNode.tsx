import { Handle, Position } from "@xyflow/react";
import Image from "next/image";

interface CustomNodeProps {
  data: {
    label: string;
    imageUrl: string;
  };
}

export default function CustomNode({ data }: CustomNodeProps) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <Handle
        type="target"
        position={Position.Top}
        className="w-16 !bg-teal-500"
      />
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 relative mb-2">
          <Image
            src={data.imageUrl}
            alt={data.label}
            fill
            className="rounded-full object-cover"
          />
        </div>
        <div className="text-center font-medium">{data.label}</div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-16 !bg-teal-500"
      />
    </div>
  );
}
