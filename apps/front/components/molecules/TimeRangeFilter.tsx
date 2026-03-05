"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select from "@/components/ui/select";

export interface TimeRange {
    startTime?: number;
    endTime?: number;
    type: "ALL_TIME" | "LAST" | "RANGE";
    lastValue?: number;
    lastUnit?: "MINUTES" | "HOURS" | "DAYS";
}

interface TimeRangeFilterProps {
    value: TimeRange;
    onChange: (range: TimeRange) => void;
}

const UNIT_MULTIPLIERS = {
    MINUTES: 60 * 1000,
    HOURS: 60 * 60 * 1000,
    DAYS: 24 * 60 * 60 * 1000,
};

const UNIT_OPTIONS = [
    { value: "MINUTES", label: "Minutes" },
    { value: "HOURS", label: "Hours" },
    { value: "DAYS", label: "Days" },
];

export function TimeRangeFilter({ value, onChange }: TimeRangeFilterProps) {
    const [open, setOpen] = useState(false);
    const [tempValue, setTempValue] = useState<TimeRange>(value);

    const handleUpdate = () => {
        let finalRange = { ...tempValue };

        if (tempValue.type === "LAST") {
            const val = tempValue.lastValue || 1;
            const unit = tempValue.lastUnit || "MINUTES";

            const duration = val * UNIT_MULTIPLIERS[unit];
            const end = Date.now();
            const start = end - duration;
            finalRange = {
                ...tempValue,
                lastValue: val,
                lastUnit: unit,
                startTime: start,
                endTime: end
            };
        } else if (tempValue.type === "ALL_TIME") {
            finalRange = {
                ...tempValue,
                startTime: undefined,
                endTime: undefined
            };
        }
        // For RANGE, startTime and endTime are already set in state

        onChange(finalRange);
        setOpen(false);
    };

    const getDisplayLabel = () => {
        if (value.type === "ALL_TIME") return "For all time";
        if (value.type === "LAST") return `Last ${value.lastValue} ${value.lastUnit?.toLowerCase()}`;
        if (value.type === "RANGE") {
            const start = value.startTime ? new Date(value.startTime).toLocaleString() : 'Start';
            const end = value.endTime ? new Date(value.endTime).toLocaleString() : 'Now';
            return `${start} - ${end}`;
        }
        return "Time window";
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="h-8 gap-2 text-xs font-normal dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100">
                    <Clock className="h-3.5 w-3.5" />
                    {getDisplayLabel()}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-106.25 dark:bg-slate-900 dark:border-slate-800">
                <DialogHeader>
                    <DialogTitle className="dark:text-slate-100">Time window</DialogTitle>
                </DialogHeader>
                <Tabs
                    defaultValue={tempValue.type}
                    onValueChange={(v) => setTempValue(prev => ({ ...prev, type: v as any }))}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-3 dark:bg-slate-800">
                        <TabsTrigger value="ALL_TIME" className="dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-slate-100 dark:text-slate-400">For all time</TabsTrigger>
                        <TabsTrigger value="LAST" className="dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-slate-100 dark:text-slate-400">Last</TabsTrigger>
                        <TabsTrigger value="RANGE" className="dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-slate-100 dark:text-slate-400">Range</TabsTrigger>
                    </TabsList>

                    <TabsContent value="ALL_TIME" className="py-4 text-sm text-slate-500 dark:text-slate-400">
                        History will be displayed for all time.
                    </TabsContent>

                    <TabsContent value="LAST" className="space-y-4 py-4">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <Label className="dark:text-slate-300">Value</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={tempValue.lastValue || ""}
                                    onChange={(e) => setTempValue(prev => ({ ...prev, lastValue: parseInt(e.target.value) || 1 }))}
                                    className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                                />
                            </div>
                            <div className="flex-1">
                                <Label className="dark:text-slate-300">Unit</Label>
                                <Select
                                    options={UNIT_OPTIONS}
                                    value={tempValue.lastUnit || "MINUTES"}
                                    onValueChange={(v) => setTempValue(prev => ({ ...prev, lastUnit: v as any }))}
                                />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="RANGE" className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label className="dark:text-slate-300">From</Label>
                            <Input
                                type="datetime-local"
                                value={tempValue.startTime ? new Date(tempValue.startTime - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ""}
                                onChange={(e) => {
                                    const date = e.target.value ? new Date(e.target.value) : undefined;
                                    setTempValue(prev => ({ ...prev, startTime: date?.getTime() }));
                                }}
                                className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:scheme-dark"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="dark:text-slate-300">To</Label>
                            <Input
                                type="datetime-local"
                                value={tempValue.endTime ? new Date(tempValue.endTime - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ""}
                                onChange={(e) => {
                                    const date = e.target.value ? new Date(e.target.value) : undefined;
                                    setTempValue(prev => ({ ...prev, endTime: date?.getTime() }));
                                }}
                                className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:scheme-dark"
                            />
                        </div>
                    </TabsContent>
                </Tabs>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100">Cancel</Button>
                    <Button onClick={handleUpdate}>Update</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
