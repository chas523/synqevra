"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Select from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

type ScheduleMode = "ALL_TIME" | "SPECIFIC_TIME" | "CUSTOM";
type WeekDay =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

type DaySchedule = {
  enabled: boolean;
  from: string;
  to: string;
};

type StoredScheduleConfig = {
  kind: "FPL_ALARM_SCHEDULE_V1";
  mode: ScheduleMode;
  timeZone: string;
  dynamicValue: boolean;
  dynamicSourceType?: DynamicSourceType;
  sourceAttribute?: string;
  specificDays: WeekDay[];
  specificFrom: string;
  specificTo: string;
  custom: Record<WeekDay, DaySchedule>;
};

type DynamicSourceType =
  | "NO_DYNAMIC_VALUE"
  | "CURRENT_TENANT"
  | "CURRENT_CUSTOMER"
  | "CURRENT_DEVICE";

type ScheduleDraft = {
  mode: ScheduleMode;
  timeZone: string;
  dynamicValue: boolean;
  dynamicSourceType: DynamicSourceType;
  sourceAttribute: string;
  specificDays: WeekDay[];
  specificFrom: string;
  specificTo: string;
  custom: Record<WeekDay, DaySchedule>;
};

const MODE_OPTIONS = [
  { value: "ALL_TIME", label: "Active all time" },
  { value: "SPECIFIC_TIME", label: "Active at specific time" },
  { value: "CUSTOM", label: "Custom" },
];

const TIME_ZONE_OPTIONS = [
  { value: "Europe/Warsaw (UTC+01:00)", label: "Europe/Warsaw (UTC+01:00)" },
  { value: "UTC (UTC+00:00)", label: "UTC (UTC+00:00)" },
  { value: "Europe/Berlin (UTC+01:00)", label: "Europe/Berlin (UTC+01:00)" },
  {
    value: "America/New_York (UTC-05:00)",
    label: "America/New_York (UTC-05:00)",
  },
];

const DYNAMIC_SOURCE_TYPE_OPTIONS: Array<{
  value: DynamicSourceType;
  label: string;
}> = [
  { value: "NO_DYNAMIC_VALUE", label: "No dynamic value" },
  { value: "CURRENT_TENANT", label: "Current tenant" },
  { value: "CURRENT_CUSTOMER", label: "Current customer" },
  { value: "CURRENT_DEVICE", label: "Current device" },
];

const DAYS: Array<{ value: WeekDay; label: string }> = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
];

const DEFAULT_TIME_FROM = "00:00";
const DEFAULT_TIME_TO = "12:00";

const createDefaultCustom = (): Record<WeekDay, DaySchedule> => ({
  MONDAY: { enabled: true, from: DEFAULT_TIME_FROM, to: DEFAULT_TIME_TO },
  TUESDAY: { enabled: true, from: DEFAULT_TIME_FROM, to: DEFAULT_TIME_TO },
  WEDNESDAY: { enabled: true, from: DEFAULT_TIME_FROM, to: DEFAULT_TIME_TO },
  THURSDAY: { enabled: true, from: DEFAULT_TIME_FROM, to: DEFAULT_TIME_TO },
  FRIDAY: { enabled: true, from: DEFAULT_TIME_FROM, to: DEFAULT_TIME_TO },
  SATURDAY: { enabled: true, from: DEFAULT_TIME_FROM, to: DEFAULT_TIME_TO },
  SUNDAY: { enabled: true, from: DEFAULT_TIME_FROM, to: DEFAULT_TIME_TO },
});

const DEFAULT_DRAFT: ScheduleDraft = {
  mode: "ALL_TIME",
  timeZone: "Europe/Warsaw (UTC+01:00)",
  dynamicValue: false,
  dynamicSourceType: "NO_DYNAMIC_VALUE",
  sourceAttribute: "",
  specificDays: [],
  specificFrom: DEFAULT_TIME_FROM,
  specificTo: DEFAULT_TIME_TO,
  custom: createDefaultCustom(),
};

const isStoredScheduleConfig = (
  value: unknown,
): value is StoredScheduleConfig => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;
  return item.kind === "FPL_ALARM_SCHEDULE_V1";
};

