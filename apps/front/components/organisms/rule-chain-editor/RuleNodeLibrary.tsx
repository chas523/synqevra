"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  RULE_NODE_DEFINITIONS,
  RULE_NODE_CATEGORIES,
} from "@/lib/constants/ruleNodeDefinitions";
import { RuleNodeDefinition } from "@/types/ruleChainTypes";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface RuleNodeLibraryProps {
  onNodeClick: (def: RuleNodeDefinition) => void;
}

/**
 * Left-side panel listing all available rule-node types grouped by category.
 * Supports search and collapsible category groups.
 * Nodes are draggable onto the canvas.
 */
export function RuleNodeLibrary({ onNodeClick }: RuleNodeLibraryProps) {
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return RULE_NODE_DEFINITIONS;
    return RULE_NODE_DEFINITIONS.filter(
      (d) =>
        d.label.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q),
    );
  }, [search]);

  const byCategory = useMemo(() => {
    return RULE_NODE_CATEGORIES.map((cat) => ({
      category: cat,
      nodes: filtered.filter((d) => d.category === cat),
    })).filter((g) => g.nodes.length > 0);
  }, [filtered]);

  const toggleCategory = (cat: string) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    def: RuleNodeDefinition,
  ) => {
    e.dataTransfer.setData("application/rulenode", JSON.stringify(def));
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="flex flex-col h-full w-full border-r border-border dark:border-slate-700 bg-background dark:bg-slate-900">
      {/* Search */}
      <div className="p-3 border-b border-border dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search nodes"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm dark:bg-slate-800 dark:text-white dark:border-slate-600 dark:placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Scrollable node list */}
      <ScrollArea className="flex-1">
        <div className="py-2 px-2 space-y-1">
          {byCategory.map(({ category, nodes }) => {
            const isCollapsed = collapsed[category] ?? false;
            return (
              <div key={category}>
                {/* Category header */}
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted dark:hover:bg-slate-800 transition-colors group"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-slate-400 group-hover:text-foreground dark:group-hover:text-white transition-colors">
                    {category}
                  </span>
                  {isCollapsed ? (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground dark:text-slate-400" />
                  ) : (
                    <ChevronUp className="h-3.5 w-3.5 text-muted-foreground dark:text-slate-400" />
                  )}
                </button>

                {/* Node chips */}
                {!isCollapsed && (
                  <div className="space-y-1 mt-0.5 mb-2">
                    {nodes.map((def) => (
                      <div
                        key={def.type}
                        draggable
                        onDragStart={(e) => handleDragStart(e, def)}
                        onClick={() => onNodeClick(def)}
                        title={def.description}
                        className={cn(
                          "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-grab active:cursor-grabbing",
                          "hover:opacity-90 transition-opacity text-xs font-medium text-black dark:text-white",
                          "border border-black/10 dark:border-white/10 shadow-sm",
                          def.color,
                        )}
                      >
                        <span className="truncate">{def.label}</span>
                        {/* Drag handle dots */}
                        <span className="ml-auto shrink-0 flex flex-col gap-[2px] opacity-40">
                          <span className="flex gap-[2px]">
                            <span className="w-[3px] h-[3px] rounded-full bg-current" />
                            <span className="w-[3px] h-[3px] rounded-full bg-current" />
                          </span>
                          <span className="flex gap-[2px]">
                            <span className="w-[3px] h-[3px] rounded-full bg-current" />
                            <span className="w-[3px] h-[3px] rounded-full bg-current" />
                          </span>
                          <span className="flex gap-[2px]">
                            <span className="w-[3px] h-[3px] rounded-full bg-current" />
                            <span className="w-[3px] h-[3px] rounded-full bg-current" />
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {byCategory.length === 0 && (
            <p className="text-center text-xs text-muted-foreground dark:text-slate-500 py-4">
              No nodes found
            </p>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
