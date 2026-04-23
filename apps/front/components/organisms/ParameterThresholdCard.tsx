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
      <div className="absolute inset-0 bg-linear-to-br from-cyan-500/10 to-blue-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 hover:border-cyan-500/30 transition-all duration-300 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-linear-to-br from-cyan-100 to-blue-100 dark:from-cyan-500/20 dark:to-blue-500/20 rounded-lg border border-cyan-200 dark:border-cyan-500/30">
              {getParameterIcon(parameter.key)}
            </div>
            <div>
              <h3 className="text-slate-900 dark:text-white font-medium">
                {parameter.label}
              </h3>
              {parameter.unit && (
                <p className="text-slate-500 dark:text-slate-400 text-sm">
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
                className="relative bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-3"
              >
                <button
                  onClick={() => onRemoveAction(type)}
                  className="cursor-pointer absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="text-xs text-cyan-600 dark:text-cyan-400 uppercase tracking-wide mb-1">
                  {thresholdOptions.find((opt) => opt.value === type)?.label ||
                    type}
                </div>
                <div className="text-slate-900 dark:text-white font-medium">
                  {String(value)} {parameter.unit}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-100 dark:bg-slate-800/30 border border-dashed border-slate-300 dark:border-slate-700/50 rounded-lg p-4 mb-4">
            <p className="text-slate-500 dark:text-slate-400 text-sm text-center">
              No thresholds configured. Click below to add.
            </p>
          </div>
        )}

        {/* Add New Threshold */}
        {isAdding ? (
          <div className="bg-slate-100 dark:bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:border-cyan-500 focus:outline-none"
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
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={handleAdd}
                disabled={!selectedType || !inputValue}
                className="flex-1 text-nowrap bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-slate-400 disabled:to-slate-400 dark:disabled:from-slate-700 dark:disabled:to-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:cursor-not-allowed"
              >
                Add Threshold
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setSelectedType("");
                  setInputValue("");
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 hover:border-cyan-500/50 text-slate-600 hover:text-cyan-600 dark:text-slate-300 dark:hover:text-cyan-400 px-4 py-2 rounded-lg text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Threshold
          </button>
        )}
      </div>
    </div>
  );
}