const parseValueToDraft = (rawValue: string): ScheduleDraft => {
  const value = String(rawValue ?? "").trim();
  if (!value) {
    return { ...DEFAULT_DRAFT, custom: createDefaultCustom() };
  }

  try {
    const parsed = JSON.parse(value);
    if (!isStoredScheduleConfig(parsed)) {
      throw new Error("legacy-value");
    }

    return {
      mode: parsed.mode ?? "ALL_TIME",
      timeZone: parsed.timeZone || DEFAULT_DRAFT.timeZone,
      dynamicValue: Boolean(parsed.dynamicValue),
      dynamicSourceType:
        (parsed.dynamicSourceType as DynamicSourceType) ??
        (parsed.dynamicValue ? "CURRENT_DEVICE" : "NO_DYNAMIC_VALUE"),
      sourceAttribute: parsed.sourceAttribute || "",
      specificDays: Array.isArray(parsed.specificDays)
        ? parsed.specificDays
        : [],
      specificFrom: parsed.specificFrom || DEFAULT_TIME_FROM,
      specificTo: parsed.specificTo || DEFAULT_TIME_TO,
      custom: {
        ...createDefaultCustom(),
        ...(parsed.custom ?? {}),
      },
    };
  } catch {
    const normalized = value.toLowerCase();
    if (normalized.includes("specific")) {
      return {
        ...DEFAULT_DRAFT,
        mode: "SPECIFIC_TIME",
        custom: createDefaultCustom(),
      };
    }

    if (normalized.includes("custom")) {
      return {
        ...DEFAULT_DRAFT,
        mode: "CUSTOM",
        custom: createDefaultCustom(),
      };
    }

    return {
      ...DEFAULT_DRAFT,
      mode: "ALL_TIME",
      custom: createDefaultCustom(),
    };
  }
};

const formatTimeRange = (from: string, to: string): string => {
  const normalizedFrom = from || DEFAULT_TIME_FROM;
  const normalizedTo = to || DEFAULT_TIME_TO;
  return `${normalizedFrom} - ${normalizedTo}`;
};

