"use client";

import { useRef, useCallback } from "react";
import { RuleNodeLibrary } from "./RuleNodeLibrary";
import { RuleChainCanvas, type CanvasApi } from "./RuleChainCanvas";
import type { RuleNodeDefinition } from "@/types/ruleChainTypes";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, History, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  useSaveRuleChainMetadata,
  useRuleChainDetails,
} from "@/hooks/thingsboard/rule-chains/useRuleChains";
import { toast } from "sonner";

interface RuleChainEditorProps {
  ruleChainId: string;
  ruleChainName: string;
}

export function RuleChainEditor({
  ruleChainId,
  ruleChainName,
}: RuleChainEditorProps) {
  // Ref holding the API exposed by the canvas
  const canvasApiRef = useRef<CanvasApi | null>(null);
  const { saveMetadata, isSavingMetadata } = useSaveRuleChainMetadata();
  const { metadata, isLoading: isMetadataLoading } =
    useRuleChainDetails(ruleChainId);

  const handleNodeClick = useCallback((def: RuleNodeDefinition) => {
    canvasApiRef.current?.addNode(def);
  }, []);

  const handleSave = async () => {
    if (!canvasApiRef.current) return;
    try {
      const metadata = canvasApiRef.current.getRuleChainMetadata();
      await saveMetadata(
        ruleChainId,
        metadata.nodes,
        metadata.connections,
        metadata.firstNodeIndex,
      );
      toast.success("Rule chain saved successfully");
    } catch (error) {
      toast.error("Failed to save rule chain", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden dark:bg-slate-950">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3 px-4 py-2 border-b border-border dark:border-slate-700 dark:bg-slate-900 shrink-0 h-12">
        <Link href="/rulechains" passHref>
          <Button
            variant="ghost"
            size="icon"
            className="dark:text-white dark:hover:bg-slate-800"
            title="Back to Rule Chains"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground dark:text-slate-400">
            Rule Chain
          </span>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <h1 className="text-sm font-semibold dark:text-white truncate max-w-[300px]">
            {ruleChainName}
          </h1>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="dark:text-white dark:hover:bg-slate-800 gap-1.5"
            title="Version history"
          >
            <History className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            className="gap-1.5"
            title="Save rule chain"
            onClick={handleSave}
            disabled={isSavingMetadata}
          >
            <Save className="h-4 w-4" />
            {isSavingMetadata ? "Saving..." : "Save"}
          </Button>
        </div>
      </header>

      {/* ── Body: sidebar + canvas ───────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar – fixed width, scrollable */}
        <div className="w-[200px] shrink-0 h-full overflow-hidden border-r border-border dark:border-slate-700">
          <RuleNodeLibrary onNodeClick={handleNodeClick} />
        </div>

        {/* Canvas */}
        <div className="flex-1 h-full overflow-hidden relative">
          {isMetadataLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10 dark:bg-slate-950/80">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : null}
          <RuleChainCanvas
            canvasApiRef={canvasApiRef}
            initialMetadata={metadata}
          />
        </div>
      </div>
    </div>
  );
}
