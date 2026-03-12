"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { DetailPanelSection } from "@/components/molecules/DetailPanelSection";
import { CopyButton } from "@/components/molecules/CopyButton";
import {
  AssetService,
  type AssetDetails,
} from "@/lib/services/thingsboardServices/assetService";
import { DeviceService } from "@/lib/services/thingsboardServices/deviceService";
import { EntityViewService } from "@/lib/services/thingsboardServices/entityViewService";
import type { DeviceDetails } from "@/types/thingsboardDeviceTypes";
import type { EntityView } from "@/types/thingsboardEntityViewTypes";

interface EntityViewDetailsTabContentProps {
  entityViewId: string;
}

interface EntityViewDetailsFormState {
  name: string;
  type: string;
  description: string;
  startTimeMs: number;
  endTimeMs: number;
  clientAttributes: string[];
  sharedAttributes: string[];
  serverAttributes: string[];
  timeseries: string[];
}

interface AttributePropagationKeys {
  client: string[];
  shared: string[];
  server: string[];
}

interface StringMultiSelectInputProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  suggestions?: string[];
  disabled?: boolean;
}

function toFormState(entityView: EntityView): EntityViewDetailsFormState {
  const attributePropagation = getAttributePropagationKeys(entityView);

  return {
    name: entityView.name || "",
    type: entityView.type || "",
    description: entityView.additionalInfo?.description || "",
    startTimeMs: entityView.startTimeMs ?? 0,
    endTimeMs: entityView.endTimeMs ?? 0,
    clientAttributes: attributePropagation.client,
    sharedAttributes: attributePropagation.shared,
    serverAttributes: attributePropagation.server,
    timeseries: getTimeseriesKeys(entityView),
  };
}

