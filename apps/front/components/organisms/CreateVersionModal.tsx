"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Trash2, Plus, ChevronUp, Loader2 } from "lucide-react";
import { VersionControlService } from "@/lib/services/thingsboardServices/versionControlService";
import {
  ENTITY_TYPE_CONFIGS,
  getEntityTypeConfig,
} from "@/lib/config/entityTypeConfig";
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
import { Switch } from "@/components/ui/switch";

export interface CreateVersionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branches: { name: string; default: boolean }[];
  onSuccess: () => void;
}

interface EntityEntry {
  id: string;
  entityType: string;
  syncStrategy: string;
  allEntities: boolean;
  options: Record<string, boolean>;
  entityIds: string[]; // for when allEntities is false
}

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

export function CreateVersionModal({
  open,
  onOpenChange,
  branches,
  onSuccess,
}: CreateVersionModalProps) {
  const [branch, setBranch] = useState("main");
  const [versionName, setVersionName] = useState("");
  const [defaultSyncStrategy, setDefaultSyncStrategy] = useState("Merge");
  const [entries, setEntries] = useState<EntityEntry[]>([]);

  const [isCreating, setIsCreating] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [result, setResult] = useState<any>(null); // To show creation result

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setBranch(branches.find((b) => b.default)?.name || "main");
      setVersionName("");
      setDefaultSyncStrategy("Merge");
      setEntries([]);
      setIsCreating(false);
      setIsPolling(false);
      setResult(null);
    }
  }, [open, branches]);

  const usedEntityTypes = useMemo(
    () => new Set(entries.map((e) => e.entityType)),
    [entries],
  );
  const availableEntityTypes = useMemo(
    () => ENTITY_TYPE_CONFIGS.filter((c) => !usedEntityTypes.has(c.value)),
    [usedEntityTypes],
  );

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
        syncStrategy: "Default",
        allEntities: true,
        options,
        entityIds: [],
      },
    ]);
  }, [availableEntityTypes]);

  const handleRemoveEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
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
        return { ...entry, entityType: newType, options, entityIds: [] };
      }),
    );
  }, []);

  const handleChangeSyncStrategy = useCallback(
    (id: string, syncStrategy: string) => {
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, syncStrategy } : entry,
        ),
      );
    },
    [],
  );

  const handleToggleAllEntities = useCallback(
    (id: string, allEntities: boolean) => {
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                allEntities,
                entityIds: allEntities ? [] : entry.entityIds,
              }
            : entry,
        ),
      );
    },
    [],
  );

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

  const handleSetEntityIds = useCallback((id: string, entityIds: string[]) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, entityIds } : entry)),
    );
  }, []);

  const pollStatus = async (requestId: string) => {
    try {
      const res =
        await VersionControlService.getVersionCreationStatus(requestId);
      if (res.done) {
        setResult(res);
        setIsPolling(false);
        setIsCreating(false);
        onSuccess(); // refresh table
      } else if (res.error) {
        toast.error(`Version creation error: ${res.error}`);
        setIsPolling(false);
        setIsCreating(false);
      } else {
        // Keep polling
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

    const entityTypesObj: Record<string, any> = {};
    for (const entry of entries) {
      entityTypesObj[entry.entityType] = {
        syncStrategy:
          entry.syncStrategy === "Default"
            ? null
            : entry.syncStrategy.toUpperCase(),
        ...entry.options,
        allEntities: entry.allEntities,
        ...(entry.allEntities ? {} : { entityIds: entry.entityIds }),
      };
    }

    const payload = {
      branch,
      versionName,
      syncStrategy: defaultSyncStrategy.toUpperCase(),
      entityTypes: entityTypesObj,
      type: "COMPLEX",
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

  // If result exists, show the result view
  if (result) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px] p-6 text-center">
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
                ? "No entities added."
                : "Version created successfully."}
            </p>
            {result.added > 0 && <p>{result.added} entities added.</p>}
            {result.modified > 0 && <p>{result.modified} entities modified.</p>}
            {result.removed > 0 && <p>{result.removed} entities removed.</p>}
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
      <DialogContent className="max-w-[90vw] md:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <DialogTitle className="text-xl dark:text-white">
            Create entities version
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Top form fields */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-muted-foreground dark:text-slate-400">
                Branch*
              </label>
              <Select
                value={branch}
                onValueChange={setBranch}
                disabled={isCreating || isPolling}
              >
                <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-800/50 h-10 dark:text-white">
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
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-muted-foreground dark:text-slate-400">
                Version name*
              </label>
              <Input
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800/50 h-10 border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-orange-500 dark:text-white"
                disabled={isCreating || isPolling}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground dark:text-slate-400">
              Default sync strategy*
            </label>
            <Select
              value={defaultSyncStrategy}
              onValueChange={setDefaultSyncStrategy}
              disabled={isCreating || isPolling}
            >
              <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-800/50 h-10 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Merge">Merge</SelectItem>
                <SelectItem value="Overwrite">Overwrite</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground pt-1 dark:text-slate-400">
              Creates or updates selected entities in the repository. All other
              repository entities are <strong>not modified</strong>.
            </p>
          </div>

          {/* Entities fieldset */}
          <fieldset className="border border-slate-200 dark:border-slate-800 rounded-lg p-5">
            <legend className="text-sm font-medium text-foreground dark:text-slate-300 px-2">
              Entities to export
            </legend>

            <div className="space-y-4 mb-4">
              {entries.map((entry) => (
                <EntityEntryCard
                  key={entry.id}
                  entry={entry}
                  availableEntityTypes={availableEntityTypes}
                  onChangeType={(type) =>
                    handleChangeEntityType(entry.id, type)
                  }
                  onChangeSyncStrategy={(strategy) =>
                    handleChangeSyncStrategy(entry.id, strategy)
                  }
                  onToggleAll={(all) => handleToggleAllEntities(entry.id, all)}
                  onToggleOption={(key) => handleToggleOption(entry.id, key)}
                  onChangeIds={(ids) => handleSetEntityIds(entry.id, ids)}
                  onRemove={() => handleRemoveEntry(entry.id)}
                  disabled={isCreating || isPolling}
                />
              ))}
            </div>

            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/30 p-2 rounded border border-dashed border-slate-300 dark:border-slate-700">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddEntity}
                disabled={
                  availableEntityTypes.length === 0 || isCreating || isPolling
                }
                className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add entity type
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEntries([])}
                disabled={entries.length === 0 || isCreating || isPolling}
                className="bg-[#2a456c] hover:bg-[#1a355c] text-white border-0"
              >
                Remove all
              </Button>
            </div>
          </fieldset>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 sm:justify-end">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isCreating || isPolling}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={
              isCreating ||
              isPolling ||
              !versionName.trim() ||
              entries.some((e) => !e.allEntities && e.entityIds.length === 0)
            }
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-300 dark:hover:bg-slate-400 dark:text-slate-900"
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

