"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Trash2, ChevronUp, Plus } from "lucide-react";
import { SettingsService } from "@/lib/services/thingsboardServices/settingsService";
import { VersionControlService } from "@/lib/services/thingsboardServices/versionControlService";
import { useRepoSettingsInfo } from "@/hooks/thingsboard/version-control/useVersionControl";
import { RepositorySettingsForm } from "@/components/organisms/RepositorySettingsForm";
import { useManageRepoSettings } from "@/hooks/thingsboard/version-control/useVersionControl";
import { RepoSettings } from "@/types/versionControlTypes";
import {
  ENTITY_TYPE_CONFIGS,
  getEntityTypeConfig,
} from "@/lib/config/entityTypeConfig";
import {
  SelectAdmin as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/admin_select";

interface EntityEntry {
  id: string; // unique key for React
  entityType: string;
  branch: string;
  options: Record<string, boolean>;
}

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

export function AutoCommitTab() {
  const {
    isConfigured,
    isLoading: isLoadingInfo,
    mutate: mutateInfo,
  } = useRepoSettingsInfo();
  const {
    isChecking,
    isSaving: isSavingRepo,
    checkAccess,
    saveSettings: saveRepoSettings,
  } = useManageRepoSettings();

  // If not configured, show repo form
  if (isLoadingInfo) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground dark:text-slate-400">
        <p className="text-sm">Loading...</p>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <NotConfiguredView
        onCheckAccess={checkAccess}
        onSave={async (payload) => {
          await saveRepoSettings(payload);
          await mutateInfo();
        }}
        isChecking={isChecking}
        isSaving={isSavingRepo}
      />
    );
  }

  return <AutoCommitForm />;
}

// ============ NOT CONFIGURED ============
function NotConfiguredView({
  onCheckAccess,
  onSave,
  isChecking,
  isSaving,
}: {
  onCheckAccess: (payload: RepoSettings) => Promise<void>;
  onSave: (payload: RepoSettings) => Promise<void>;
  isChecking: boolean;
  isSaving: boolean;
}) {
  const handleCheckAccess = useCallback(
    async (payload: RepoSettings) => {
      try {
        await onCheckAccess(payload);
        toast.success("Repository access verified");
      } catch {
        toast.error("Verification failed");
      }
    },
    [onCheckAccess],
  );

  const handleSave = useCallback(
    async (payload: RepoSettings) => {
      try {
        await onSave(payload);
        toast.success("Repository configured successfully");
      } catch {
        toast.error("Failed to configure repository");
      }
    },
    [onSave],
  );

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 shadow-sm">
        <p className="text-sm text-muted-foreground dark:text-slate-400 mb-4">
          Repository is not configured. Please configure version control first
          to use auto-commit.
        </p>
      </div>
      <RepositorySettingsForm
        onCheckAccess={handleCheckAccess}
        onSave={handleSave}
        isChecking={isChecking}
        isSaving={isSaving}
      />
    </div>
  );
}

