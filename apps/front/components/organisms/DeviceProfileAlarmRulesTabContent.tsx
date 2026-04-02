"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DeviceService } from "@/lib/services/thingsboardServices/deviceService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Select from "@/components/ui/select";
import { AlarmConditionEditor } from "@/components/molecules/AlarmConditionEditor";
import { AlarmScheduleEditor } from "@/components/molecules/AlarmScheduleEditor";

interface DeviceProfileAlarmRulesTabContentProps {
  profileId: string;
}

type AlarmSeverity =
  | "CRITICAL"
  | "MAJOR"
  | "MINOR"
  | "WARNING"
  | "INDETERMINATE";

type CreateRuleCondition = {
  id: string;
  severity: AlarmSeverity;
  condition: string;
  schedule: string;
  additionalInfo: string;
};

type ClearRuleCondition = {
  id: string;
  condition: string;
  schedule: string;
  additionalInfo: string;
};

type AlarmRule = {
  id: string;
  backendId?: string;
  name: string;
  createRuleConditions: CreateRuleCondition[];
  clearRuleConditions: ClearRuleCondition[];
};

const SEVERITY_OPTIONS: Array<{ value: AlarmSeverity; label: string }> = [
  { value: "CRITICAL", label: "Critical" },
  { value: "MAJOR", label: "Major" },
  { value: "MINOR", label: "Minor" },
  { value: "WARNING", label: "Warning" },
  { value: "INDETERMINATE", label: "Indeterminate" },
];

const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const ACTIVE_ALL_TIME = "Active all the time";

const DAY_TO_INDEX = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
} as const;

const INDEX_TO_DAY = {
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
  7: "SUNDAY",
} as const;

const DEFAULT_TIME_FROM = "00:00";
const DEFAULT_TIME_TO = "12:00";

const timeToMs = (rawTime: string): number => {
  const [h, m] = rawTime.split(":").map((item) => Number(item));
  if (!Number.isFinite(h) || !Number.isFinite(m)) {
    return 0;
  }

  return (h * 60 * 60 + m * 60) * 1000;
};

const msToTime = (rawMs: unknown): string => {
  const totalSeconds = Math.floor(Number(rawMs) / 1000);
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return DEFAULT_TIME_FROM;
  }

  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");

  return `${hours}:${minutes}`;
};

const normalizeTimezone = (rawTimezone: string): string =>
  rawTimezone.split(" (")[0]?.trim() || "UTC";

const toEditorConditionValue = (rawCondition: unknown): string => {
  if (!rawCondition) {
    return "";
  }

  if (typeof rawCondition === "string") {
    return rawCondition;
  }

  const conditionObject = rawCondition as {
    condition?: Array<{
      key?: { type?: string; key?: string };
      valueType?: string;
      predicate?: {
        operation?: string;
        ignoreCase?: boolean;
        value?: { defaultValue?: unknown };
      };
    }>;
    spec?: { type?: string };
  };

  const conditionType =
    conditionObject.spec?.type === "DURATION"
      ? "DURATION"
      : conditionObject.spec?.type === "REPEATING"
        ? "REPEATING"
        : "SIMPLE";

  const keyFilters = (conditionObject.condition ?? [])
    .filter((item) => item?.key?.type && item?.key?.key && item?.valueType)
    .map((item) => ({
      keyType: item.key!.type,
      keyName: item.key!.key,
      valueType: item.valueType,
      filters: [
        {
          kind: "simple",
          operation: item.predicate?.operation ?? "EQUAL",
          ignoreCase: Boolean(item.predicate?.ignoreCase),
          value: String(item.predicate?.value?.defaultValue ?? ""),
        },
      ],
    }));

  return JSON.stringify({
    kind: "FPL_ALARM_CONDITION_V1",
    conditionType,
    simpleExpression: "",
    keyFilters,
  });
};

