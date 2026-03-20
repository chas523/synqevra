"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus } from "lucide-react";
import {
  SelectAdmin as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/admin_select";
import type {
  OriginatorFieldsConfig,
  OriginatorField,
  FetchTo,
} from "@/types/ruleNodeConfig";

const ORIGINATOR_FIELDS: { value: OriginatorField | "type"; label: string }[] =
  [
    { value: "createdTime", label: "Created time" },
    { value: "name", label: "Name" },
    { value: "profileName", label: "Profile name" },
    { value: "firstName", label: "First name" },
    { value: "lastName", label: "Last name" },
    { value: "email", label: "Email" },
    { value: "title", label: "Title" },
    { value: "country", label: "Country" },
    { value: "state", label: "State" },
    { value: "city", label: "City" },
    { value: "address", label: "Address" },
    { value: "address2", label: "Address 2" },
    { value: "zip", label: "Zip" },
    { value: "phone", label: "Phone" },
    { value: "label", label: "Label" },
    { value: "id", label: "Id" },
    { value: "additionalInfo", label: "Additional Info" },
    { value: "type", label: "Type" },
  ];

interface OriginatorFieldsFormProps {
  name: string;
  description: string;
  config: OriginatorFieldsConfig;
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onConfigChange: (c: OriginatorFieldsConfig) => void;
}

const DEFAULT_TARGET_KEYS: Record<string, string> = {
  id: "originatorId",
  name: "originatorName",
  profileName: "originatorProfileName",
  type: "originatorType",
  firstName: "originatorFirstName",
  lastName: "originatorLastName",
  email: "originatorEmail",
  title: "originatorTitle",
  country: "originatorCountry",
  state: "originatorState",
  city: "originatorCity",
  address: "originatorAddress",
  address2: "originatorAddress2",
  zip: "originatorZip",
  phone: "originatorPhone",
  label: "originatorLabel",
  createdTime: "originatorCreatedTime",
  additionalInfo: "originatorAdditionalInfo",
};

export function OriginatorFieldsForm({
  name,
  description,
  config,
  onNameChange,
  onDescriptionChange,
  onConfigChange,
}: OriginatorFieldsFormProps) {
  // Use local state to handle empty rows (which can't exist in the final TB Record)
  const [localEntries, setLocalEntries] = useState<[string, string][]>(() =>
    Object.entries(config.dataMapping ?? {}),
  );

  const syncToParent = (entries: [string, string][]) => {
    const map: Record<string, string> = {};
    entries.forEach(([k, v]) => {
      if (k) map[k] = v;
    });
    onConfigChange({ ...config, dataMapping: map });
  };

  const addRow = () => {
    const next: [string, string][] = [...localEntries, ["", ""]];
    setLocalEntries(next);
    // Don't sync yet as it's empty
  };

  const removeRow = (idx: number) => {
    const next = localEntries.filter((_, i) => i !== idx);
    setLocalEntries(next);
    syncToParent(next);
  };

  const updateRow = (idx: number, field: "key" | "value", val: string) => {
    const next = localEntries.map(([k, v], i) => {
      if (i === idx) {
        if (field === "key") {
          const newTargetKey = v === "" ? DEFAULT_TARGET_KEYS[val] || "" : v;
          return [val, newTargetKey];
        }
        return [k, val];
      }
      return [k, v];
    }) as [string, string][];

    setLocalEntries(next);
    syncToParent(next);
  };

  const setFetchTo = (fetchTo: FetchTo) => {
    onConfigChange({ ...config, fetchTo });
  };

  return (
    <div className="space-y-5">
      {/* Name */}
      <div className="space-y-1.5">
        <Label className="dark:text-white text-xs">
          Name<span className="text-red-500 ml-0.5">*</span>
        </Label>
        <Input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Name"
          className="dark:bg-slate-800 dark:text-white dark:border-slate-700"
        />
      </div>

      {/* Originator fields mapping */}
      <div className="space-y-2 border rounded-md p-3 dark:border-slate-700 dark:bg-slate-800/30">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold dark:text-white">
            Originator fields mapping
          </p>
          {localEntries.some(([k, v]) => !k || !v) && (
            <p className="text-[10px] text-red-500 font-medium animate-pulse">
              All mapping fields are required.
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground dark:text-slate-400 pb-1 border-b dark:border-slate-700">
          <span>Source field</span>
          <span>Target key</span>
        </div>
        {localEntries.map(([k, v], idx) => (
          <div
            key={idx}
            className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center"
          >
            <Select
              value={k}
              onValueChange={(val) => updateRow(idx, "key", val)}
            >
              <SelectTrigger className="h-8 text-xs dark:bg-slate-800 dark:text-white dark:border-slate-700">
                <SelectValue placeholder="Source field" />
              </SelectTrigger>
              <SelectContent>
                {ORIGINATOR_FIELDS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={v}
              onChange={(e) => updateRow(idx, "value", e.target.value)}
              placeholder="Target key"
              className="h-8 text-xs dark:bg-slate-800 dark:text-white dark:border-slate-700"
            />
            <button
              type="button"
              onClick={() => removeRow(idx)}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-1 dark:border-slate-600 dark:text-white dark:hover:bg-slate-700 h-7 text-xs gap-1"
          onClick={addRow}
        >
          <Plus className="h-3.5 w-3.5" />
          Add mapping
        </Button>
        <p className="text-[10px] text-muted-foreground dark:text-slate-500 mt-1">
          Target key fields support templatization. Use{" "}
          <code className="bg-muted dark:bg-slate-700 px-0.5 rounded text-[10px]">
            $&#123;messageKey&#125;
          </code>{" "}
          or{" "}
          <code className="bg-muted dark:bg-slate-700 px-0.5 rounded text-[10px]">
            $&#123;metadataKey&#125;
          </code>
          .
        </p>
      </div>

      {/* Add mapped originator fields to */}
      <div className="space-y-1.5">
        <Label className="dark:text-white text-xs">
          Add mapped originator fields to
        </Label>
        <div className="flex gap-2 mt-1">
          {(["DATA", "METADATA"] as FetchTo[]).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setFetchTo(opt)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                config.fetchTo === opt
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-input dark:border-slate-600 hover:bg-muted dark:hover:bg-slate-700 dark:text-slate-300"
              }`}
            >
              {opt === "DATA" ? "Message" : "Metadata"}
            </button>
          ))}
        </div>
      </div>

      {/* Skip empty fields */}
      <div className="flex items-center justify-between border rounded-md p-3 dark:border-slate-700">
        <div>
          <p className="text-xs font-medium dark:text-white">
            Skip empty fields
          </p>
          <p className="text-[10px] text-muted-foreground dark:text-slate-500">
            Ignore null or empty string field values
          </p>
        </div>
        <Switch
          checked={config.ignoreNullStrings}
          onCheckedChange={(v) =>
            onConfigChange({ ...config, ignoreNullStrings: v })
          }
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label className="dark:text-white text-xs">Rule node description</Label>
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Rule node description"
          className="dark:bg-slate-800 dark:text-white dark:border-slate-700 min-h-[80px] resize-none"
        />
      </div>
    </div>
  );
}
