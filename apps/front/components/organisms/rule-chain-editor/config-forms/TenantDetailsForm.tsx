"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type {
  TenantDetailsConfig,
  TenantDetailField,
  FetchTo,
} from "@/types/ruleNodeConfig";

const ALL_DETAILS: TenantDetailField[] = [
  "ID",
  "TITLE",
  "COUNTRY",
  "STATE",
  "CITY",
  "ZIP",
  "ADDRESS",
  "ADDRESS2",
  "PHONE",
  "EMAIL",
  "ADDITIONAL_INFO",
];

const DETAIL_LABELS: Record<TenantDetailField, string> = {
  ID: "Id",
  TITLE: "Title",
  COUNTRY: "Country",
  CITY: "City",
  STATE: "State",
  ZIP: "Zip",
  ADDRESS: "Address",
  ADDRESS2: "Address2",
  PHONE: "Phone",
  EMAIL: "Email",
  ADDITIONAL_INFO: "Additional Info",
};

interface TenantDetailsFormProps {
  name: string;
  description: string;
  config: TenantDetailsConfig;
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onConfigChange: (c: TenantDetailsConfig) => void;
}

export function TenantDetailsForm({
  name,
  description,
  config,
  onNameChange,
  onDescriptionChange,
  onConfigChange,
}: TenantDetailsFormProps) {
  const [inputValue, setInputValue] = useState("");

  const toggleDetail = (field: TenantDetailField) => {
    const next = config.detailsList.includes(field)
      ? config.detailsList.filter((d) => d !== field)
      : [...config.detailsList, field];
    onConfigChange({ ...config, detailsList: next });
  };

  const removeDetail = (field: TenantDetailField) => {
    onConfigChange({
      ...config,
      detailsList: config.detailsList.filter((d) => d !== field),
    });
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

      {/* Select details (multi-chip) */}
      <div className="space-y-2">
        <Label className="dark:text-white text-xs">
          Select details<span className="text-red-500 ml-0.5">*</span>
        </Label>
        {/* Chosen chips */}
        <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-md border border-input dark:border-slate-700 bg-background dark:bg-slate-800">
          {config.detailsList.map((d) => (
            <Badge
              key={d}
              variant="secondary"
              className="gap-1 cursor-default dark:bg-slate-700 dark:text-white"
            >
              {DETAIL_LABELS[d]}
              <button
                type="button"
                onClick={() => removeDetail(d)}
                className="rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
          {config.detailsList.length === 0 && (
            <span className="text-xs text-muted-foreground dark:text-slate-500 self-center">
              No details selected
            </span>
          )}
        </div>
        {/* Dropdown to add */}
        <div className="flex flex-wrap gap-1 mt-1">
          {ALL_DETAILS.filter((d) => !config.detailsList.includes(d)).map(
            (d) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDetail(d)}
                className="text-xs px-2 py-1 rounded border border-dashed border-slate-300 dark:border-slate-600 hover:bg-muted dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
              >
                {DETAIL_LABELS[d]}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Add selected details to: Message / Metadata toggle */}
      <div className="space-y-1.5">
        <Label className="dark:text-white text-xs">
          Add selected details to
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
