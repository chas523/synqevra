"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { RuleNodeData } from "@/types/ruleChainTypes";
import { AlignJustify } from "lucide-react";

/**
 * Generic rule-node component. Colour is driven by the `data.color` field
 * which is a Tailwind bg class (e.g. "bg-yellow-300 dark:bg-yellow-500").
 */
function RuleNodeComponent({ data }: NodeProps) {
  const d = data as unknown as RuleNodeData;
  const bg = d.color ?? "bg-yellow-300 dark:bg-yellow-500";

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg ${bg} border border-black/10 dark:border-white/10 shadow-md min-w-[150px] max-w-[220px] select-none`}
    >
      {/* Target handle – left side (incoming edge) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-gray-600 dark:!bg-gray-300 !border-2 !border-white"
      />

      <AlignJustify className="h-4 w-4 shrink-0 text-black/60 dark:text-white/80" />

      <div className="flex flex-col min-w-0">
        <span className="text-xs font-semibold text-black dark:text-white truncate leading-tight">
          {d.label as string}
        </span>
        <span className="text-[10px] text-black/60 dark:text-white/60 truncate leading-tight mt-0.5">
          {d.category} - {d.typeName}
        </span>
      </div>

      {/* Source handle – right side (outgoing edge) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-gray-600 dark:!bg-gray-300 !border-2 !border-white"
      />
    </div>
  );
}

export const RuleNode = memo(RuleNodeComponent);
