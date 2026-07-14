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

export type EventType = "LC_EVENT" | "STATS" | "ERROR";

export const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: "LC_EVENT", label: "Lifecycle event" },
  { value: "STATS", label: "Statistics" },
  { value: "ERROR", label: "Error" },
];

interface EventFiltersProps {
  selectedType: EventType;
  onTypeChange: (type: EventType) => void;
}

export function EventFilters({
  selectedType,
  onTypeChange,
}: EventFiltersProps) {
  const [open, setOpen] = useState(false);
  const [tempType, setTempType] = useState<EventType>(selectedType);

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setTempType(selectedType);
    }
    setOpen(newOpen);
  };

  const handleApply = () => {
    onTypeChange(tempType);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-8 gap-2 text-xs font-normal">
          <Filter className="h-3.5 w-3.5" />
          Filters
          <span className="ml-1 rounded-full bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-900 dark:text-slate-50">
            1
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Filter events</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Event Type Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium leading-none">Event Type</h4>
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTempType(value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    tempType === value
                      ? "bg-cyan-500 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
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
