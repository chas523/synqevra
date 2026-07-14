"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export type AlarmStatus =
  | "ACTIVE"
  | "CLEARED"
  | "ACKNOWLEDGED"
  | "UNACKNOWLEDGED";
export type AlarmSeverity =
  | "CRITICAL"
  | "MAJOR"
  | "MINOR"
  | "WARNING"
  | "INDETERMINATE";

export const ALARM_STATUSES: { value: AlarmStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "CLEARED", label: "Cleared" },
  { value: "ACKNOWLEDGED", label: "Acknowledged" },
  { value: "UNACKNOWLEDGED", label: "Unacknowledged" },
];

export const ALARM_SEVERITIES: { value: AlarmSeverity; label: string }[] = [
  { value: "CRITICAL", label: "Critical" },
  { value: "MAJOR", label: "Major" },
  { value: "MINOR", label: "Minor" },
  { value: "WARNING", label: "Warning" },
  { value: "INDETERMINATE", label: "Indeterminate" },
];

interface AlarmFiltersProps {
  selectedStatuses: AlarmStatus[];
  onStatusChange: (statuses: AlarmStatus[]) => void;
  selectedSeverities: AlarmSeverity[];
  onSeverityChange: (severities: AlarmSeverity[]) => void;
}

export function AlarmFilters({
  selectedStatuses,
  onStatusChange,
  selectedSeverities,
  onSeverityChange,
}: AlarmFiltersProps) {
  const [open, setOpen] = useState(false);
  const [tempStatuses, setTempStatuses] = useState(selectedStatuses);
  const [tempSeverities, setTempSeverities] = useState(selectedSeverities);

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setTempStatuses(selectedStatuses);
      setTempSeverities(selectedSeverities);
    }
    setOpen(newOpen);
  };

  const handleApply = () => {
    onStatusChange(tempStatuses);
    onSeverityChange(tempSeverities);
    setOpen(false);
  };

  const toggleStatus = (status: AlarmStatus) => {
    setTempStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const toggleSeverity = (severity: AlarmSeverity) => {
    setTempSeverities((prev) =>
      prev.includes(severity)
        ? prev.filter((s) => s !== severity)
        : [...prev, severity],
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-8 gap-2 text-xs font-normal dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <Filter className="h-3.5 w-3.5" />
          Filters
          {(selectedStatuses.length > 0 || selectedSeverities.length > 0) && (
            <span className="ml-1 rounded-full bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 text-[10px] font-medium text-slate-900 dark:text-slate-100">
              {selectedStatuses.length + selectedSeverities.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25 dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="dark:text-slate-100">
            Filter alarms
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium leading-none text-slate-900 dark:text-slate-200">
              Status
            </h4>
            <div className="flex flex-wrap gap-2">
              {ALARM_STATUSES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleStatus(value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors border ${
                    tempStatuses.includes(value)
                      ? "bg-cyan-500 border-cyan-500 text-white"
                      : "bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Severity Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium leading-none text-slate-900 dark:text-slate-200">
              Severity
            </h4>
            <div className="flex flex-wrap gap-2">
              {ALARM_SEVERITIES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleSeverity(value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors border ${
                    tempSeverities.includes(value)
                      ? "bg-slate-700 border-slate-700 text-white dark:bg-slate-200 dark:border-slate-200 dark:text-slate-900"
                      : "bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
