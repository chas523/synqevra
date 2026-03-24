"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Info } from "lucide-react";
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

interface RestoreSingleEntityVersionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versionId: string;
  versionName: string;
  entityType: string;
  entityId: string;
  onSuccess?: () => void;
}

export function RestoreSingleEntityVersionModal({
  open,
  onOpenChange,
  versionId,
  versionName,
  entityType,
  entityId,
  onSuccess,
}: RestoreSingleEntityVersionModalProps) {
  const [options, setOptions] = useState<Record<string, boolean>>({
    loadAttributes: false,
    loadRelations: false,
    loadCredentials: false,
    loadCalculatedFields: false,
  });
  const [entityInfo, setEntityInfo] = useState<any>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);

  const [isRestoring, setIsRestoring] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (open && versionId && entityId) {
      setIsRestoring(false);
      setIsPolling(false);
      setResult(null);
      setIsLoadingInfo(true);

      VersionControlService.getVersionEntityInfo(versionId, entityType, entityId)
        .then((info) => {
          setEntityInfo(info);
          setOptions({
            loadAttributes: !!info.hasAttributes,
            loadRelations: !!info.hasRelations,
            loadCredentials: !!info.hasCredentials,
            loadCalculatedFields: !!info.hasCalculatedFields,
          });
        })
        .finally(() => setIsLoadingInfo(false));
    }
  }, [open, versionId, entityType, entityId]);

  const pollStatus = async (requestId: string) => {
    try {
      const res = await VersionControlService.getRestoreVersionStatus(requestId);
      if (res.done) {
        setResult(res);
        setIsPolling(false);
        setIsRestoring(false);
        if (onSuccess) onSuccess();
      } else if (res.error) {
        toast.error(`Version restore error: ${res.error}`);
        setIsPolling(false);
        setIsRestoring(false);
      } else {
        setTimeout(() => pollStatus(requestId), 1000);
      }
    } catch (error) {
      toast.error("Failed to get version restore status");
      setIsPolling(false);
      setIsRestoring(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);

    const payload = {
      versionId: versionId,
      externalEntityId: {
        entityType,
        id: entityId,
      },
      config: {
        loadAttributes: options.loadAttributes,
        loadRelations: options.loadRelations,
        loadCredentials: options.loadCredentials,
        loadCalculatedFields: options.loadCalculatedFields,
      },
      type: "SINGLE_ENTITY",
    };

    try {
      const requestId = await VersionControlService.restoreVersion(payload);
      if (requestId) {
        setIsPolling(true);
        pollStatus(requestId);
      } else {
        toast.error("Failed to initiate version restore");
        setIsRestoring(false);
      }
    } catch (error) {
      toast.error("An error occurred during version restore");
      setIsRestoring(false);
    }
  };

  if (result) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px] p-6 text-center dark:bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white text-xl mx-auto mb-4">
              Restoration Result
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4 text-foreground dark:text-white">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${result.error ? "bg-red-500/20 text-red-500" : "bg-green-500/20 text-green-500"}`}
              >
                {result.error ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <p
                className={`font-semibold text-lg ${result.error ? "text-red-500" : "text-green-500"}`}
              >
                {result.error
                  ? "Restoration failed"
                  : "Version restored successfully"}
              </p>
              {result.error && (
                <p className="text-sm text-red-400/80 max-w-xs">{result.error}</p>
              )}
            </div>

            {!result.error && result.result && (
              <div className="grid gap-3 mt-2">
                {result.result.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl dark:bg-slate-800/50 border dark:border-slate-700/50 backdrop-blur-sm shadow-inner group"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-medium tracking-widest uppercase text-slate-500 group-hover:text-slate-400 transition-colors">
                        {item.entityType.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex items-center justify-around">
                      <div className="text-center px-2">
                        <div className="text-2xl font-bold text-blue-500">
                          {item.created}
                        </div>
                        <div className="text-[10px] uppercase tracking-tighter text-slate-500 font-medium">
                          Created
                        </div>
                      </div>
                      <div className="h-8 w-px bg-slate-700/50" />
                      <div className="text-center px-2">
                        <div className="text-2xl font-bold text-orange-500">
                          {item.updated}
                        </div>
                        <div className="text-[10px] uppercase tracking-tighter text-slate-500 font-medium">
                          Updated
                        </div>
                      </div>
                      <div className="h-8 w-px bg-slate-700/50" />
                      <div className="text-center px-2">
                        <div className="text-2xl font-bold text-red-500">
                          {item.deleted}
                        </div>
                        <div className="text-[10px] uppercase tracking-tighter text-slate-500 font-medium">
                          Deleted
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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

  const restoreOptions = [
    {
      key: "loadAttributes",
      label: "Load attributes",
      visible: !!entityInfo?.hasAttributes,
    },
    {
      key: "loadRelations",
      label: "Load relations",
      visible: !!entityInfo?.hasRelations,
    },
    {
      key: "loadCredentials",
      label: "Load credentials",
      visible: !!entityInfo?.hasCredentials,
    },
    {
      key: "loadCalculatedFields",
      label: "Load calculated fields",
      visible: !!entityInfo?.hasCalculatedFields,
    },
  ].filter((opt) => opt.visible);

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => !isRestoring && !isPolling && onOpenChange(val)}
    >
      <DialogContent className="max-w-md p-6 dark:bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-xl dark:text-white">
            Restore version '{versionName}'
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400">
              <Info className="w-4 h-4 shrink-0" />
              <p className="text-xs">
                Restore operation will overwrite the current entity state with
                the one from the version.
              </p>
            </div>

            {isLoadingInfo ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
              </div>
            ) : restoreOptions.length === 0 ? (
              <p className="text-sm text-center text-slate-500 py-4">
                No restore options available for this version.
              </p>
            ) : (
              restoreOptions.map((opt) => (
                <label
                  key={opt.key}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={options[opt.key] ?? true}
                      onChange={() =>
                        setOptions((prev) => ({
                          ...prev,
                          [opt.key]: !prev[opt.key],
                        }))
                      }
                      disabled={isRestoring || isPolling}
                      className="sr-only peer"
                    />
                    <div
                      className={`w-5 h-5 border-2 border-orange-500 dark:border-orange-400 rounded flex items-center justify-center transition-colors peer-checked:bg-orange-500 dark:peer-checked:bg-orange-400 ${isRestoring || isPolling ? "opacity-50" : ""}`}
                    >
                      {(options[opt.key] ?? true) && (
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
                    className={`text-sm dark:text-slate-200 select-none ${isRestoring || isPolling ? "opacity-50" : ""}`}
                  >
                    {opt.label}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isRestoring || isPolling}
            className="dark:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRestore}
            disabled={isRestoring || isPolling || isLoadingInfo}
            className="bg-[#2a456c] hover:bg-[#1a355c] text-white border-0"
          >
            {(isRestoring || isPolling) && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {isPolling ? "Restoring..." : "Restore"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