const toThingsBoardCondition = (
  rawCondition: string,
): Record<string, unknown> => {
  const value = rawCondition.trim();

  if (!value) {
    return {
      condition: [],
      spec: { type: "SIMPLE" },
    };
  }

  try {
    const parsed = JSON.parse(value) as any;

    if (Array.isArray(parsed?.condition) && parsed?.spec?.type) {
      return parsed;
    }

    if (parsed?.kind === "FPL_ALARM_CONDITION_V1") {
      const conditionType =
        parsed.conditionType === "DURATION"
          ? "DURATION"
          : parsed.conditionType === "REPEATING"
            ? "REPEATING"
            : "SIMPLE";

      const condition = (parsed.keyFilters ?? []).flatMap((item: any) =>
        (item.filters ?? [])
          .filter((rule: any) => rule?.kind === "simple")
          .map((rule: any) => ({
            key: {
              type: item.keyType,
              key: item.keyName,
            },
            valueType: item.valueType,
            value: null,
            predicate: {
              operation: rule.operation ?? "EQUAL",
              value: {
                defaultValue: rule.value,
                dynamicValue: null,
              },
              ...(item.valueType === "STRING"
                ? { ignoreCase: Boolean(rule.ignoreCase) }
                : {}),
              type: item.valueType,
            },
          })),
      );

      return {
        condition,
        spec: { type: conditionType },
      };
    }
  } catch {
    // fall through to plain simple spec
  }

  return {
    condition: [],
    spec: { type: "SIMPLE" },
  };
};

const toThingsBoardSchedule = (rawSchedule: string): unknown => {
  const value = rawSchedule.trim();

  if (!value || value === ACTIVE_ALL_TIME) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as any;

    if (parsed?.type) {
      return parsed;
    }

    if (parsed?.kind === "FPL_ALARM_SCHEDULE_V1") {
      if (parsed.mode === "ALL_TIME") {
        return null;
      }

      const timezone = normalizeTimezone(String(parsed.timeZone || "UTC"));
      const dynamicValue =
        parsed.dynamicSourceType &&
        parsed.dynamicSourceType !== "NO_DYNAMIC_VALUE"
          ? {
              sourceType: parsed.dynamicSourceType,
              sourceAttribute: String(parsed.sourceAttribute || ""),
            }
          : null;

      if (parsed.mode === "SPECIFIC_TIME") {
        const daysOfWeek = (
          Array.isArray(parsed.specificDays) ? parsed.specificDays : []
        )
          .map((day: string) => DAY_TO_INDEX[day as keyof typeof DAY_TO_INDEX])
          .filter((day: number | undefined): day is number =>
            Number.isInteger(day),
          );

        return {
          type: "SPECIFIC_TIME",
          daysOfWeek,
          startsOn: timeToMs(String(parsed.specificFrom || DEFAULT_TIME_FROM)),
          endsOn: timeToMs(String(parsed.specificTo || DEFAULT_TIME_TO)),
          timezone,
          dynamicValue,
        };
      }

      const items = (
        Object.entries(DAY_TO_INDEX) as Array<
          [keyof typeof DAY_TO_INDEX, number]
        >
      ).map(([dayName, dayOfWeek]) => {
        if (parsed.mode === "SPECIFIC_TIME") {
          const selectedDays = Array.isArray(parsed.specificDays)
            ? parsed.specificDays
            : [];
          const enabled = selectedDays.includes(dayName);

          return {
            enabled,
            dayOfWeek,
            startsOn: enabled
              ? timeToMs(String(parsed.specificFrom || DEFAULT_TIME_FROM))
              : 0,
            endsOn: enabled
              ? timeToMs(String(parsed.specificTo || DEFAULT_TIME_TO))
              : 0,
          };
        }

        const customItem = parsed.custom?.[dayName];
        const enabled = Boolean(customItem?.enabled);

        return {
          enabled,
          dayOfWeek,
          startsOn: enabled
            ? timeToMs(String(customItem?.from || DEFAULT_TIME_FROM))
            : 0,
          endsOn: enabled
            ? timeToMs(String(customItem?.to || DEFAULT_TIME_TO))
            : 0,
        };
      });

      return {
        type: "CUSTOM",
        timezone,
        items,
        dynamicValue,
      };
    }

    return parsed;
  } catch {
    return null;
  }
};

