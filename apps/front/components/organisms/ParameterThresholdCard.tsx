"use client";

import { useState } from "react";
import { Thermometer, Heart, Wind, Droplets, Plus, X } from "lucide-react";
import type {
  MedicalParameter,
  ThresholdOption,
} from "@/types/deviceParameterTypes";

type ParameterThresholdCardProps = {
  parameter: MedicalParameter;
  currentValues?: Record<string, number | string | string[]>;
  thresholdOptions: ThresholdOption[];
  onAddAction: (thresholdType: string, value: string) => void;
  onRemoveAction: (thresholdType: string) => void;
  onRemoveAllAction: () => void;
};

const getParameterIcon = (key: string) => {
  switch (key) {
    case "temperature":
      return <Thermometer className="w-5 h-5" />;
    case "heart_rate":
      return <Heart className="w-5 h-5" />;
    case "oxygen_saturation":
      return <Droplets className="w-5 h-5" />;
    case "respiratory_rate":
      return <Wind className="w-5 h-5" />;
    default:
      return <Thermometer className="w-5 h-5" />;
  }
};

export function ParameterThresholdCard({
  parameter,
  currentValues = {},
  thresholdOptions,
  onAddAction,
  onRemoveAction,
  onRemoveAllAction,
}: ParameterThresholdCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (selectedType && inputValue) {
      onAddAction(selectedType, inputValue);
      setSelectedType("");
      setInputValue("");
      setIsAdding(false);
    }
  };

  const hasValues = Object.keys(currentValues).length > 0;

  return (
    <div className="relative group">
      <div className="absolute inset-0 rounded-xl bg-primary/5 blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative rounded-xl border border-border bg-card p-6 shadow-sm transition-colors duration-300 hover:border-primary/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-border bg-accent/60 p-2 text-primary">
              {getParameterIcon(parameter.key)}
            </div>
            <div>
              <h3 className="font-medium text-foreground">{parameter.label}</h3>
              {parameter.unit && (
                <p className="text-sm text-muted-foreground">
                  Unit: {parameter.unit}
                </p>
              )}
            </div>
          </div>

          {hasValues && (
            <button
              onClick={onRemoveAllAction}
              className="cursor-pointer text-nowrap text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Current Values */}
        {hasValues ? (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {Object.entries(currentValues).map(([type, value]) => (
              <div
                key={type}
                className="relative rounded-lg border border-border bg-muted/40 p-3"
              >
                <button
                  onClick={() => onRemoveAction(type)}
                  className="cursor-pointer absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="mb-1 text-xs uppercase tracking-wide text-primary">
                  {thresholdOptions.find((opt) => opt.value === type)?.label ||
                    type}
                </div>
                <div className="font-medium text-foreground">
                  {String(value)} {parameter.unit}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-4 rounded-lg border border-dashed border-border bg-muted/30 p-4">
            <p className="text-center text-sm text-muted-foreground">
              No thresholds configured. Click below to add.
            </p>
          </div>
        )}

        {/* Add New Threshold */}
        {isAdding ? (
          <div className="space-y-3 rounded-lg border border-primary/20 bg-muted/30 p-4">
            <div className="grid grid-cols-2 gap-3">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
                autoFocus
              >
                <option value="">Select type...</option>
                {thresholdOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <input
                type="number"
                step="0.1"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Value..."
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={handleAdd}
                disabled={!selectedType || !inputValue}
                className="flex-1 text-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add Threshold
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setSelectedType("");
                  setInputValue("");
                }}
                className="rounded-lg border border-border bg-muted/50 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted hover:border-primary/30"
          >
            <Plus className="w-4 h-4" />
            Add Threshold
          </button>
        )}
      </div>
    </div>
  );
}
