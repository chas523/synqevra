"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SelectAdmin,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/admin_select";
import { EntityViewService } from "@/lib/services/thingsboardServices/entityViewService";
import type { CreateEntityViewRequest } from "@/types/thingsboardEntityViewTypes";

interface AddEntityViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateEntityViewRequest) => Promise<void>;
}

interface StringMultiSelectInputProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  disabled?: boolean;
}

function StringMultiSelectInput({
  label,
  values,
  onChange,
  placeholder,
  disabled = false,
}: StringMultiSelectInputProps) {
  const [searchTerm, setSearchTerm] = useState("");

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
      <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-10.5 bg-background">
        {values.map((value) => (
          <Badge key={value} variant="secondary" className="gap-1 pr-1">
            {value}
            <button
              type="button"
              onClick={() => handleRemoveValue(value)}
              className="hover:bg-muted rounded-full p-0.5"
              disabled={disabled}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove</span>
            </button>
          </Badge>
        ))}
        <input
          className="flex-1 bg-transparent outline-none min-w-30 text-sm"
          placeholder={values.length === 0 ? placeholder : ""}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              handleAddValue(searchTerm);
            }
          }}
          onBlur={() => handleAddValue(searchTerm)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export function AddEntityViewDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddEntityViewDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [entityType, setEntityType] = useState<"DEVICE" | "ASSET">("DEVICE");
  const [entityId, setEntityId] = useState("");
  const [description, setDescription] = useState("");
  const [typeOptions, setTypeOptions] = useState<string[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [sourceOptions, setSourceOptions] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [isLoadingSourceOptions, setIsLoadingSourceOptions] = useState(false);
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [clientAttributes, setClientAttributes] = useState<string[]>([]);
  const [sharedAttributes, setSharedAttributes] = useState<string[]>([]);
  const [serverAttributes, setServerAttributes] = useState<string[]>([]);
  const [timeSeries, setTimeSeries] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const entityLabel = entityType === "ASSET" ? "Asset" : "Device";

  const filteredTypeOptions = useMemo(() => {
    const query = type.trim().toLowerCase();
    if (!query) return typeOptions;
    return typeOptions.filter((option) => option.toLowerCase().includes(query));
  }, [type, typeOptions]);

  const toMs = (value: string) => {
    if (!value) return undefined;
    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? undefined : timestamp;
  };

  useEffect(() => {
    if (!open) return;

    const loadTypeOptions = async () => {
      setIsLoadingTypes(true);
      try {
        const response = await EntityViewService.fetchEntityViewTypes();
        const mappedTypes = Array.from(
          new Set(
            response
              .map((item) => item?.type?.trim())
              .filter((value): value is string => Boolean(value)),
          ),
        );

        setTypeOptions(mappedTypes);
      } catch {
        setTypeOptions([]);
      } finally {
        setIsLoadingTypes(false);
      }
    };

    loadTypeOptions();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const loadSourceOptions = async () => {
      setIsLoadingSourceOptions(true);
      setEntityId("");

      try {
        const response =
          await EntityViewService.fetchEntityViewSourceOptions(entityType);

        const mapped = response.filter(
          (item) => item.id.trim().length > 0 && item.name.trim().length > 0,
        );

        setSourceOptions(mapped);
      } catch {
        setSourceOptions([]);
      } finally {
        setIsLoadingSourceOptions(false);
      }
    };

    loadSourceOptions();
  }, [entityType, open]);

  const canSubmit = useMemo(
    () =>
      name.trim().length > 0 &&
      type.trim().length > 0 &&
      entityId.trim().length > 0,
    [name, type, entityId],
  );

  const reset = () => {
    setName("");
    setType("");
    setEntityType("DEVICE");
    setEntityId("");
    setDescription("");
    setSourceOptions([]);
    setTypeOptions([]);
    setIsTypeMenuOpen(false);
    setShowOptionalFields(false);
    setClientAttributes([]);
    setSharedAttributes([]);
    setServerAttributes([]);
    setTimeSeries([]);
    setStartTime("");
    setEndTime("");
  };

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        type: type.trim(),
        entityType,
        entityId: entityId.trim(),
        description: description.trim() || undefined,
        clientAttributes,
        sharedAttributes,
        serverAttributes,
        timeSeries,
        startTimeMs: toMs(startTime),
        endTimeMs: toMs(endTime),
      });
      reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (!isSubmitting ? onOpenChange(next) : null)}
    >
      <DialogContent className="sm:max-w-140 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add entity view</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="entity-view-name">Name*</Label>
            <Input
              id="entity-view-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Room sensors view"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="entity-view-type">Entity view type*</Label>
            <div className="relative">
              <Input
                id="entity-view-type"
                value={type}
                onChange={(event) => {
                  setType(event.target.value);
                  setIsTypeMenuOpen(true);
                }}
                onFocus={() => setIsTypeMenuOpen(true)}
                onBlur={() => {
                  setTimeout(() => setIsTypeMenuOpen(false), 120);
                }}
                placeholder="Select or type your own"
                disabled={isSubmitting || isLoadingTypes}
              />
              {isTypeMenuOpen && filteredTypeOptions.length > 0 && (
                <div className="mt-1 w-full max-h-44 overflow-y-auto rounded-md border border-border dark:border-slate-700 bg-background dark:bg-slate-900 shadow-sm">
                  {filteredTypeOptions.map((typeOption) => (
                    <button
                      key={typeOption}
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        setType(typeOption);
                        setIsTypeMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      {typeOption}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Entity Type*</Label>
            <SelectAdmin
              value={entityType}
              onValueChange={(value) =>
                setEntityType(value as "DEVICE" | "ASSET")
              }
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select entity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DEVICE">Device</SelectItem>
                <SelectItem value="ASSET">Asset</SelectItem>
              </SelectContent>
            </SelectAdmin>
          </div>

          <div className="space-y-1.5">
            <Label>{entityLabel}*</Label>
            <SelectAdmin
              value={entityId}
              onValueChange={(value) => setEntityId(value)}
              disabled={isSubmitting || isLoadingSourceOptions}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    isLoadingSourceOptions
                      ? `Loading ${entityLabel.toLowerCase()}s...`
                      : `Select ${entityLabel.toLowerCase()}`
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {sourceOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectAdmin>
          </div>

          <div className="border border-slate-200 dark:border-slate-700 rounded-md">
            <button
              type="button"
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
              onClick={() => setShowOptionalFields((prev) => !prev)}
              disabled={isSubmitting}
            >
              <span>Optional fields</span>
              {showOptionalFields ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {showOptionalFields && (
              <div className="px-3 pb-3 space-y-4 border-t border-slate-200 dark:border-slate-700">
                <div className="space-y-2 pt-3">
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Attributes propagation
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Entity View will automatically copy specified attributes
                    from Target Entity each time you save or update this entity
                    view. For performance reasons target entity attributes are
                    not propagated to entity view on each attribute change. You
                    can enable automatic propagation by configuring "copy to
                    view" rule node in your rule chain and linking "Post
                    attributes" and "Attributes Updated" messages to the new
                    rule node.
                  </p>
                  <StringMultiSelectInput
                    label="Client attributes"
                    values={clientAttributes}
                    onChange={setClientAttributes}
                    placeholder="Add client attributes..."
                    disabled={isSubmitting}
                  />
                  <StringMultiSelectInput
                    label="Shared attributes"
                    values={sharedAttributes}
                    onChange={setSharedAttributes}
                    placeholder="Add shared attributes..."
                    disabled={isSubmitting}
                  />
                  <StringMultiSelectInput
                    label="Server attributes"
                    values={serverAttributes}
                    onChange={setServerAttributes}
                    placeholder="Add server attributes..."
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Time series data
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Configure time series data keys of the target entity that
                    will be accessible to the entity view. This time series data
                    is read-only.
                  </p>
                  <StringMultiSelectInput
                    label="Time series"
                    values={timeSeries}
                    onChange={setTimeSeries}
                    placeholder="Add time series keys..."
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="entity-view-description">Description</Label>
            <Input
              id="entity-view-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="entity-view-start-time">Start time</Label>
              <Input
                id="entity-view-start-time"
                type="datetime-local"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entity-view-end-time">End time</Label>
              <Input
                id="entity-view-end-time"
                type="datetime-local"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