function StringMultiSelectInput({
  label,
  values,
  onChange,
  placeholder,
  suggestions = [],
  disabled = false,
}: StringMultiSelectInputProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const filteredSuggestions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return suggestions.filter((suggestion) => {
      const isSelected = values.some(
        (item) => item.toLowerCase() === suggestion.toLowerCase(),
      );
      if (isSelected) return false;
      if (!query) return true;
      return suggestion.toLowerCase().includes(query);
    });
  }, [searchTerm, suggestions, values]);

  const handleAddValue = (rawValue: string) => {
    const nextValue = rawValue.trim();
    if (!nextValue) return;
    if (values.some((item) => item.toLowerCase() === nextValue.toLowerCase())) {
      setSearchTerm("");
      return;
    }
    onChange([...values, nextValue]);
    setSearchTerm("");
  };

  const handleRemoveValue = (value: string) => {
    onChange(values.filter((item) => item !== value));
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <div className="flex min-h-10.5 flex-wrap gap-2 rounded-md border bg-background p-2">
          {values.map((value) => (
            <Badge key={value} variant="secondary" className="gap-1 pr-1">
              {value}
              <button
                type="button"
                onClick={() => handleRemoveValue(value)}
                className="rounded-full p-0.5 hover:bg-muted"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </button>
            </Badge>
          ))}
          <input
            className="min-w-30 flex-1 bg-transparent text-sm outline-none"
            placeholder={values.length === 0 ? placeholder : ""}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === ",") {
                event.preventDefault();
                handleAddValue(searchTerm);
              }
            }}
            onBlur={() => {
              handleAddValue(searchTerm);
              window.setTimeout(() => setIsFocused(false), 100);
            }}
            disabled={disabled}
          />
        </div>

        {isFocused && filteredSuggestions.length > 0 && (
          <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-popover shadow-md">
            {filteredSuggestions.slice(0, 20).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="block w-full px-3 py-2 text-left text-sm hover:bg-accent"
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleAddValue(suggestion);
                  setIsFocused(false);
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDateTime(value?: number | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function toDateTimeLocalInput(value?: number | null): string {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function fromDateTimeLocalInput(value: string): number {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string") {
    return [value];
  }

  return [];
}

function getAttributePropagationKeys(
  entityView: EntityView,
): AttributePropagationKeys {
  const attributes = entityView.keys?.attributes;

  if (
    !attributes ||
    typeof attributes !== "object" ||
    Array.isArray(attributes)
  ) {
    return {
      client: [],
      shared: [],
      server: [],
    };
  }

  return {
    client: toStringArray(attributes.cs),
    shared: toStringArray(attributes.sh),
    server: toStringArray(attributes.ss),
  };
}

function getTimeseriesKeys(entityView: EntityView): string[] {
  const timeseries = entityView.keys?.timeseries;

  if (Array.isArray(timeseries)) {
    return toStringArray(timeseries);
  }

  if (timeseries && typeof timeseries === "object") {
    return Object.keys(timeseries);
  }

  return [];
}

function renderKeyList(keys: string[]) {
  if (keys.length === 0) {
    return <div className="text-sm text-slate-500">-</div>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {keys.map((key) => (
        <span
          key={key}
          className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
        >
          {key}
        </span>
      ))}
    </div>
  );
}

export function EntityViewDetailsTabContent({
  entityViewId,
}: EntityViewDetailsTabContentProps) {
  const {
    data: entityView,
    isLoading,
    mutate,
  } = useSWR(
    entityViewId ? ["entityViewDetails", entityViewId] : null,
    async () => EntityViewService.fetchEntityView(entityViewId),
  );

  const { data: sourceEntityName } = useSWR(
    entityView?.entityId?.id && entityView?.entityId?.entityType
      ? [
          "entityViewSourceName",
          entityView.entityId.entityType,
          entityView.entityId.id,
        ]
      : null,
    async () => {
      if (!entityView?.entityId?.id || !entityView?.entityId?.entityType) {
        return "-";
      }

      if (entityView.entityId.entityType === "DEVICE") {
        const device: DeviceDetails = await DeviceService.fetchDevice(
          entityView.entityId.id,
        );
        return device.name || device.label || entityView.entityId.id;
      }

      if (entityView.entityId.entityType === "ASSET") {
        const asset: AssetDetails = await AssetService.fetchAsset(
          entityView.entityId.id,
        );
        return asset.name || asset.label || entityView.entityId.id;
      }

      return entityView.entityId.id;
    },
  );

  const { data: attributeKeySuggestions = [] } = useSWR(
    entityView?.entityId?.id && entityView?.entityId?.entityType
      ? [
          "entityViewAttributeKeys",
          entityView.entityId.entityType,
          entityView.entityId.id,
        ]
      : null,
    async () => {
      if (!entityView?.entityId?.id || !entityView?.entityId?.entityType) {
        return [];
      }

      if (entityView.entityId.entityType === "DEVICE") {
        return DeviceService.fetchDeviceAttributeKeys(entityView.entityId.id);
      }

      if (entityView.entityId.entityType === "ASSET") {
        return AssetService.fetchAssetAttributeKeys(entityView.entityId.id);
      }

      return [];
    },
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<EntityViewDetailsFormState | null>(null);
  const [originalForm, setOriginalForm] =
    useState<EntityViewDetailsFormState | null>(null);

  useEffect(() => {
    if (!entityView) return;
    const nextForm = toFormState(entityView);
    setForm(nextForm);
    setOriginalForm(nextForm);
    setIsEditing(false);
  }, [entityView]);

  const hasChanges = useMemo(() => {
    if (!form || !originalForm) return false;
    return JSON.stringify(form) !== JSON.stringify(originalForm);
  }, [form, originalForm]);

  const attributePropagation = useMemo(() => {
    if (form) {
      return {
        client: form.clientAttributes,
        shared: form.sharedAttributes,
        server: form.serverAttributes,
      };
    }

    return {
      client: [],
      shared: [],
      server: [],
    };
  }, [form]);

  const timeseriesKeys = useMemo(() => form?.timeseries ?? [], [form]);

  const handleCancel = () => {
    if (!originalForm) return;
    setForm(originalForm);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!entityView || !form) return;

    if (!form.name.trim()) {
      toast.error("Entity view name is required");
      return;
    }

    if (!form.type.trim()) {
      toast.error("Entity view type is required");
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<EntityView> = {
        ...entityView,
        name: form.name.trim(),
        type: form.type.trim(),
        startTimeMs: form.startTimeMs,
        endTimeMs: form.endTimeMs,
        keys: {
          attributes: {
            cs: form.clientAttributes,
            sh: form.sharedAttributes,
            ss: form.serverAttributes,
          },
          timeseries: form.timeseries,
        },
        additionalInfo: {
          ...(entityView.additionalInfo || {}),
          description: form.description.trim(),
        },
      };

      const saved = await EntityViewService.updateEntityView(
        entityViewId,
        payload,
      );
      const nextForm = toFormState(saved);
      await mutate(saved, false);
      setForm(nextForm);
      setOriginalForm(nextForm);
      setIsEditing(false);
      toast.success("Entity view details updated successfully");
    } catch {
      toast.error("Failed to update entity view details");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!entityView) {
    return (
      <div className="p-4 text-center text-slate-500">
        Entity view details not found.
      </div>
    );
  }

  if (!form) {
    return (
      <div className="p-4 text-center text-slate-500">
        Preparing entity view details...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2">
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
          >
            Edit
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-md bg-cyan-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-60"
              disabled={isSaving || !hasChanges}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="border-b pb-2 text-sm font-semibold text-slate-900">
            General Info
          </h3>

          <div className="space-y-1">
            <label className="ml-1 text-xs font-medium text-slate-500">
              Name
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-white/10 dark:bg-white/5">
                {isEditing ? (
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      setForm((prev) =>
                        prev ? { ...prev, name: event.target.value } : prev,
                      )
                    }
                    className="w-full bg-transparent outline-none"
                  />
                ) : (
                  entityView.name
                )}
              </div>
              <CopyButton value={entityView.name} size="icon" variant="ghost" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="ml-1 text-xs font-medium text-slate-500">
              Entity View Type
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                {entityView.type || "-"}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="ml-1 text-xs font-medium text-slate-500">
              Entity View ID
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-mono text-sm text-slate-600 dark:border-white/10 dark:bg-white/5">
                {entityView.id?.id || "-"}
              </div>
              <CopyButton
                value={entityView.id?.id ?? ""}
                size="icon"
                variant="ghost"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="ml-1 text-xs font-medium text-slate-500">
              Description
            </label>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-white/10 dark:bg-white/5">
              {isEditing ? (
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) =>
                      prev
                        ? { ...prev, description: event.target.value }
                        : prev,
                    )
                  }
                  rows={3}
                  placeholder="Optional description"
                  className="w-full resize-none bg-transparent outline-none"
                />
              ) : (
                entityView.additionalInfo?.description || "-"
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="border-b pb-2 text-sm font-semibold text-slate-900">
            Source & Time Range
          </h3>

          <div className="space-y-1">
            <label className="ml-1 text-xs font-medium text-slate-500">
              Source Entity Type
            </label>
            <div className="ml-1 text-sm text-slate-700">
              {entityView.entityId?.entityType || "-"}
            </div>
          </div>

          <div className="space-y-1">
            <label className="ml-1 text-xs font-medium text-slate-500">
              Source Entity Name
            </label>
            <div className="ml-1 text-sm text-slate-700">
              {sourceEntityName || entityView.entityId?.id || "-"}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="ml-1 text-xs font-medium text-slate-500">
                Start Time
              </label>
              {isEditing ? (
                <input
                  type="datetime-local"
                  value={toDateTimeLocalInput(form.startTimeMs)}
                  onChange={(event) =>
                    setForm((prev) =>
                      prev
                        ? {
                            ...prev,
                            startTimeMs: fromDateTimeLocalInput(
                              event.target.value,
                            ),
                          }
                        : prev,
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none"
                />
              ) : (
                <div className="ml-1 text-sm text-slate-700">
                  {formatDateTime(entityView.startTimeMs)}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="ml-1 text-xs font-medium text-slate-500">
                End Time
              </label>
              {isEditing ? (
                <input
                  type="datetime-local"
                  value={toDateTimeLocalInput(form.endTimeMs)}
                  onChange={(event) =>
                    setForm((prev) =>
                      prev
                        ? {
                            ...prev,
                            endTimeMs: fromDateTimeLocalInput(
                              event.target.value,
                            ),
                          }
                        : prev,
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none"
                />
              ) : (
                <div className="ml-1 text-sm text-slate-700">
                  {formatDateTime(entityView.endTimeMs)}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="ml-1 text-xs font-medium text-slate-500">
              Created At
            </label>
            <div className="ml-1 text-sm text-slate-700">
              {entityView.createdTime
                ? new Date(entityView.createdTime).toLocaleString()
                : "-"}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <DetailPanelSection
          title="Attributes propagation"
          collapsible
          defaultExpanded={false}
        >
          {isEditing ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <StringMultiSelectInput
                label="Client attributes"
                values={form.clientAttributes}
                onChange={(values) =>
                  setForm((prev) =>
                    prev ? { ...prev, clientAttributes: values } : prev,
                  )
                }
                placeholder="Add client attributes..."
                suggestions={attributeKeySuggestions}
                disabled={isSaving}
              />
              <StringMultiSelectInput
                label="Shared attributes"
                values={form.sharedAttributes}
                onChange={(values) =>
                  setForm((prev) =>
                    prev ? { ...prev, sharedAttributes: values } : prev,
                  )
                }
                placeholder="Add shared attributes..."
                suggestions={attributeKeySuggestions}
                disabled={isSaving}
              />
              <StringMultiSelectInput
                label="Server attributes"
                values={form.serverAttributes}
                onChange={(values) =>
                  setForm((prev) =>
                    prev ? { ...prev, serverAttributes: values } : prev,
                  )
                }
                placeholder="Add server attributes..."
                suggestions={attributeKeySuggestions}
                disabled={isSaving}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500">
                  Client attributes
                </label>
                {renderKeyList(attributePropagation.client)}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500">
                  Shared attributes
                </label>
                {renderKeyList(attributePropagation.shared)}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500">
                  Server attributes
                </label>
                {renderKeyList(attributePropagation.server)}
              </div>
            </div>
          )}
        </DetailPanelSection>

        <DetailPanelSection
          title="Timeseries data"
          collapsible
          defaultExpanded={false}
        >
          {isEditing ? (
            <StringMultiSelectInput
              label="Timeseries keys"
              values={form.timeseries}
              onChange={(values) =>
                setForm((prev) =>
                  prev ? { ...prev, timeseries: values } : prev,
                )
              }
              placeholder="Add time series keys..."
              disabled={isSaving}
            />
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500">
                Available keys
              </label>
              {renderKeyList(timeseriesKeys)}
            </div>
          )}
        </DetailPanelSection>
      </div>
    </div>
  );
}
