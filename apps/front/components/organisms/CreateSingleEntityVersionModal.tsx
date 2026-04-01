"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { VersionControlService } from "@/lib/services/thingsboardServices/versionControlService";
import { getEntityTypeConfig } from "@/lib/config/entityTypeConfig";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SelectAdmin as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/admin_select";

interface CreateSingleEntityVersionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branches: { name: string; default: boolean }[];
  entityType: string;
  entityId: string;
  onSuccess: () => void;
}

export function CreateSingleEntityVersionModal({
  open,
  onOpenChange,
  branches,
  entityType,
  entityId,
  onSuccess,
}: CreateSingleEntityVersionModalProps) {
  const [branch, setBranch] = useState("main");
  const [versionName, setVersionName] = useState("");
  const [options, setOptions] = useState<Record<string, boolean>>({});

  const [isCreating, setIsCreating] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [result, setResult] = useState<any>(null);

  const entityConfig = getEntityTypeConfig(entityType);

  useEffect(() => {
    if (open) {
      setBranch(branches.find((b) => b.default)?.name || "main");
      setVersionName("");
      setIsCreating(false);
      setIsPolling(false);
      setResult(null);

      // Set default options based on config
      if (entityConfig) {
        const defaultOptions: Record<string, boolean> = {};
        for (const opt of entityConfig.exportOptions) {
          defaultOptions[opt.key] = opt.defaultValue;
        }
        setOptions(defaultOptions);
      }
    }
  }, [open, branches, entityConfig]);

  const pollStatus = async (requestId: string) => {
    try {
      const res =
        await VersionControlService.getVersionCreationStatus(requestId);
      if (res.done) {
        setResult(res);
        setIsPolling(false);
        setIsCreating(false);
        onSuccess();
      } else if (res.error) {
        toast.error(`Version creation error: ${res.error}`);
        setIsPolling(false);
        setIsCreating(false);
      } else {
        setTimeout(() => pollStatus(requestId), 1000);
      }
    } catch (error) {
      toast.error("Failed to get version creation status");
      setIsPolling(false);
      setIsCreating(false);
    }
  };

  const handleCreate = async () => {
    if (!versionName.trim()) {
      toast.error("Version name is required");
      return;
    }

    setIsCreating(true);

    const payload = {
      entityId: {
        entityType,
        id: entityId,
      },
      branch,
      versionName,
      config: {
        saveRelations: options.saveRelations ?? false,
        saveAttributes: options.saveAttributes ?? false,
        saveCredentials: options.saveCredentials ?? false,
        saveCalculatedFields: options.saveCalculatedFields ?? false,
      },
      type: "SINGLE_ENTITY",
    };

    try {
      const requestId = await VersionControlService.createVersion(payload);
      if (requestId) {
        setIsPolling(true);
        pollStatus(requestId);
      } else {
        toast.error("Failed to initiate version creation");
        setIsCreating(false);
      }
    } catch (error) {
      toast.error("An error occurred during version creation");
      setIsCreating(false);
    }
  };

  if (result) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px] p-6 text-center dark:bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white text-xl mx-auto mb-4">
              Version Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 text-foreground dark:text-white">
            <p className="font-semibold text-lg">
              {result.added === 0 &&
              result.modified === 0 &&
              result.removed === 0
                ? "No changes detected."
                : "Version created successfully."}
            </p>
            {result.added > 0 && <p>{result.added} entity added.</p>}
            {result.modified > 0 && <p>{result.modified} entity modified.</p>}
            {result.error && (
              <p className="text-red-500">Error: {result.error}</p>
            )}
          </div>
          <DialogFooter className="sm:justify-center">
            <Button
              variant="outline"
              className="dark:text-white"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => !isCreating && !isPolling && onOpenChange(val)}
    >
      <DialogContent className="max-w-md p-6 dark:bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-xl dark:text-white">
            Create entity version
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Branch*
            </label>
            <Select
              value={branch}
              onValueChange={setBranch}
              disabled={isCreating || isPolling}
            >
              <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-800/50 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b.name} value={b.name}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Version name*
            </label>
            <Input
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800/50 dark:text-white border-slate-200 dark:border-slate-800"
              disabled={isCreating || isPolling}
              placeholder="Enter version name"
            />
          </div>

          <div className="space-y-3 pt-2">
            {entityConfig?.exportOptions.map((opt) => (
              <label
                key={opt.key}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={options[opt.key] ?? opt.defaultValue}
                    onChange={() =>
                      setOptions((prev) => ({
                        ...prev,
                        [opt.key]: !prev[opt.key],
                      }))
                    }
                    disabled={isCreating || isPolling}
                    className="sr-only peer"
                  />
                  <div
                    className={`w-5 h-5 border-2 border-orange-500 dark:border-orange-400 rounded flex items-center justify-center transition-colors peer-checked:bg-orange-500 dark:peer-checked:bg-orange-400 ${isCreating || isPolling ? "opacity-50" : ""}`}
                  >
                    {(options[opt.key] ?? opt.defaultValue) && (
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span
                  className={`text-sm dark:text-slate-200 select-none ${isCreating || isPolling ? "opacity-50" : ""}`}
                >
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isCreating || isPolling}
            className="dark:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating || isPolling || !versionName.trim()}
            className="bg-[#2a456c] hover:bg-[#1a355c] text-white border-0"
          >
            {(isCreating || isPolling) && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {isPolling ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
