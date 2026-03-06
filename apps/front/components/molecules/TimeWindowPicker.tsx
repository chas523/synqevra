"use client";

import { useState, useRef, useEffect } from "react";
import { Clock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ─────────────────────────────────────────────────────────────────
export type TimeWindowMode = "last" | "range" | "relative";

export interface TimeWindowValue {
    mode: TimeWindowMode;
    // Last mode
    lastMs?: number;
    lastLabel?: string;
    // Range mode
    startTime?: Date;
    endTime?: Date;
    // Relative mode
    relativeKey?: string;
    relativeLabel?: string;
}

interface TimeWindowPickerProps {
    value: TimeWindowValue;
    onChange: (value: TimeWindowValue) => void;
}

// ─── Last options ───────────────────────────────────────────────────────────
const LAST_OPTIONS = [
    { label: "1 second", ms: 1000 },
    { label: "5 seconds", ms: 5000 },
    { label: "10 seconds", ms: 10000 },
    { label: "15 seconds", ms: 15000 },
    { label: "30 seconds", ms: 30000 },
    { label: "1 minute", ms: 60000 },
    { label: "2 minutes", ms: 120000 },
    { label: "5 minutes", ms: 300000 },
    { label: "10 minutes", ms: 600000 },
    { label: "15 minutes", ms: 900000 },
    { label: "30 minutes", ms: 1800000 },
    { label: "1 hour", ms: 3600000 },
    { label: "2 hours", ms: 7200000 },
    { label: "5 hours", ms: 18000000 },
    { label: "10 hours", ms: 36000000 },
    { label: "12 hours", ms: 43200000 },
    { label: "1 day", ms: 86400000 },
    { label: "7 days", ms: 604800000 },
    { label: "30 days", ms: 2592000000 },
];

// ─── Relative options ───────────────────────────────────────────────────────
interface RelativeOption {
    key: string;
    label: string;
    getRange: () => { start: Date; end: Date };
}

const now = () => new Date();
const startOfDay = (d: Date) => { const r = new Date(d); r.setHours(0, 0, 0, 0); return r; };
const endOfDay = (d: Date) => { const r = new Date(d); r.setHours(23, 59, 59, 999); return r; };

const RELATIVE_OPTIONS: RelativeOption[] = [
    { key: "yesterday", label: "Yesterday", getRange: () => { const d = new Date(); d.setDate(d.getDate() - 1); return { start: startOfDay(d), end: endOfDay(d) }; } },
    { key: "day_before", label: "Day before yesterday", getRange: () => { const d = new Date(); d.setDate(d.getDate() - 2); return { start: startOfDay(d), end: endOfDay(d) }; } },
    { key: "this_day_last_week", label: "This day last week", getRange: () => { const d = new Date(); d.setDate(d.getDate() - 7); return { start: startOfDay(d), end: endOfDay(d) }; } },
    {
        key: "prev_week_sun_sat", label: "Previous week (Sun - Sat)", getRange: () => {
            const d = new Date(); const dow = d.getDay();
            const sun = new Date(d); sun.setDate(d.getDate() - dow - 7);
            const sat = new Date(sun); sat.setDate(sun.getDate() + 6);
            return { start: startOfDay(sun), end: endOfDay(sat) };
        }
    },
    {
        key: "prev_week_mon_sun", label: "Previous week (Mon - Sun)", getRange: () => {
            const d = new Date(); const dow = (d.getDay() + 6) % 7;
            const mon = new Date(d); mon.setDate(d.getDate() - dow - 7);
            const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
            return { start: startOfDay(mon), end: endOfDay(sun) };
        }
    },
    {
        key: "prev_month", label: "Previous month", getRange: () => {
            const d = new Date(now().getFullYear(), now().getMonth() - 1, 1);
            const e = new Date(now().getFullYear(), now().getMonth(), 0);
            return { start: startOfDay(d), end: endOfDay(e) };
        }
    },
    {
        key: "prev_quarter", label: "Previous quarter", getRange: () => {
            const m = now().getMonth(); const q = Math.floor(m / 3);
            const s = new Date(now().getFullYear(), (q - 1) * 3, 1);
            const e = new Date(now().getFullYear(), q * 3, 0);
            return { start: startOfDay(s), end: endOfDay(e) };
        }
    },
    {
        key: "prev_half_year", label: "Previous half year", getRange: () => {
            const h = now().getMonth() < 6 ? 0 : 1;
            const s = new Date(now().getFullYear(), h === 1 ? 0 : -6, 1);
            const e = new Date(now().getFullYear(), h === 1 ? 6 : 0, 0);
            return { start: startOfDay(s), end: endOfDay(e) };
        }
    },
    {
        key: "prev_year", label: "Previous year", getRange: () => {
            const y = now().getFullYear() - 1;
            return { start: new Date(y, 0, 1), end: new Date(y, 11, 31, 23, 59, 59, 999) };
        }
    },
    {
        key: "current_hour", label: "Current hour", getRange: () => {
            const s = new Date(now()); s.setMinutes(0, 0, 0);
            return { start: s, end: now() };
        }
    },
    { key: "current_day", label: "Current day", getRange: () => ({ start: startOfDay(now()), end: endOfDay(now()) }) },
    { key: "current_day_so_far", label: "Current day so far", getRange: () => ({ start: startOfDay(now()), end: now() }) },
    {
        key: "current_week_sun_sat", label: "Current week (Sun - Sat)", getRange: () => {
            const d = now(); const sun = new Date(d); sun.setDate(d.getDate() - d.getDay());
            return { start: startOfDay(sun), end: now() };
        }
    },
    {
        key: "current_week_mon_sun", label: "Current week (Mon - Sun)", getRange: () => {
            const d = now(); const mon = new Date(d); mon.setDate(d.getDate() - ((d.getDay() + 6) % 7));
            return { start: startOfDay(mon), end: now() };
        }
    },
    {
        key: "current_week_so_far_sun", label: "Current week so far (Sun - Sat)", getRange: () => {
            const d = now(); const sun = new Date(d); sun.setDate(d.getDate() - d.getDay());
            return { start: startOfDay(sun), end: now() };
        }
    },
    {
        key: "current_week_so_far_mon", label: "Current week so far (Mon - Sun)", getRange: () => {
            const d = now(); const mon = new Date(d); mon.setDate(d.getDate() - ((d.getDay() + 6) % 7));
            return { start: startOfDay(mon), end: now() };
        }
    },
    {
        key: "current_month", label: "Current month", getRange: () => {
            const s = new Date(now().getFullYear(), now().getMonth(), 1);
            const e = new Date(now().getFullYear(), now().getMonth() + 1, 0);
            return { start: startOfDay(s), end: endOfDay(e) };
        }
    },
    {
        key: "current_month_so_far", label: "Current month so far", getRange: () => ({
            start: new Date(now().getFullYear(), now().getMonth(), 1), end: now()
        })
    },
    {
        key: "current_quarter", label: "Current quarter", getRange: () => {
            const q = Math.floor(now().getMonth() / 3);
            return { start: new Date(now().getFullYear(), q * 3, 1), end: new Date(now().getFullYear(), q * 3 + 3, 0) };
        }
    },
    {
        key: "current_quarter_so_far", label: "Current quarter so far", getRange: () => {
            const q = Math.floor(now().getMonth() / 3);
            return { start: new Date(now().getFullYear(), q * 3, 1), end: now() };
        }
    },
    {
        key: "current_half", label: "Current half year", getRange: () => {
            const h = now().getMonth() < 6 ? 0 : 1;
            return { start: new Date(now().getFullYear(), h * 6, 1), end: new Date(now().getFullYear(), h * 6 + 6, 0) };
        }
    },
    {
        key: "current_half_so_far", label: "Current half year so far", getRange: () => {
            const h = now().getMonth() < 6 ? 0 : 1;
            return { start: new Date(now().getFullYear(), h * 6, 1), end: now() };
        }
    },
    {
        key: "current_year", label: "Current year", getRange: () => ({
            start: new Date(now().getFullYear(), 0, 1), end: new Date(now().getFullYear(), 11, 31, 23, 59, 59, 999)
        })
    },
    {
        key: "current_year_so_far", label: "Current year so far", getRange: () => ({
            start: new Date(now().getFullYear(), 0, 1), end: now()
        })
    },
];

// ─── Helper: format datetime-local value ───────────────────────────────────
function toDatetimeLocalString(d: Date): string {
    const pad2 = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function formatButtonLabel(v: TimeWindowValue): string {
    if (v.mode === "last") return `last ${v.lastLabel ?? "1 day"}`;
    if (v.mode === "relative") return v.relativeLabel ?? "relative";
    if (v.mode === "range" && v.startTime && v.endTime) {
        const fmt = (d: Date) => d.toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" });
        return `${fmt(v.startTime)} – ${fmt(v.endTime)}`;
    }
    return "range";
}

// ─── Main component ─────────────────────────────────────────────────────────
export function TimeWindowPicker({ value, onChange }: TimeWindowPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [draftMode, setDraftMode] = useState<TimeWindowMode>(value.mode);
    const [draftLastMs, setDraftLastMs] = useState(value.lastMs ?? 86400000);
    const [draftLastLabel, setDraftLastLabel] = useState(value.lastLabel ?? "1 day");
    const [draftRelativeKey, setDraftRelativeKey] = useState(value.relativeKey ?? "current_day");
    const [draftStart, setDraftStart] = useState<string>(
        toDatetimeLocalString(value.startTime ?? new Date(Date.now() - 86400000))
    );
    const [draftEnd, setDraftEnd] = useState<string>(
        toDatetimeLocalString(value.endTime ?? new Date())
    );
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleUpdate = () => {
        if (draftMode === "last") {
            onChange({ mode: "last", lastMs: draftLastMs, lastLabel: draftLastLabel });
        } else if (draftMode === "relative") {
            const opt = RELATIVE_OPTIONS.find(o => o.key === draftRelativeKey)!;
            const r = opt.getRange();
            onChange({ mode: "relative", relativeKey: draftRelativeKey, relativeLabel: opt.label, startTime: r.start, endTime: r.end });
        } else {
            onChange({ mode: "range", startTime: new Date(draftStart), endTime: new Date(draftEnd) });
        }
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block" ref={ref}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
                <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                {formatButtonLabel(value)}
            </button>

            {isOpen && (
                <div className="absolute left-0 top-full mt-2 z-50 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-4">
                    <p className="font-semibold text-sm text-slate-700 dark:text-white mb-3">Time window</p>

                    {/* Mode tabs */}
                    <div className="flex gap-1 mb-4 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                        {(["last", "range", "relative"] as TimeWindowMode[]).map(m => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => setDraftMode(m)}
                                className={`flex-1 py-1 text-sm font-medium rounded-md transition-colors capitalize ${draftMode === m
                                        ? "bg-white dark:bg-slate-700 text-[#2a456c] dark:text-white shadow-sm"
                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                    }`}
                            >
                                {m.charAt(0).toUpperCase() + m.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Mode: Last */}
                    {draftMode === "last" && (
                        <select
                            value={draftLastMs}
                            onChange={e => {
                                const opt = LAST_OPTIONS.find(o => o.ms === Number(e.target.value));
                                if (opt) { setDraftLastMs(opt.ms); setDraftLastLabel(opt.label); }
                            }}
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2a456c]"
                        >
                            {LAST_OPTIONS.map(o => (
                                <option key={o.ms} value={o.ms}>{o.label}</option>
                            ))}
                        </select>
                    )}

                    {/* Mode: Range */}
                    {draftMode === "range" && (
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 block">From</label>
                                <input
                                    type="datetime-local"
                                    value={draftStart}
                                    onChange={e => setDraftStart(e.target.value)}
                                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2a456c]"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 block">To</label>
                                <input
                                    type="datetime-local"
                                    value={draftEnd}
                                    onChange={e => setDraftEnd(e.target.value)}
                                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2a456c]"
                                />
                            </div>
                        </div>
                    )}

                    {/* Mode: Relative */}
                    {draftMode === "relative" && (
                        <select
                            value={draftRelativeKey}
                            onChange={e => setDraftRelativeKey(e.target.value)}
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2a456c]"
                        >
                            {RELATIVE_OPTIONS.map(o => (
                                <option key={o.key} value={o.key}>{o.label}</option>
                            ))}
                        </select>
                    )}

                    {/* Footer */}
                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="dark:text-slate-300">
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleUpdate} className="bg-[#2a456c] hover:bg-[#1a355c] text-white">
                            Update
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