function EntityEntryCard({
  entry,
  availableEntityTypes,
  onChangeType,
  onChangeSyncStrategy,
  onToggleAll,
  onToggleOption,
  onChangeIds,
  onRemove,
  disabled,
}: {
  entry: EntityEntry;
  availableEntityTypes: typeof ENTITY_TYPE_CONFIGS;
  onChangeType: (type: string) => void;
  onChangeSyncStrategy: (strategy: string) => void;
  onToggleAll: (all: boolean) => void;
  onToggleOption: (key: string) => void;
  onChangeIds: (ids: string[]) => void;
  onRemove: () => void;
  disabled: boolean;
}) {
  const entityConfig = getEntityTypeConfig(entry.entityType);

  const selectableTypes = useMemo(() => {
    const current = ENTITY_TYPE_CONFIGS.find(
      (c) => c.value === entry.entityType,
    );
    const others = availableEntityTypes;
    if (current) return [current, ...others];
    return others;
  }, [entry.entityType, availableEntityTypes]);

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded shadow-sm bg-white dark:bg-slate-900 pb-4">
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b border-slate-100 dark:border-slate-800/50">
        <span className="font-semibold text-sm dark:text-white">
          {entityConfig?.pluralLabel || entry.entityType}
        </span>
        <div className="flex gap-1 items-center">
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <ChevronUp className="w-4 h-4 text-slate-400 ml-1" />
        </div>
      </div>

      <div className="p-4 flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Type*
              </label>
              <Select
                value={entry.entityType}
                onValueChange={onChangeType}
                disabled={disabled}
              >
                <SelectTrigger className="h-9 bg-slate-50 dark:bg-slate-800/50 dark:text-white">
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
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Sync strategy
              </label>
              <Select
                value={entry.syncStrategy}
                onValueChange={onChangeSyncStrategy}
                disabled={disabled}
              >
                <SelectTrigger className="h-9 bg-slate-50 dark:bg-slate-800/50 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Default">Default</SelectItem>
                  <SelectItem value="Merge">Merge</SelectItem>
                  <SelectItem value="Overwrite">Overwrite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Switch
              checked={entry.allEntities}
              onCheckedChange={onToggleAll}
              disabled={disabled}
              className="data-[state=checked]:bg-orange-500"
            />
            <span className="text-sm font-medium dark:text-white">
              All entities
            </span>
          </div>

          {!entry.allEntities && (
            <div className="pt-2">
              <EntityMultiSelect
                entityType={entry.entityType}
                selectedIds={entry.entityIds}
                onChange={onChangeIds}
                disabled={disabled}
              />
            </div>
          )}
        </div>

        {/* Export options column */}
        <div className="w-[200px] flex flex-col gap-3 pt-1">
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
                  disabled={disabled}
                  className="sr-only peer"
                />
                <div
                  className={`w-4 h-4 border-2 border-orange-500 dark:border-orange-400 rounded-sm flex items-center justify-center transition-colors ${disabled ? "opacity-50" : ""} peer-checked:bg-orange-500 dark:peer-checked:bg-orange-400`}
                >
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
              <span
                className={`text-sm text-foreground dark:text-white select-none ${disabled ? "opacity-50" : ""}`}
              >
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// A component to fetch and multiselect entities of a given type
function EntityMultiSelect({
  entityType,
  selectedIds,
  onChange,
  disabled,
}: {
  entityType: string;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled: boolean;
}) {
  const [entities, setEntities] = useState<any[]>([]);
  const [selectedEntitiesCache, setSelectedEntitiesCache] = useState<
    Record<string, any>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Clear old entities when entity type changes, optionally fetch immediately if dropdown is open
  useEffect(() => {
    setEntities([]);
    setSearch("");
    if (isOpen) {
      loadEntitiesForType(entityType);
    }
  }, [entityType, isOpen]); // Reacting to entityType changes. If it becomes open, the onClick handles it usually, but we also handle it here.

  const loadEntitiesForType = async (typeToLoad: string) => {
    setIsLoading(true);
    try {
      const data = await VersionControlService.getEntitiesByType(
        typeToLoad,
        0,
        100,
      ); // Fetch up to 100 for now
      if (data?.data) {
        setEntities(data.data);
      }
    } catch {
      toast.error("Failed to fetch entities");
    } finally {
      setIsLoading(false);
    }
  };

  const loadEntities = async () => {
    if (entities.length > 0) return;
    await loadEntitiesForType(entityType);
  };

  const toggleId = (id: string, entity: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
      setSelectedEntitiesCache((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else {
      onChange([...selectedIds, id]);
      setSelectedEntitiesCache((prev) => ({ ...prev, [id]: entity }));
    }
  };

  const removeId = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(selectedIds.filter((x) => x !== id));
    setSelectedEntitiesCache((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const filteredEntities = entities.filter((e) =>
    e.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative">
      {/* Custom Multi-select Combo Box */}
      <div
        className={`flex flex-wrap gap-1.5 p-1.5 min-h-[36px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded cursor-text ${disabled ? "opacity-50 pointer-events-none" : ""}`}
        onClick={() => {
          setIsOpen(true);
          loadEntities();
        }}
      >
        {selectedIds.map((id) => {
          const entity =
            selectedEntitiesCache[id] || entities.find((e) => e.id?.id === id);
          return (
            <span
              key={id}
              className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs dark:text-white"
              title={id}
            >
              {entity?.title || entity?.name || id.substring(0, 8)}
              <button
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 ml-1"
                onClick={(e) => removeId(id, e)}
              >
                ×
              </button>
            </span>
          );
        })}
        <input
          type="text"
          className="flex-1 min-w-[100px] bg-transparent outline-none text-sm px-1 py-0.5 dark:text-white"
          placeholder={selectedIds.length === 0 ? "Entity list" : ""}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => {
            setIsOpen(true);
            loadEntities();
          }}
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-md">
            {isLoading && (
              <div className="p-3 text-sm text-center text-slate-500 border-b border-slate-200 dark:border-slate-700 dark:text-slate-400">
                Loading...
              </div>
            )}
            {entities.length > 0 && (
              <div className="p-2 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 flex justify-between items-center">
                <span>
                  List of {entities.length}{" "}
                  {entities.length === 1 ? "entity" : "entities"}
                </span>
              </div>
            )}
            {!isLoading && filteredEntities.length === 0 && (
              <div className="p-2 text-sm text-slate-500 dark:text-slate-400 text-center">
                No entities found
              </div>
            )}
            {filteredEntities.map((entity) => {
              const id = entity.id?.id;
              const isSelected = selectedIds.includes(id);
              return (
                <div
                  key={id}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between dark:text-slate-200 ${isSelected ? "bg-slate-50 dark:bg-slate-700/50" : ""}`}
                  onClick={(e) => toggleId(id, entity, e)}
                >
                  <span>{entity.title || entity.name}</span>
                  {isSelected && <span className="text-orange-500">✓</span>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
