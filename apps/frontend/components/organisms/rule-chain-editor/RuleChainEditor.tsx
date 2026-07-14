"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { RuleNodeLibrary } from "./RuleNodeLibrary";
import { RuleChainCanvas, type CanvasApi } from "./RuleChainCanvas";
import type { RuleNodeDefinition } from "@/types/ruleChainTypes";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, History, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  useSaveRuleChainMetadata,
  useRuleChainDetails,
} from "@/hooks/thingsboard/rule-chains/useRuleChains";
import { toast } from "sonner";
import { useRepoSettingsInfo } from "@/hooks/thingsboard/version-control/useVersionControl";
import { VersionsTable } from "@/components/organisms/VersionsTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [debugAll, setDebugAll] = useState(false);
  const [remainingMinutes, setRemainingMinutes] = useState<number | null>(null);
  const [isVcModalOpen, setIsVcModalOpen] = useState(false);
  const [branch, setBranch] = useState("main");
  const { settingsInfo, isLoading: isLoadingVc } = useRepoSettingsInfo();
  const { saveMetadata, isSavingMetadata } = useSaveRuleChainMetadata();
  const {
    ruleChain,
    metadata,
    isLoading: isMetadataLoading,
    mutate,
  } = useRuleChainDetails(ruleChainId);

  const isDebugEnabled = (node: any) => {
    const s = node.debugSettings;
    if (!s) return false;
    // Backend sets allEnabled: false and sets allEnabledUntil to +15min (unix timestamp ms)
    return (
      s.allEnabled === true ||
      (s.allEnabledUntil && s.allEnabledUntil > Date.now())
    );
  };

  useEffect(() => {
    if (
      metadata?.nodes &&
      Array.isArray(metadata.nodes) &&
      metadata.nodes.length > 0
    ) {
      const allEnabled = metadata.nodes.every(isDebugEnabled);
      setDebugAll(allEnabled);

      // Calculate remaining minutes from the node with the max expiration time
      const maxExp = Math.max(
        ...metadata.nodes.map(
          (n: any) => n.debugSettings?.allEnabledUntil || 0,
        ),
      );
      if (maxExp > Date.now()) {
        setRemainingMinutes(Math.ceil((maxExp - Date.now()) / 60000));
      } else {
        setRemainingMinutes(null);
      }
    }
  }, [metadata]);

  // Update timer every minute
  useEffect(() => {
    if (!remainingMinutes) return;
    const interval = setInterval(() => {
      setRemainingMinutes((prev) => (prev && prev > 1 ? prev - 1 : null));
    }, 60000);
    return () => clearInterval(interval);
  }, [remainingMinutes]);

  const handleNodeClick = useCallback((def: RuleNodeDefinition) => {
    canvasApiRef.current?.addNode(def);
  }, []);

  const handleSave = async () => {
    if (!canvasApiRef.current) return;
    try {
      const canvasMetadata = canvasApiRef.current.getRuleChainMetadata();

      const canvasAllEnabled =
        canvasMetadata.nodes.length > 0 &&
        canvasMetadata.nodes.every(isDebugEnabled);
      let nodesToSave = canvasMetadata.nodes;

      // Only override if the checkbox state differs from the current canvas state,
      // or if debugAll is true (to constantly refresh the 15-minute expiration timer).
      if (debugAll !== canvasAllEnabled || debugAll) {
        nodesToSave = canvasMetadata.nodes.map((node) => ({
          ...node,
          debugSettings: {
            failuresEnabled: false,
            allEnabled: debugAll,
            allEnabledUntil: 0,
          },
        }));
      }

      await saveMetadata(
        ruleChainId,
        nodesToSave,
        canvasMetadata.connections,
        canvasMetadata.firstNodeIndex,
      );

      // Update UI immediately if debug mode was just enabled
      if (debugAll) {
        setRemainingMinutes(15);
      } else {
        setRemainingMinutes(null);
      }

      // Re-fetch from server to get accurate timestamps
      await mutate();

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
          <h1 className="text-sm font-semibold dark:text-white truncate max-w-75">
            {ruleChainName}
          </h1>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <label className="flex items-center gap-2 mr-2 cursor-pointer text-sm dark:text-slate-300 select-none">
            <Checkbox
              checked={debugAll}
              onCheckedChange={(checked) => setDebugAll(checked === true)}
            />
            Debug All {remainingMinutes ? `(${remainingMinutes} min)` : ""}
          </label>
          <Button
            variant="ghost"
            size="sm"
            className="dark:text-white dark:hover:bg-slate-800 gap-1.5"
            title="Version history"
            onClick={() => setIsVcModalOpen(true)}
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

      {/* ── Version Control Modal ─────────────────────────────────────── */}
      <Dialog open={isVcModalOpen} onOpenChange={setIsVcModalOpen}>
        <DialogContent className="sm:max-w-full w-auto p-0 bg-transparent border-none shadow-none outline-none [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="sr-only">Version Control</DialogTitle>
          </DialogHeader>
          <VersionsTable
            branch={branch}
            onBranchChange={setBranch}
            entityType="RULE_CHAIN"
            entityId={ruleChainId}
            isReadOnly={settingsInfo?.readOnly === true}
          />
        </DialogContent>
      </Dialog>

      {/* ── Body: sidebar + canvas ───────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar – fixed width, scrollable */}
        <div className="w-50 shrink-0 h-full overflow-hidden border-r border-border dark:border-slate-700">
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
            tenantId={ruleChain?.tenantId?.id}
          />
        </div>
      </div>
    </div>
  );
}