const toEditorScheduleValue = (rawSchedule: unknown): string => {
  if (rawSchedule == null) {
    return ACTIVE_ALL_TIME;
  }

  if (typeof rawSchedule === "string") {
    return rawSchedule;
  }

  try {
    const schedule = rawSchedule as any;

    if (schedule?.kind === "FPL_ALARM_SCHEDULE_V1") {
      return JSON.stringify(schedule);
    }

    if (schedule?.type === "SPECIFIC_TIME") {
      const specificDays = (
        Array.isArray(schedule.daysOfWeek) ? schedule.daysOfWeek : []
      )
        .map(
          (dayIndex: number) =>
            INDEX_TO_DAY[dayIndex as keyof typeof INDEX_TO_DAY],
        )
        .filter((dayName: string | undefined): dayName is string =>
          Boolean(dayName),
        );

      return JSON.stringify({
        kind: "FPL_ALARM_SCHEDULE_V1",
        mode: "SPECIFIC_TIME",
        timeZone: schedule.timezone || "Europe/Warsaw",
        dynamicValue: Boolean(schedule.dynamicValue?.sourceType),
        dynamicSourceType:
          schedule.dynamicValue?.sourceType || "NO_DYNAMIC_VALUE",
        sourceAttribute: schedule.dynamicValue?.sourceAttribute || "",
        specificDays,
        specificFrom: msToTime(schedule.startsOn),
        specificTo: msToTime(schedule.endsOn),
        custom: {
          MONDAY: {
            enabled: false,
            from: DEFAULT_TIME_FROM,
            to: DEFAULT_TIME_TO,
          },
          TUESDAY: {
            enabled: false,
            from: DEFAULT_TIME_FROM,
            to: DEFAULT_TIME_TO,
          },
          WEDNESDAY: {
            enabled: false,
            from: DEFAULT_TIME_FROM,
            to: DEFAULT_TIME_TO,
          },
          THURSDAY: {
            enabled: false,
            from: DEFAULT_TIME_FROM,
            to: DEFAULT_TIME_TO,
          },
          FRIDAY: {
            enabled: false,
            from: DEFAULT_TIME_FROM,
            to: DEFAULT_TIME_TO,
          },
          SATURDAY: {
            enabled: false,
            from: DEFAULT_TIME_FROM,
            to: DEFAULT_TIME_TO,
          },
          SUNDAY: {
            enabled: false,
            from: DEFAULT_TIME_FROM,
            to: DEFAULT_TIME_TO,
          },
        },
      });
    }

    if (schedule?.type === "CUSTOM" && Array.isArray(schedule.items)) {
      const custom = {
        MONDAY: {
          enabled: false,
          from: DEFAULT_TIME_FROM,
          to: DEFAULT_TIME_TO,
        },
        TUESDAY: {
          enabled: false,
          from: DEFAULT_TIME_FROM,
          to: DEFAULT_TIME_TO,
        },
        WEDNESDAY: {
          enabled: false,
          from: DEFAULT_TIME_FROM,
          to: DEFAULT_TIME_TO,
        },
        THURSDAY: {
          enabled: false,
          from: DEFAULT_TIME_FROM,
          to: DEFAULT_TIME_TO,
        },
        FRIDAY: {
          enabled: false,
          from: DEFAULT_TIME_FROM,
          to: DEFAULT_TIME_TO,
        },
        SATURDAY: {
          enabled: false,
          from: DEFAULT_TIME_FROM,
          to: DEFAULT_TIME_TO,
        },
        SUNDAY: {
          enabled: false,
          from: DEFAULT_TIME_FROM,
          to: DEFAULT_TIME_TO,
        },
      } as Record<string, { enabled: boolean; from: string; to: string }>;

      const enabledDays: string[] = [];

      schedule.items.forEach((item: any) => {
        const dayName =
          INDEX_TO_DAY[item?.dayOfWeek as keyof typeof INDEX_TO_DAY];
        if (!dayName) {
          return;
        }

        const enabled = Boolean(item?.enabled);
        const from = enabled ? msToTime(item?.startsOn) : DEFAULT_TIME_FROM;
        const to = enabled ? msToTime(item?.endsOn) : DEFAULT_TIME_TO;

        custom[dayName] = { enabled, from, to };

        if (enabled) {
          enabledDays.push(dayName);
        }
      });

      const selectedRanges = enabledDays.map((dayName) => {
        const item = custom[dayName];
        return `${item.from}-${item.to}`;
      });
      const isSpecificMode =
        enabledDays.length > 0 && new Set(selectedRanges).size === 1;

      const firstSpecificDay = isSpecificMode ? custom[enabledDays[0]] : null;

      return JSON.stringify({
        kind: "FPL_ALARM_SCHEDULE_V1",
        mode: isSpecificMode ? "SPECIFIC_TIME" : "CUSTOM",
        timeZone: schedule.timezone || "Europe/Warsaw",
        dynamicValue: Boolean(schedule.dynamicValue?.sourceType),
        dynamicSourceType:
          schedule.dynamicValue?.sourceType || "NO_DYNAMIC_VALUE",
        sourceAttribute: schedule.dynamicValue?.sourceAttribute || "",
        specificDays: isSpecificMode ? enabledDays : [],
        specificFrom: firstSpecificDay?.from || DEFAULT_TIME_FROM,
        specificTo: firstSpecificDay?.to || DEFAULT_TIME_TO,
        custom,
      });
    }

    return JSON.stringify(rawSchedule);
  } catch {
    return ACTIVE_ALL_TIME;
  }
};

