"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import type {
  OriginatorAttributesConfig,
  FetchTo,
} from "@/types/ruleNodeConfig";

interface TagInputProps {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}

function TagInput({ values, onChange, placeholder }: TagInputProps) {
  const [inp, setInp] = useState("");

  const add = () => {
    const v = inp.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setInp("");
  };

  const remove = (item: string) => onChange(values.filter((x) => x !== item));

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1 min-h-[32px] p-1.5 rounded-md border border-input dark:border-slate-700 bg-background dark:bg-slate-800">
        {values.map((v) => (
          <Badge
            key={v}
            variant="secondary"
            className="gap-1 text-xs cursor-default dark:bg-slate-700 dark:text-white"
          >
            {v}
            <button
              type="button"
              onClick={() => remove(v)}
              className="rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </Badge>
        ))}
        {values.length === 0 && (
          <span className="text-[10px] text-muted-foreground dark:text-slate-500 self-center ml-1">
            {placeholder || "Empty"}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          value={inp}
          onChange={(e) => setInp(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Add key and press Enter…"
          className="h-7 text-xs dark:bg-slate-800 dark:text-white dark:border-slate-700"
        />
        <button
          type="button"
          onClick={add}
          className="text-primary dark:text-blue-400 hover:opacity-80 transition-opacity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface OriginatorAttributesFormProps {
  name: string;
  description: string;
  config: OriginatorAttributesConfig;
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onConfigChange: (c: OriginatorAttributesConfig) => void;
}

export function OriginatorAttributesForm({
  name,
  description,
  config,
  onNameChange,
  onDescriptionChange,
  onConfigChange,
}: OriginatorAttributesFormProps) {
  const setFetchTo = (fetchTo: FetchTo) =>
    onConfigChange({ ...config, fetchTo });

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

      {/* Attribute key groups */}
      {[
        { label: "Client attributes", key: "clientAttributeNames" as const },
        { label: "Shared attributes", key: "sharedAttributeNames" as const },
        { label: "Server attributes", key: "serverAttributeNames" as const },
        { label: "Latest telemetry", key: "latestTsKeyNames" as const },
      ].map(({ label, key }) => (
        <div key={key} className="space-y-1.5">
          <Label className="dark:text-white text-xs">{label}</Label>
          <TagInput
            values={config[key]}
            onChange={(v) => onConfigChange({ ...config, [key]: v })}
            placeholder={`No ${label.toLowerCase()} keys`}
          />
        </div>
      ))}

      {/* Fetch to toggle */}
      <div className="space-y-1.5">
        <Label className="dark:text-white text-xs">
          Add originator attributes to
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

      {/* Flags */}
      <div className="space-y-2">
        <div className="flex items-center justify-between border rounded-md p-3 dark:border-slate-700">
          <div>
            <p className="text-xs font-medium dark:text-white">
              Tell failure if any of the attributes are missing
            </p>
            <p className="text-[10px] text-muted-foreground dark:text-slate-500">
              Route to Failure if any requested key is missing
            </p>
          </div>
          <Switch
            checked={config.tellFailureIfAbsent}
            onCheckedChange={(v) =>
              onConfigChange({ ...config, tellFailureIfAbsent: v })
            }
          />
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
