"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { LogIn } from "lucide-react";

/**
 * The immovable "Input" starting node.
 * Cannot be deleted or re-positioned.
 * It only has a source handle on the right.
 */
function InputNodeComponent(_props: NodeProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-300 dark:bg-green-600 border border-green-500 dark:border-green-400 shadow-md min-w-[110px] select-none">
      <LogIn className="h-4 w-4 text-green-900 dark:text-white shrink-0" />
      <span className="text-sm font-semibold text-green-900 dark:text-white">
        Input
      </span>
      {/* Only a source handle – edges flow out of Input */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-green-700 dark:!bg-green-300 !border-2 !border-white"
      />
    </div>
  );
}

export const InputNode = memo(InputNodeComponent);
