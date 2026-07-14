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

const DEFAULT_TIME_FROM = "00:00";
const DEFAULT_TIME_TO = "12:00";

const timeToMs = (rawTime: string): number => {
  const [h, m] = rawTime.split(":").map((item) => Number(item));
  if (!Number.isFinite(h) || !Number.isFinite(m)) {
    return 0;
  }

  return (h * 60 * 60 + m * 60) * 1000;
};

const normalizeTimezone = (rawTimezone: string): string =>
  rawTimezone.split(" (")[0]?.trim() || "UTC";

export const toThingsBoardCondition = (
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
                userValue: null,
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
    // fall through
  }

  return {
    condition: [],
    spec: { type: "SIMPLE" },
  };
};

export const toThingsBoardSchedule = (rawSchedule: string): unknown => {
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

export const generateToken = (length = 20) => {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () =>
    characters.charAt(Math.floor(Math.random() * characters.length)),
  ).join("");
};

export { ACTIVE_ALL_TIME };