const normalizeAlarmRules = (alarms: any[] | undefined): AlarmRule[] =>
  (alarms ?? []).map((alarm) => ({
    id: createId("alarm"),
    backendId: alarm?.id,
    name: alarm?.alarmType ?? alarm?.name ?? "",
    createRuleConditions:
      alarm?.createRules && typeof alarm.createRules === "object"
        ? Object.entries(alarm.createRules).map(([severity, payload]) => ({
            id: createId("create-condition"),
            severity: (severity as AlarmSeverity) ?? "CRITICAL",
            condition: toEditorConditionValue((payload as any)?.condition),
            schedule: toEditorScheduleValue((payload as any)?.schedule),
            additionalInfo: "",
          }))
        : (alarm?.createRuleConditions ?? []).map((condition: any) => ({
            id: createId("create-condition"),
            severity: (condition?.severity as AlarmSeverity) ?? "CRITICAL",
            condition: condition?.condition ?? "",
            schedule: condition?.schedule ?? ACTIVE_ALL_TIME,
            additionalInfo: condition?.additionalInfo ?? "",
          })),
    clearRuleConditions:
      alarm?.clearRule != null
        ? [
            {
              id: createId("clear-condition"),
              condition: toEditorConditionValue(alarm.clearRule?.condition),
              schedule: toEditorScheduleValue(alarm.clearRule?.schedule),
              additionalInfo: "",
            },
          ]
        : (alarm?.clearRuleConditions ?? []).map((condition: any) => ({
            id: createId("clear-condition"),
            condition: condition?.condition ?? "",
            schedule: condition?.schedule ?? ACTIVE_ALL_TIME,
            additionalInfo: condition?.additionalInfo ?? "",
          })),
  }));