// ============ AUTO-COMMIT FORM (when configured) ============
function AutoCommitForm() {
  const [entries, setEntries] = useState<EntityEntry[]>([]);
  const [branches, setBranches] = useState<
    { name: string; default: boolean }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isFetchingBranches, setIsFetchingBranches] = useState(false);
  const [branchesFetched, setBranchesFetched] = useState(false);

  // Load existing settings on mount
  useEffect(() => {
    async function load() {
      try {
        const settings = await SettingsService.getAutoCommitSettings().catch(
          () => null,
        );

        if (settings && typeof settings === "object") {
          const loaded: EntityEntry[] = [];
          for (const [entityType, config] of Object.entries(settings)) {
            const cfg = config as any;
            const branch = cfg.branch || "main";
            const options: Record<string, boolean> = {};
            const entityConfig = getEntityTypeConfig(entityType);
            if (entityConfig) {
              for (const opt of entityConfig.exportOptions) {
                options[opt.key] = cfg[opt.key] ?? opt.defaultValue;
              }
            }
            loaded.push({ id: generateId(), entityType, branch, options });
          }
          setEntries(loaded);
        }
      } catch {
        toast.error("Failed to load auto-commit settings");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const loadBranches = useCallback(async () => {
    if (branchesFetched || isFetchingBranches) return;
    setIsFetchingBranches(true);
    try {
      const list = await VersionControlService.getBranches();
      setBranches(list || []);
      setBranchesFetched(true);
    } catch {
      toast.error("Failed to fetch branches");
    } finally {
      setIsFetchingBranches(false);
    }
  }, [branchesFetched, isFetchingBranches]);

  const defaultBranch = useMemo(() => {
    return branches.find((b) => b.default)?.name || "main";
  }, [branches]);

  const usedEntityTypes = useMemo(() => {
    return new Set(entries.map((e) => e.entityType));
  }, [entries]);

  const availableEntityTypes = useMemo(() => {
    return ENTITY_TYPE_CONFIGS.filter((c) => !usedEntityTypes.has(c.value));
  }, [usedEntityTypes]);

  const handleAddEntity = useCallback(() => {
    if (availableEntityTypes.length === 0) return;
    const first = availableEntityTypes[0];
    const options: Record<string, boolean> = {};
    for (const opt of first.exportOptions) {
      options[opt.key] = opt.defaultValue;
    }
    setEntries((prev) => [
      ...prev,
      {
        id: generateId(),
        entityType: first.value,
        branch: defaultBranch,
        options,
      },
    ]);
  }, [availableEntityTypes, defaultBranch]);

  const handleRemoveEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleRemoveAll = useCallback(() => {
    setEntries([]);
  }, []);

  const handleChangeEntityType = useCallback((id: string, newType: string) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== id) return entry;
        const config = getEntityTypeConfig(newType);
        const options: Record<string, boolean> = {};
        if (config) {
          for (const opt of config.exportOptions) {
            options[opt.key] = opt.defaultValue;
          }
        }
        return { ...entry, entityType: newType, options };
      }),
    );
  }, []);

  const handleChangeBranch = useCallback((id: string, branch: string) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, branch } : entry)),
    );
  }, []);

  const handleToggleOption = useCallback((id: string, optionKey: string) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== id) return entry;
        return {
          ...entry,
          options: { ...entry.options, [optionKey]: !entry.options[optionKey] },
        };
      }),
    );
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const payload: Record<string, any> = {};
      for (const entry of entries) {
        payload[entry.entityType] = {
          ...entry.options,
          branch: entry.branch,
        };
      }
      await SettingsService.saveAutoCommitSettings(payload);
      toast.success("Auto-commit settings saved");
    } catch {
      toast.error("Failed to save auto-commit settings");
    } finally {
      setIsSaving(false);
    }
  }, [entries]);

  const handleDelete = useCallback(async () => {
    if (!confirm("Are you sure you want to delete all auto-commit settings?"))
      return;
    setIsDeleting(true);
    try {
      await SettingsService.deleteAutoCommitSettings();
      setEntries([]);
      toast.success("Auto-commit settings deleted");
    } catch {
      toast.error("Failed to delete auto-commit settings");
    } finally {
      setIsDeleting(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground dark:text-slate-400">
        <p className="text-sm">Loading auto-commit settings...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground dark:text-white">
          Auto-commit settings
        </h2>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-white transition-colors"
          title="Help"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Auto-commit entities fieldset */}
      <fieldset className="border border-slate-300 dark:border-slate-600 rounded-md p-4 mb-4">
        <legend className="text-sm text-muted-foreground dark:text-slate-400 px-2">
          Auto-commit entities
        </legend>

        {entries.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground dark:text-slate-400">
              No entities configured for auto-commit
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <EntityEntryCard
                key={entry.id}
                entry={entry}
                branches={branches}
                availableEntityTypes={availableEntityTypes}
                usedEntityTypes={usedEntityTypes}
                onChangeType={(type) => handleChangeEntityType(entry.id, type)}
                onChangeBranch={(branch) =>
                  handleChangeBranch(entry.id, branch)
                }
                onOpenBranchDropdown={loadBranches}
                isFetchingBranches={isFetchingBranches}
                onToggleOption={(key) => handleToggleOption(entry.id, key)}
                onRemove={() => handleRemoveEntry(entry.id)}
              />
            ))}
          </div>
        )}

        {/* Buttons inside fieldset */}
        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={handleAddEntity}
            disabled={availableEntityTypes.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-700 dark:bg-slate-600 text-white text-sm font-medium rounded hover:bg-slate-800 dark:hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add entity type
          </button>
          <button
            type="button"
            onClick={handleRemoveAll}
            disabled={entries.length === 0}
            className="px-4 py-2 bg-slate-700 dark:bg-slate-600 text-white text-sm font-medium rounded hover:bg-slate-800 dark:hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Remove all
          </button>
        </div>
      </fieldset>

      {/* Save / Delete buttons */}
      <div className="flex items-center justify-end gap-2">
        {entries.length > 0 && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium transition-colors"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-slate-700 dark:bg-blue-600 text-white text-sm font-medium rounded hover:bg-slate-800 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

// ============ ENTITY ENTRY CARD ============
function EntityEntryCard({
  entry,
  branches,
  availableEntityTypes,
  usedEntityTypes,
  onChangeType,
  onChangeBranch,
  onOpenBranchDropdown,
  isFetchingBranches,
  onToggleOption,
  onRemove,
}: {
  entry: EntityEntry;
  branches: { name: string; default: boolean }[];
  availableEntityTypes: typeof ENTITY_TYPE_CONFIGS;
  usedEntityTypes: Set<string>;
  onChangeType: (type: string) => void;
  onChangeBranch: (branch: string) => void;
  onOpenBranchDropdown: () => void;
  isFetchingBranches: boolean;
  onToggleOption: (key: string) => void;
  onRemove: () => void;
}) {
  const entityConfig = getEntityTypeConfig(entry.entityType);
  const branchLabel = entry.branch; // always show actual branch name

  // Build selectable options: current type + available types
  const selectableTypes = useMemo(() => {
    const current = ENTITY_TYPE_CONFIGS.find(
      (c) => c.value === entry.entityType,
    );
    const others = availableEntityTypes;
    if (current) return [current, ...others];
    return others;
  }, [entry.entityType, availableEntityTypes]);

  // Ensure currently selected branch is always an option so SelectValue works
  const displayBranches = useMemo(() => {
    const list = [...branches];
    if (!list.find((b) => b.name === entry.branch)) {
      list.unshift({ name: entry.branch, default: false });
    }
    return list;
  }, [branches, entry.branch]);

  return (
    <fieldset className="border border-slate-300 dark:border-slate-600 rounded-md p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <legend className="text-sm font-medium text-foreground dark:text-white">
          {entityConfig?.pluralLabel || entry.entityType}{" "}
          <span className="text-muted-foreground dark:text-slate-400 font-normal">
            (auto-commit to <strong>{branchLabel}</strong> branch)
          </span>
        </legend>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-muted-foreground hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
            title="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Type + Branch selects */}
      <div className="flex items-start gap-4 mb-3">
        <div className="w-40">
          <label className="text-xs text-muted-foreground dark:text-slate-400 block mb-1">
            Type*
          </label>
          <Select value={entry.entityType} onValueChange={onChangeType}>
            <SelectTrigger className="w-full dark:text-white border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {selectableTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-40">
          <label className="text-xs text-muted-foreground dark:text-slate-400 block mb-1">
            Branch
          </label>
          <Select
            value={entry.branch}
            onValueChange={onChangeBranch}
            onOpenChange={(open) => {
              if (open) onOpenBranchDropdown();
            }}
          >
            <SelectTrigger className="w-full dark:text-white border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {isFetchingBranches && branches.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground text-center">
                  Loading...
                </div>
              ) : null}
              {displayBranches.map((b) => (
                <SelectItem key={b.name} value={b.name}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Export option checkboxes */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {entityConfig?.exportOptions.map((opt) => (
          <label
            key={opt.key}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="relative">
              <input
                type="checkbox"
                checked={entry.options[opt.key] ?? opt.defaultValue}
                onChange={() => onToggleOption(opt.key)}
                className="sr-only peer"
              />
              <div className="w-4 h-4 border-2 border-orange-500 dark:border-orange-400 rounded-sm flex items-center justify-center peer-checked:bg-orange-500 dark:peer-checked:bg-orange-400 transition-colors">
                {(entry.options[opt.key] ?? opt.defaultValue) && (
                  <svg
                    className="w-3 h-3 text-white"
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
            <span className="text-sm text-foreground dark:text-white select-none">
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
