"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import {
  RuleChainService,
  RuleChain,
} from "@/lib/services/thingsboardServices/ruleChainService";
import { CopyButton } from "@/components/molecules/CopyButton";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RuleChainDetailsTabContentProps {
  ruleChainId: string;
}

export function RuleChainDetailsTabContent({
  ruleChainId,
}: RuleChainDetailsTabContentProps) {
  const {
    data: ruleChain,
    isLoading,
    mutate,
  } = useSWR(
    ruleChainId ? ["ruleChainDetails", ruleChainId] : null,
    async () => {
      return RuleChainService.getRuleChainById(ruleChainId);
    },
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    if (ruleChain && !isEditing) {
      setName(ruleChain.name || "");
      setDescription(ruleChain.additionalInfo?.description || "");
      setDebugMode(!!ruleChain.debugMode);
    }
  }, [ruleChain, isEditing]);

  const hasChanges = useMemo(() => {
    if (!ruleChain) return false;
    return (
      name !== (ruleChain.name || "") ||
      description !== (ruleChain.additionalInfo?.description || "") ||
      debugMode !== !!ruleChain.debugMode
    );
  }, [name, description, debugMode, ruleChain]);

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!ruleChain) return;
    if (!name.trim()) {
      toast.error("RuleChain name is required");
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        ...ruleChain,
        name: name.trim(),
        debugMode,
        additionalInfo: {
          ...(ruleChain.additionalInfo || {}),
          description: description.trim(),
        },
      };

      const savedRuleChain = await RuleChainService.updateRuleChain(
        ruleChainId,
        payload,
      );
      await mutate(savedRuleChain, false);
      setIsEditing(false);
      toast.success("RuleChain updated successfully");
    } catch (error) {
      toast.error("Failed to update RuleChain");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!ruleChain) {
    return (
      <div className="p-4 text-center text-slate-500">RuleChain not found.</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2">
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-3 py-1.5 text-sm font-medium rounded-md border border-slate-300 hover:bg-slate-50"
          >
            Edit
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm font-medium rounded-md border border-slate-300 hover:bg-slate-50"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-1.5 text-sm font-medium rounded-md bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-60"
              disabled={isSaving || !hasChanges}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium ml-1">
              Name
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm">
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent outline-none"
                  />
                ) : (
                  ruleChain.name
                )}
              </div>
              <CopyButton value={ruleChain.name} size="icon" variant="ghost" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium ml-1">
              Description
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm">
                {isEditing ? (
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-transparent outline-none resize-none"
                  />
                ) : (
                  ruleChain.additionalInfo?.description || "-"
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium ml-1">
              Debug Mode
            </label>
            <div className="text-sm text-slate-700 ml-1 py-1">
              {isEditing ? (
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={debugMode}
                    onChange={(e) => setDebugMode(e.target.checked)}
                    className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span>{debugMode ? "Enabled" : "Disabled"}</span>
                </label>
              ) : ruleChain.debugMode ? (
                <span className="text-amber-600 font-medium">Enabled</span>
              ) : (
                <span className="text-slate-500">Disabled</span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium ml-1">
              RuleChain ID
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-600">
                {ruleChain.id?.id}
              </div>
              <CopyButton
                value={ruleChain.id?.id ?? ""}
                size="icon"
                variant="ghost"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium ml-1">
              Created At
            </label>
            <div className="text-sm text-slate-700 ml-1">
              {ruleChain.createdTime
                ? new Date(ruleChain.createdTime).toLocaleString()
                : "-"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