export function DeviceProfileAlarmRulesTabContent({
  profileId,
}: DeviceProfileAlarmRulesTabContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [alarmRules, setAlarmRules] = useState<AlarmRule[]>([]);
  const [expandedAlarmIds, setExpandedAlarmIds] = useState<Set<string>>(
    new Set(),
  );
  const [expandedCreateConditionIds, setExpandedCreateConditionIds] = useState<
    Set<string>
  >(new Set());

  const {
    data: profile,
    isLoading,
    mutate,
  } = useSWR(profileId ? ["deviceProfileAlarms", profileId] : null, async () =>
    DeviceService.fetchDeviceProfile(profileId),
  );

  useEffect(() => {
    if (isEditing) {
      return;
    }

    if (!profile) {
      return;
    }

    const nextAlarmRules = normalizeAlarmRules(
      profile.profileData?.alarms as any[] | undefined,
    );
    setAlarmRules(nextAlarmRules);
    setExpandedAlarmIds(new Set(nextAlarmRules.map((alarm) => alarm.id)));
    setExpandedCreateConditionIds(
      new Set(
        nextAlarmRules.flatMap((alarm) =>
          alarm.createRuleConditions.map((condition) => condition.id),
        ),
      ),
    );
  }, [isEditing, profile]);

  const filteredRules = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return alarmRules;
    }

    return alarmRules.filter((rule) => {
      const name = String(rule.name ?? "").toLowerCase();
      const createConditions = JSON.stringify(
        rule.createRuleConditions,
      ).toLowerCase();
      const clearConditions = JSON.stringify(
        rule.clearRuleConditions,
      ).toLowerCase();

      return (
        name.includes(query) ||
        createConditions.includes(query) ||
        clearConditions.includes(query)
      );
    });
  }, [alarmRules, searchQuery]);

  const getNextAvailableSeverity = (alarm: AlarmRule): AlarmSeverity | null => {
    const used = new Set(
      alarm.createRuleConditions.map((item) => item.severity),
    );
    const available = SEVERITY_OPTIONS.find(
      (option) => !used.has(option.value),
    );
    return available?.value ?? null;
  };

  const hasAvailableCreateSeverity = (alarm: AlarmRule) =>
    getNextAvailableSeverity(alarm) !== null;

  const getCreateSeverityOptions = (
    alarm: AlarmRule,
    currentConditionId: string,
  ) => {
    const usedByOther = new Set(
      alarm.createRuleConditions
        .filter((condition) => condition.id !== currentConditionId)
        .map((condition) => condition.severity),
    );

    return SEVERITY_OPTIONS.map((option) => ({
      value: option.value,
      label: option.label,
      disabled: usedByOther.has(option.value),
    }));
  };

  const addAlarmRule = () => {
    const newAlarm: AlarmRule = {
      id: createId("alarm"),
      name: "",
      createRuleConditions: [],
      clearRuleConditions: [],
    };

    setAlarmRules((prev) => [...prev, newAlarm]);
    setExpandedAlarmIds((prev) => new Set([...prev, newAlarm.id]));
  };

  const deleteAlarmRule = (alarmId: string) => {
    setAlarmRules((prev) => prev.filter((alarm) => alarm.id !== alarmId));
    setExpandedAlarmIds((prev) => {
      const next = new Set(prev);
      next.delete(alarmId);
      return next;
    });
  };

  const toggleAlarmExpanded = (alarmId: string) => {
    setExpandedAlarmIds((prev) => {
      const next = new Set(prev);
      if (next.has(alarmId)) {
        next.delete(alarmId);
      } else {
        next.add(alarmId);
      }
      return next;
    });
  };

  const updateAlarmRule = <K extends keyof AlarmRule>(
    alarmId: string,
    field: K,
    value: AlarmRule[K],
  ) => {
    setAlarmRules((prev) =>
      prev.map((alarm) =>
        alarm.id === alarmId ? { ...alarm, [field]: value } : alarm,
      ),
    );
  };

  const addCreateCondition = (alarmId: string) => {
    const newConditionId = createId("create-condition");

    setAlarmRules((prev) =>
      prev.map((alarm) => {
        if (alarm.id !== alarmId) {
          return alarm;
        }

        const nextSeverity = getNextAvailableSeverity(alarm);
        if (!nextSeverity) {
          return alarm;
        }

        const newCondition: CreateRuleCondition = {
          id: newConditionId,
          severity: nextSeverity,
          condition: "",
          schedule: "Active all the time",
          additionalInfo: "",
        };

        return {
          ...alarm,
          createRuleConditions: [...alarm.createRuleConditions, newCondition],
        };
      }),
    );

    setExpandedCreateConditionIds((prev) => new Set([...prev, newConditionId]));
  };

  const deleteCreateCondition = (alarmId: string, conditionId: string) => {
    setAlarmRules((prev) =>
      prev.map((alarm) =>
        alarm.id === alarmId
          ? {
              ...alarm,
              createRuleConditions: alarm.createRuleConditions.filter(
                (condition) => condition.id !== conditionId,
              ),
            }
          : alarm,
      ),
    );

    setExpandedCreateConditionIds((prev) => {
      const next = new Set(prev);
      next.delete(conditionId);
      return next;
    });
  };

  const toggleCreateConditionExpanded = (conditionId: string) => {
    setExpandedCreateConditionIds((prev) => {
      const next = new Set(prev);
      if (next.has(conditionId)) {
        next.delete(conditionId);
      } else {
        next.add(conditionId);
      }
      return next;
    });
  };

  const updateCreateCondition = <K extends keyof CreateRuleCondition>(
    alarmId: string,
    conditionId: string,
    field: K,
    value: CreateRuleCondition[K],
  ) => {
    setAlarmRules((prev) =>
      prev.map((alarm) =>
        alarm.id === alarmId
          ? {
              ...alarm,
              createRuleConditions: alarm.createRuleConditions.map(
                (condition) =>
                  condition.id === conditionId
                    ? { ...condition, [field]: value }
                    : condition,
              ),
            }
          : alarm,
      ),
    );
  };

  const addClearCondition = (alarmId: string) => {
    const newCondition: ClearRuleCondition = {
      id: createId("clear-condition"),
      condition: "",
      schedule: "Active all the time",
      additionalInfo: "",
    };

    setAlarmRules((prev) =>
      prev.map((alarm) =>
        alarm.id === alarmId
          ? {
              ...alarm,
              clearRuleConditions:
                alarm.clearRuleConditions.length === 0
                  ? [...alarm.clearRuleConditions, newCondition]
                  : alarm.clearRuleConditions,
            }
          : alarm,
      ),
    );
  };

  const deleteClearCondition = (alarmId: string, conditionId: string) => {
    setAlarmRules((prev) =>
      prev.map((alarm) =>
        alarm.id === alarmId
          ? {
              ...alarm,
              clearRuleConditions: alarm.clearRuleConditions.filter(
                (condition) => condition.id !== conditionId,
              ),
            }
          : alarm,
      ),
    );
  };

  const updateClearCondition = <K extends keyof ClearRuleCondition>(
    alarmId: string,
    conditionId: string,
    field: K,
    value: ClearRuleCondition[K],
  ) => {
    setAlarmRules((prev) =>
      prev.map((alarm) =>
        alarm.id === alarmId
          ? {
              ...alarm,
              clearRuleConditions: alarm.clearRuleConditions.map((condition) =>
                condition.id === conditionId
                  ? { ...condition, [field]: value }
                  : condition,
              ),
            }
          : alarm,
      ),
    );
  };

  const handleCancel = () => {
    const nextAlarmRules = normalizeAlarmRules(
      profile?.profileData?.alarms as any[] | undefined,
    );
    setAlarmRules(nextAlarmRules);
    setExpandedAlarmIds(new Set(nextAlarmRules.map((alarm) => alarm.id)));
    setExpandedCreateConditionIds(
      new Set(
        nextAlarmRules.flatMap((alarm) =>
          alarm.createRuleConditions.map((condition) => condition.id),
        ),
      ),
    );
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!profile) {
      return;
    }

    setIsSaving(true);
    try {
      await DeviceService.updateDeviceProfile({
        ...profile,
        profileData: {
          ...profile.profileData,
          alarms: alarmRules.map(
            ({
              id,
              backendId,
              name,
              createRuleConditions,
              clearRuleConditions,
            }) => {
              const createRules = createRuleConditions.reduce(
                (acc, condition) => {
                  acc[condition.severity] = {
                    condition: toThingsBoardCondition(condition.condition),
                    schedule: toThingsBoardSchedule(condition.schedule),
                    alarmDetails: condition.additionalInfo.trim()
                      ? { info: condition.additionalInfo.trim() }
                      : null,
                    dashboardId: null,
                  };
                  return acc;
                },
                {} as Record<string, unknown>,
              );

              const firstClearRule = clearRuleConditions[0];

              return {
                ...(backendId ? { id: backendId } : {}),
                alarmType: name,
                createRules,
                clearRule: firstClearRule
                  ? {
                      condition: toThingsBoardCondition(
                        firstClearRule.condition,
                      ),
                      schedule: toThingsBoardSchedule(firstClearRule.schedule),
                      alarmDetails: firstClearRule.additionalInfo.trim()
                        ? { info: firstClearRule.additionalInfo.trim() }
                        : null,
                      dashboardId: null,
                    }
                  : null,
                propagate: null,
                propagateRelationTypes: null,
                propagateToOwner: null,
                propagateToTenant: null,
              };
            },
          ),
        },
      });
      await mutate();
      toast.success("Alarm rules updated");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to update alarm rules",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-slate-500">Loading alarm rules...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        {!isEditing ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </>
        )}
      </div>

      {!isEditing && (
        <div className="w-full sm:w-72">
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search alarm rules..."
          />
        </div>
      )}

      {alarmRules.length === 0 && !isEditing ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          No alarm rules configured
        </div>
      ) : filteredRules.length === 0 && !isEditing ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          No alarm rules match your search.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            {(isEditing ? alarmRules : filteredRules).map((alarm) => {
              const isExpanded = expandedAlarmIds.has(alarm.id);

              return (
                <div key={alarm.id} className="rounded-lg border border-muted">
                  <div className="flex items-center justify-between bg-muted/30 p-4">
                    <div className="flex flex-1 items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleAlarmExpanded(alarm.id)}
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1 text-sm font-medium">
                        {alarm.name || "Unnamed alarm"}
                      </div>
                    </div>

                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => deleteAlarmRule(alarm.id)}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="space-y-4 border-t border-muted p-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          Alarm type*
                        </label>
                        <Input
                          value={alarm.name}
                          onChange={(e) =>
                            updateAlarmRule(alarm.id, "name", e.target.value)
                          }
                          placeholder="Enter alarm type"
                          disabled={!isEditing || isSaving}
                        />
                      </div>

                      <div>
                        <label className="mb-3 block text-sm font-medium">
                          Create alarm rules
                        </label>
                        <div className="space-y-3">
                          {alarm.createRuleConditions.map((condition) => {
                            const conditionExpanded =
                              expandedCreateConditionIds.has(condition.id);

                            return (
                              <div
                                key={condition.id}
                                className="rounded-lg border border-muted bg-muted/20"
                              >
                                <div className="flex items-center justify-between gap-3 border-b border-muted px-3 py-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleCreateConditionExpanded(
                                        condition.id,
                                      )
                                    }
                                    className="flex items-center gap-2 text-left"
                                  >
                                    {conditionExpanded ? (
                                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span className="text-sm font-medium">
                                      {SEVERITY_OPTIONS.find(
                                        (option) =>
                                          option.value === condition.severity,
                                      )?.label ?? "Condition"}
                                    </span>
                                  </button>

                                  {isEditing && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        deleteCreateCondition(
                                          alarm.id,
                                          condition.id,
                                        )
                                      }
                                      className="text-muted-foreground hover:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>

                                {conditionExpanded && (
                                  <div className="space-y-3 p-3">
                                    <div>
                                      <label className="mb-1 block text-xs font-medium">
                                        Severity
                                      </label>
                                      <Select
                                        options={getCreateSeverityOptions(
                                          alarm,
                                          condition.id,
                                        )}
                                        value={condition.severity}
                                        onValueChange={(value) =>
                                          updateCreateCondition(
                                            alarm.id,
                                            condition.id,
                                            "severity",
                                            value as AlarmSeverity,
                                          )
                                        }
                                        disabled={!isEditing || isSaving}
                                      />
                                    </div>

                                    <div>
                                      <label className="mb-1 block text-xs font-medium">
                                        Condition
                                      </label>
                                      <AlarmConditionEditor
                                        value={condition.condition}
                                        onChange={(nextValue) =>
                                          updateCreateCondition(
                                            alarm.id,
                                            condition.id,
                                            "condition",
                                            nextValue,
                                          )
                                        }
                                        disabled={!isEditing || isSaving}
                                        deviceProfileId={profileId}
                                      />
                                    </div>

                                    <div>
                                      <label className="mb-1 block text-xs font-medium">
                                        Schedule
                                      </label>
                                      <AlarmScheduleEditor
                                        value={condition.schedule}
                                        onChange={(nextValue) =>
                                          updateCreateCondition(
                                            alarm.id,
                                            condition.id,
                                            "schedule",
                                            nextValue,
                                          )
                                        }
                                        disabled={!isEditing || isSaving}
                                      />
                                    </div>

                                    <div>
                                      <label className="mb-1 block text-xs font-medium">
                                        Additional info
                                      </label>
                                      <Textarea
                                        value={condition.additionalInfo}
                                        onChange={(e) =>
                                          updateCreateCondition(
                                            alarm.id,
                                            condition.id,
                                            "additionalInfo",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="Enter additional information"
                                        disabled={!isEditing || isSaving}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {isEditing && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addCreateCondition(alarm.id)}
                            disabled={
                              isSaving || !hasAvailableCreateSeverity(alarm)
                            }
                            className="mt-2 gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Add create condition
                          </Button>
                        )}
                      </div>

                      <div>
                        <label className="mb-3 block text-sm font-medium">
                          Clear alarm rule
                        </label>

                        <div className="space-y-3">
                          {alarm.clearRuleConditions.map((condition) => (
                            <div
                              key={condition.id}
                              className="space-y-3 rounded-lg border border-muted bg-muted/20 p-3"
                            >
                              {isEditing && (
                                <div className="flex items-center justify-end">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      deleteClearCondition(
                                        alarm.id,
                                        condition.id,
                                      )
                                    }
                                    className="text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              )}

                              <div>
                                <label className="mb-1 block text-xs font-medium">
                                  Condition
                                </label>
                                <AlarmConditionEditor
                                  value={condition.condition}
                                  onChange={(nextValue) =>
                                    updateClearCondition(
                                      alarm.id,
                                      condition.id,
                                      "condition",
                                      nextValue,
                                    )
                                  }
                                  disabled={!isEditing || isSaving}
                                  deviceProfileId={profileId}
                                />
                              </div>

                              <div>
                                <label className="mb-1 block text-xs font-medium">
                                  Schedule
                                </label>
                                <AlarmScheduleEditor
                                  value={condition.schedule}
                                  onChange={(nextValue) =>
                                    updateClearCondition(
                                      alarm.id,
                                      condition.id,
                                      "schedule",
                                      nextValue,
                                    )
                                  }
                                  disabled={!isEditing || isSaving}
                                />
                              </div>

                              <div>
                                <label className="mb-1 block text-xs font-medium">
                                  Additional info
                                </label>
                                <Textarea
                                  value={condition.additionalInfo}
                                  onChange={(e) =>
                                    updateClearCondition(
                                      alarm.id,
                                      condition.id,
                                      "additionalInfo",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Enter additional information"
                                  disabled={!isEditing || isSaving}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {isEditing && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addClearCondition(alarm.id)}
                            disabled={
                              isSaving || alarm.clearRuleConditions.length >= 1
                            }
                            className="mt-2 gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Add clear condition
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {isEditing && (
            <Button
              type="button"
              onClick={addAlarmRule}
              disabled={isSaving}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add alarm rule
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