const toMeridiemTime = (rawTime: string): string => {
  const [hourPart, minutePart] = (rawTime || "").split(":");
  const hours = Number(hourPart);
  const minutes = Number(minutePart);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return rawTime;
  }

  const suffix = hours >= 12 ? "PM" : "AM";
  const normalizedHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${normalizedHours}:${String(minutes).padStart(2, "0")} ${suffix}`;
};

const formatScheduleRange = (from: string, to: string): string =>
  `${toMeridiemTime(from || DEFAULT_TIME_FROM)} - ${toMeridiemTime(to || DEFAULT_TIME_TO)}`;

const toStoredValue = (draft: ScheduleDraft): string => {
  if (draft.mode === "ALL_TIME") {
    return "Active all the time";
  }

  const payload: StoredScheduleConfig = {
    kind: "FPL_ALARM_SCHEDULE_V1",
    mode: draft.mode,
    timeZone: draft.timeZone,
    dynamicValue: draft.dynamicSourceType !== "NO_DYNAMIC_VALUE",
    dynamicSourceType: draft.dynamicSourceType,
    sourceAttribute: draft.sourceAttribute,
    specificDays: draft.specificDays,
    specificFrom: draft.specificFrom,
    specificTo: draft.specificTo,
    custom: draft.custom,
  };

  return JSON.stringify(payload);
};

const isDraftValid = (draft: ScheduleDraft): boolean => {
  if (draft.mode === "ALL_TIME") {
    return true;
  }

  if (draft.mode === "SPECIFIC_TIME") {
    return (
      draft.specificDays.length > 0 &&
      Boolean(draft.specificFrom) &&
      Boolean(draft.specificTo)
    );
  }

  const enabledDays = DAYS.filter((day) => draft.custom[day.value].enabled);
  return (
    enabledDays.length > 0 &&
    enabledDays.every(
      (day) =>
        Boolean(draft.custom[day.value].from) &&
        Boolean(draft.custom[day.value].to),
    )
  );
};

const toSummary = (rawValue: string): string => {
  const draft = parseValueToDraft(rawValue);

  if (draft.mode === "ALL_TIME") {
    return "Active all the time";
  }

  if (draft.mode === "SPECIFIC_TIME") {
    const [firstDay, ...remainingDays] = draft.specificDays;
    const firstDayLabel =
      DAYS.find((day) => day.value === firstDay)?.label ?? "Specific day";
    const range = formatScheduleRange(draft.specificFrom, draft.specificTo);

    if (remainingDays.length === 0) {
      return `${firstDayLabel} ${range}`;
    }

    return `${firstDayLabel} ${range} and ${remainingDays.length} more`;
  }

  const activeRanges = DAYS.filter(
    (day) => draft.custom[day.value].enabled,
  ).map(
    (day) =>
      `${day.label} ${formatScheduleRange(draft.custom[day.value].from, draft.custom[day.value].to)}`,
  );

  if (activeRanges.length === 0) {
    return "Custom schedule";
  }

  if (activeRanges.length === 1) {
    return activeRanges[0];
  }

  return `${activeRanges[0]} and ${activeRanges[1]}${activeRanges.length > 2 ? "..." : ""}`;
};

export interface AlarmScheduleEditorProps {
  value: string;
  onChange: (nextValue: string) => void;
  disabled?: boolean;
}

export function AlarmScheduleEditor({
  value,
  onChange,
  disabled = false,
}: AlarmScheduleEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<ScheduleDraft>(DEFAULT_DRAFT);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDraft(parseValueToDraft(value));
  }, [isOpen, value]);

  const isValid = useMemo(() => isDraftValid(draft), [draft]);
  const summary = useMemo(() => toSummary(value), [value]);
  const showDayValidationError =
    draft.mode === "SPECIFIC_TIME" && draft.specificDays.length === 0;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        className="w-full justify-start"
      >
        <span className="block w-full truncate text-left">{summary}</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit alarm schedule</DialogTitle>
            <DialogDescription>
              Configure schedule mode, timezone and active time windows.
            </DialogDescription>
          </DialogHeader>

          <div
            className={
              draft.mode === "ALL_TIME"
                ? "space-y-4"
                : "max-h-[65vh] space-y-4 overflow-y-auto pr-1"
            }
          >
            <div className="space-y-2">
              <Select
                options={MODE_OPTIONS}
                value={draft.mode}
                onValueChange={(next) =>
                  setDraft((prev) => ({
                    ...prev,
                    mode: (next as ScheduleMode) ?? "ALL_TIME",
                  }))
                }
              />
            </div>

            {draft.mode !== "ALL_TIME" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Time zone*</label>
                <Select
                  options={TIME_ZONE_OPTIONS}
                  value={draft.timeZone}
                  onValueChange={(next) =>
                    setDraft((prev) => ({
                      ...prev,
                      timeZone: next,
                    }))
                  }
                />
              </div>
            )}

            {draft.mode !== "ALL_TIME" && (
              <div className="space-y-2 rounded-lg border border-muted p-3">
                <div className="text-sm font-medium">Dynamic value</div>
                <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <Select
                    options={DYNAMIC_SOURCE_TYPE_OPTIONS}
                    value={draft.dynamicSourceType}
                    onValueChange={(next) => {
                      const nextSource =
                        (next as DynamicSourceType) ?? "NO_DYNAMIC_VALUE";

                      setDraft((prev) => ({
                        ...prev,
                        dynamicSourceType: nextSource,
                        dynamicValue: nextSource !== "NO_DYNAMIC_VALUE",
                        sourceAttribute:
                          nextSource === "NO_DYNAMIC_VALUE"
                            ? ""
                            : prev.sourceAttribute,
                      }));
                    }}
                  />
                  <Input
                    value={draft.sourceAttribute}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        sourceAttribute: event.target.value,
                      }))
                    }
                    placeholder="Source attribute"
                    disabled={draft.dynamicSourceType === "NO_DYNAMIC_VALUE"}
                  />
                </div>
              </div>
            )}

            {draft.mode === "SPECIFIC_TIME" && (
              <div className="space-y-3">
                <div className="text-sm font-medium">Days</div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {DAYS.map((day) => {
                    const selected = draft.specificDays.includes(day.value);
                    return (
                      <label
                        key={day.value}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={selected}
                          onCheckedChange={(checked) =>
                            setDraft((prev) => ({
                              ...prev,
                              specificDays: checked
                                ? [...prev.specificDays, day.value]
                                : prev.specificDays.filter(
                                    (item) => item !== day.value,
                                  ),
                            }))
                          }
                        />
                        {day.label}
                      </label>
                    );
                  })}
                </div>

                {showDayValidationError && (
                  <p className="text-sm text-destructive">
                    At least one day of week should be selected.
                  </p>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm">From*</label>
                    <Input
                      type="time"
                      value={draft.specificFrom}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          specificFrom: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm">To*</label>
                    <Input
                      type="time"
                      value={draft.specificTo}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          specificTo: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatTimeRange(draft.specificFrom, draft.specificTo)}
                </div>
              </div>
            )}

            {draft.mode === "CUSTOM" && (
              <div className="space-y-3">
                <div className="text-sm font-medium">Days</div>
                <div className="space-y-2">
                  {DAYS.map((day) => {
                    const item = draft.custom[day.value];
                    return (
                      <div
                        key={day.value}
                        className="space-y-2 rounded-md border border-muted bg-muted/20 p-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={item.enabled}
                              onCheckedChange={(checked) =>
                                setDraft((prev) => ({
                                  ...prev,
                                  custom: {
                                    ...prev.custom,
                                    [day.value]: {
                                      ...prev.custom[day.value],
                                      enabled: Boolean(checked),
                                    },
                                  },
                                }))
                              }
                            />
                            {day.label}
                          </label>
                          <div className="text-xs text-muted-foreground">
                            {formatTimeRange(item.from, item.to)}
                          </div>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                          <Input
                            type="time"
                            value={item.from}
                            disabled={!item.enabled}
                            onChange={(event) =>
                              setDraft((prev) => ({
                                ...prev,
                                custom: {
                                  ...prev.custom,
                                  [day.value]: {
                                    ...prev.custom[day.value],
                                    from: event.target.value,
                                  },
                                },
                              }))
                            }
                          />

                          <Input
                            type="time"
                            value={item.to}
                            disabled={!item.enabled}
                            onChange={(event) =>
                              setDraft((prev) => ({
                                ...prev,
                                custom: {
                                  ...prev.custom,
                                  [day.value]: {
                                    ...prev.custom[day.value],
                                    to: event.target.value,
                                  },
                                },
                              }))
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!isValid}
              onClick={() => {
                onChange(toStoredValue(draft));
                setIsOpen(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
