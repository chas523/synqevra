"use client";

import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Info, Loader2, Trash2, ChevronUp } from "lucide-react";
import {
    SelectAdmin as Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/admin_select";
import { ENTITY_TYPE_CONFIGS, getEntityTypeConfig, EntityExportOption } from "@/lib/config/entityTypeConfig";
import { VersionControlService } from "@/lib/services/thingsboardServices/versionControlService";

interface RestoreVersionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    versionId: string;
    versionName: string;
    onSuccess?: () => void;
}

interface EntityRestoreEntry {
    id: string; // internal list id
    entityType: string;
    options: Record<string, boolean>;
}

interface RestoreResult {
    added: number;
    modified: number;
    removed: number;
    error: string | null;
}

export function RestoreVersionModal({ open, onOpenChange, versionId, versionName, onSuccess }: RestoreVersionModalProps) {
    const [entries, setEntries] = useState<EntityRestoreEntry[]>([]);
    const [rollbackOnError, setRollbackOnError] = useState(true);

    const [isRestoring, setIsRestoring] = useState(false);
    const [isPolling, setIsPolling] = useState(false);
    const [result, setResult] = useState<RestoreResult | null>(null);

    // Initial population matches ENTITY_TYPE_CONFIGS (all entities)
    useEffect(() => {
        if (open) {
            const defaultEntries = ENTITY_TYPE_CONFIGS.map(config => {
                const options: Record<string, boolean> = {
                    removeOtherEntities: false,
                    findExistingEntityByName: true,
                    // Additional defaults from the config
                    loadAttributes: config.exportOptions.some(o => o.key === 'saveAttributes') ? true : false,
                    loadRelations: config.exportOptions.some(o => o.key === 'saveRelations') ? false : false,
                    loadCredentials: config.exportOptions.some(o => o.key === 'saveCredentials') ? true : false,
                    loadCalculatedFields: config.exportOptions.some(o => o.key === 'saveCalculatedFields') ? false : false
                };

                // Fine-tune per required payload (e.g., Dashboards loadRelations is true in payload)
                if (['ASSET', 'DEVICE', 'ENTITY_VIEW', 'DASHBOARD', 'CUSTOMER', 'DEVICE_PROFILE', 'ASSET_PROFILE', 'RULE_CHAIN', 'WIDGET_TYPE', 'WIDGETS_BUNDLE'].includes(config.value)) {
                    options.loadRelations = true;
                }

                if (['ASSET', 'DEVICE', 'DEVICE_PROFILE', 'ASSET_PROFILE'].includes(config.value)) {
                    options.loadCalculatedFields = true;
                }

                // AI models, notifications, resources don't load attributes and relations by default payload
                if (['TB_RESOURCE', 'OTA_PACKAGE', 'NOTIFICATION_TEMPLATE', 'NOTIFICATION_TARGET', 'NOTIFICATION_RULE', 'AI_MODEL'].includes(config.value)) {
                    options.loadAttributes = false;
                    options.loadRelations = false;
                }

                return {
                    id: crypto.randomUUID(),
                    entityType: config.value,
                    options
                };
            });
            setEntries(defaultEntries);
            setRollbackOnError(true);
            setResult(null);
            setIsRestoring(false);
            setIsPolling(false);
        }
    }, [open]);

    const availableEntityTypes = useMemo(() => {
        const usedTypes = entries.map(e => e.entityType);
        return ENTITY_TYPE_CONFIGS.filter(c => !usedTypes.includes(c.value));
    }, [entries]);

    const handleAddEntity = () => {
        if (availableEntityTypes.length === 0) return;
        const config = availableEntityTypes[0];

        const options: Record<string, boolean> = {
            removeOtherEntities: false,
            findExistingEntityByName: true,
            loadAttributes: true,
            loadRelations: false,
            loadCredentials: true,
            loadCalculatedFields: false
        };

        setEntries([...entries, { id: crypto.randomUUID(), entityType: config.value, options }]);
    };

    const handleRemoveEntry = (id: string) => {
        setEntries(entries.filter(e => e.id !== id));
    };

    const handleChangeEntityType = (id: string, newType: string) => {
        setEntries(entries.map(e => {
            if (e.id === id) {
                return { ...e, entityType: newType };
            }
            return e;
        }));
    };

    const handleToggleOption = (id: string, key: string) => {
        setEntries(entries.map(e => {
            if (e.id === id) {
                return {
                    ...e,
                    options: { ...e.options, [key]: !e.options[key] }
                };
            }
            return e;
        }));
    };

    const handleRestore = async () => {
        if (entries.length === 0) return;
        setIsRestoring(true);
        setResult(null);

        const entityTypesPayload: Record<string, any> = {};
        entries.forEach(entry => {
            entityTypesPayload[entry.entityType] = {
                loadAttributes: entry.options.loadAttributes ?? false,
                loadRelations: entry.options.loadRelations ?? false,
                loadCredentials: entry.options.loadCredentials ?? false,
                loadCalculatedFields: entry.options.loadCalculatedFields ?? false,
                removeOtherEntities: entry.options.removeOtherEntities ?? false,
                findExistingEntityByName: entry.options.findExistingEntityByName ?? true
            };
        });

        const payload = {
            versionId: versionId,
            entityTypes: entityTypesPayload,
            rollbackOnError,
            type: "ENTITY_TYPE"
        };

        try {
            const requestId = await VersionControlService.restoreVersion(payload);
            if (requestId) {
                setIsRestoring(false);
                setIsPolling(true);
                pollStatus(requestId);
            } else {
                setResult({ added: 0, modified: 0, removed: 0, error: "No request ID returned" });
                setIsRestoring(false);
            }
        } catch (e: any) {
            console.error(e);
            setResult({ added: 0, modified: 0, removed: 0, error: e.message || "Failed to start restoration" });
            setIsRestoring(false);
        }
    };

    const pollStatus = async (requestId: string) => {
        let isDone = false;
        while (!isDone) {
            try {
                const response = await VersionControlService.getRestoreVersionStatus(requestId);
                if (response.done) {
                    isDone = true;
                    if (response.error) {
                        setResult({
                            added: 0,
                            modified: 0,
                            removed: 0,
                            error: response.error.type || "An error occurred during restoration"
                        });
                    } else {
                        const added = response.result?.reduce((acc: number, item: any) => acc + (item.created || 0), 0) || 0;
                        const modified = response.result?.reduce((acc: number, item: any) => acc + (item.updated || 0), 0) || 0;
                        const removed = response.result?.reduce((acc: number, item: any) => acc + (item.deleted || 0), 0) || 0;
                        setResult({ added, modified, removed, error: null });
                        if (onSuccess) onSuccess();
                    }
                    setIsPolling(false);
                } else {
                    await new Promise(res => setTimeout(res, 1000));
                }
            } catch (e: any) {
                console.error(e);
                setResult({ added: 0, modified: 0, removed: 0, error: "Failed to poll status" });
                isDone = true;
                setIsPolling(false);
            }
        }
    };

    if (result) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[400px] p-6 text-center">
                    <DialogHeader>
                        <DialogTitle className="dark:text-white text-xl mx-auto mb-4">Restoration Result</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4 text-foreground dark:text-white">
                        <p className="font-semibold text-lg">{result.added === 0 && result.modified === 0 && result.removed === 0 && !result.error ? "No entities restored." : "Version restored successfully."}</p>
                        <p>Added: {result.added} entities</p>
                        <p>Modified: {result.modified} entities</p>
                        <p>Removed: {result.removed} entities</p>
                        {result.error && <p className="text-red-500">Error: {result.error}</p>}
                    </div>
                    <DialogFooter className="sm:justify-center">
                        <Button variant="outline" className="dark:text-white" onClick={() => onOpenChange(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={(val) => !isRestoring && !isPolling && onOpenChange(val)}>
            <DialogContent className="max-w-[90vw] md:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <DialogTitle className="text-xl dark:text-white">Restore entities from version '{versionName}'</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                    <fieldset className="border border-slate-200 dark:border-slate-800 rounded-lg p-5">
                        <legend className="text-sm font-medium text-foreground dark:text-slate-300 px-2">Entities to restore</legend>

                        <div className="space-y-4 mb-4">
                            {entries.map(entry => (
                                <EntityRestoreEntryCard
                                    key={entry.id}
                                    entry={entry}
                                    availableEntityTypes={availableEntityTypes}
                                    onChangeType={(type) => handleChangeEntityType(entry.id, type)}
                                    onToggleOption={(key) => handleToggleOption(entry.id, key)}
                                    onRemove={() => handleRemoveEntry(entry.id)}
                                    disabled={isRestoring || isPolling}
                                />
                            ))}
                        </div>

                        <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/30 p-2 rounded border border-dashed border-slate-300 dark:border-slate-700">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleAddEntity}
                                disabled={availableEntityTypes.length === 0 || isRestoring || isPolling}
                                className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
                            >
                                Add entity type
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setEntries([])}
                                disabled={entries.length === 0 || isRestoring || isPolling}
                                className="bg-[#2a456c] hover:bg-[#1a355c] text-white border-0"
                            >
                                Remove all
                            </Button>
                        </div>
                    </fieldset>

                    <div className="flex items-center gap-2 px-1">
                        <Switch
                            checked={rollbackOnError}
                            onCheckedChange={setRollbackOnError}
                            disabled={isRestoring || isPolling}
                            className="data-[state=checked]:bg-orange-500"
                        />
                        <span className="text-sm font-medium dark:text-slate-200">Rollback on error</span>
                        <Info className="w-4 h-4 text-slate-400" />
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 sm:justify-end">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isRestoring || isPolling} className="dark:text-white">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleRestore}
                        disabled={isRestoring || isPolling || entries.length === 0}
                        className="bg-[#2a456c] hover:bg-[#1a355c] text-white"
                    >
                        {(isRestoring || isPolling) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {isPolling ? "Restoring..." : "Restore"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function EntityRestoreEntryCard({
    entry,
    availableEntityTypes,
    onChangeType,
    onToggleOption,
    onRemove,
    disabled
}: {
    entry: EntityRestoreEntry;
    availableEntityTypes: typeof ENTITY_TYPE_CONFIGS;
    onChangeType: (type: string) => void;
    onToggleOption: (key: string) => void;
    onRemove: () => void;
    disabled: boolean;
}) {
    const entityConfig = getEntityTypeConfig(entry.entityType);

    const selectableTypes = useMemo(() => {
        const current = ENTITY_TYPE_CONFIGS.find((c) => c.value === entry.entityType);
        const others = availableEntityTypes;
        if (current) return [current, ...others];
        return others;
    }, [entry.entityType, availableEntityTypes]);

    const restoreOptions = [
        { key: "removeOtherEntities", label: "Remove other entities" },
        { key: "findExistingEntityByName", label: "Find existing entity by name" },
        { key: "loadAttributes", label: "Load attributes" },
        { key: "loadRelations", label: "Load relations" },
        { key: "loadCredentials", label: "Load credentials" },
        { key: "loadCalculatedFields", label: "Load calculated fields" }
    ];

    return (
        <div className="border border-slate-200 dark:border-slate-800 rounded shadow-sm bg-white dark:bg-slate-900 pb-4">
            <div className="flex justify-between items-center p-3 border-b border-slate-100 dark:border-slate-800/50">
                <span className="font-semibold text-sm dark:text-white">{entityConfig?.pluralLabel || entry.entityType}</span>
                <div className="flex gap-1 items-center">
                    <button type="button" onClick={onRemove} disabled={disabled} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 disabled:opacity-50">
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronUp className="w-4 h-4 text-slate-400 ml-1" />
                </div>
            </div>

            <div className="p-4 flex flex-col md:flex-row gap-6">
                <div className="w-[240px] space-y-1.5 flex-shrink-0">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Type*</label>
                    <Select value={entry.entityType} onValueChange={onChangeType} disabled={disabled}>
                        <SelectTrigger className="h-9 bg-slate-50 dark:bg-slate-800/50 dark:text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {selectableTypes.map(t => (
                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {restoreOptions.map((opt) => {
                        const isChecked = entry.options[opt.key] ?? false;
                        return (
                            <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => onToggleOption(opt.key)}
                                        disabled={disabled}
                                        className="sr-only peer"
                                    />
                                    <div className={`w-4 h-4 border-2 ${isChecked ? 'border-orange-500 dark:border-orange-400 bg-orange-500 dark:bg-orange-400' : 'border-slate-300 dark:border-slate-600'} rounded-sm flex items-center justify-center transition-colors ${disabled ? 'opacity-50' : ''}`}>
                                        {isChecked && (
                                            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                                                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <span className={`text-sm text-foreground dark:text-white select-none ${disabled ? 'opacity-50' : ''}`}>{opt.label}</span>
                            </label>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
