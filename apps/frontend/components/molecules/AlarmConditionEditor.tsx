"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Select from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DeviceService } from "@/lib/services/thingsboardServices/deviceService";

type ConditionType = "SIMPLE" | "DURATION" | "REPEATING";
type DurationUnit = "SECONDS" | "MINUTES" | "HOURS" | "DAYS";
type DynamicSourceType =
  | "NO_DYNAMIC_VALUE"
  | "CURRENT_TENANT"
  | "CURRENT_CUSTOMER"
  | "CURRENT_DEVICE";
type KeyType = "ATTRIBUTE" | "TIME_SERIES" | "CONSTANT";
type ValueType = "STRING" | "NUMERIC" | "BOOLEAN" | "DATETIME";

type StringFilterOperation =
  | "EQUAL"
  | "NOT_EQUAL"
  | "STARTS_WITH"
  | "ENDS_WITH"
  | "CONTAINS"
  | "NOT_CONTAINS"
  | "IN"
  | "NOT_IN";

type NumericFilterOperation =
  | "EQUAL"
  | "NOT_EQUAL"
  | "GREATER_THAN"
  | "LESS_THAN"
  | "GREATER_OR_EQUAL"
  | "LESS_OR_EQUAL";

type BooleanFilterOperation = "EQUAL" | "NOT_EQUAL";
type DateTimeFilterOperation = NumericFilterOperation;

type StringFilterRule = {
  id: string;
  kind: "simple";
  operation: StringFilterOperation;
  ignoreCase: boolean;
  value: string;
};

type NumericFilterRule = {
  id: string;
  kind: "simple";
  operation: NumericFilterOperation;
  value: string;
};

type BooleanFilterRule = {
  id: string;
  kind: "simple";
  operation: BooleanFilterOperation;
  value: boolean;
};

type DateTimeFilterRule = {
  id: string;
  kind: "simple";
  operation: DateTimeFilterOperation;
  value: string;
};

type ComplexFilterRule = {
  id: string;
  kind: "complex";
};

type KeyFilterRule =
  | StringFilterRule
  | NumericFilterRule
  | BooleanFilterRule
  | DateTimeFilterRule
  | ComplexFilterRule;

type KeyFilterItem = {
  id: string;
  keyType: KeyType;
  keyName: string;
  valueType: ValueType;
  filters: KeyFilterRule[];
};

type StoredDurationConfig = {
  dynamicValue: boolean;
  durationValue: string;
  timeUnit: DurationUnit;
  dynamicSourceType: DynamicSourceType;
  sourceAttribute: string;
  inheritFromOwner: boolean;
};

type StoredConditionConfig = {
  kind: "FPL_ALARM_CONDITION_V1";
  conditionType: ConditionType;
  simpleExpression?: string;
  duration?: Partial<StoredDurationConfig>;
  keyFilters?: Array<{
    keyType: KeyType;
    keyName: string;
    valueType: ValueType;
    filters?: Array<{
      kind: "simple" | "complex";
      operation?: string;
      ignoreCase?: boolean;
      value?: string | boolean | number;
    }>;
  }>;
};

type DraftState = {
  conditionType: ConditionType;
  simpleExpression: string;
  durationValue: string;
  dynamicValue: boolean;
  timeUnit: DurationUnit;
  dynamicSourceType: DynamicSourceType;
  sourceAttribute: string;
  inheritFromOwner: boolean;
  keyFilters: KeyFilterItem[];
};

type AddKeyFilterDraft = {
  keyType: KeyType;
  keyName: string;
  valueType?: ValueType;
  filtersExpanded: boolean;
  filters: KeyFilterRule[];
};

const CONDITION_TYPE_OPTIONS = [
  { value: "SIMPLE", label: "Simple" },
  { value: "DURATION", label: "Duration" },
  { value: "REPEATING", label: "Repeating" },
];

const DURATION_UNIT_OPTIONS = [
  { value: "SECONDS", label: "Seconds" },
  { value: "MINUTES", label: "Minutes" },
  { value: "HOURS", label: "Hours" },
  { value: "DAYS", label: "Days" },
];

const DYNAMIC_SOURCE_TYPE_OPTIONS = [
  { value: "NO_DYNAMIC_VALUE", label: "No dynamic value" },
  { value: "CURRENT_TENANT", label: "Current tenant" },
  { value: "CURRENT_CUSTOMER", label: "Current customer" },
  { value: "CURRENT_DEVICE", label: "Current device" },
];

const KEY_TYPE_OPTIONS: Array<{ value: KeyType; label: string }> = [
  { value: "ATTRIBUTE", label: "Attribute" },
  { value: "TIME_SERIES", label: "Time series" },
  { value: "CONSTANT", label: "Constant" },
];

const VALUE_TYPE_OPTIONS: Array<{ value: ValueType; label: string }> = [
  { value: "STRING", label: "String" },
  { value: "NUMERIC", label: "Numeric" },
  { value: "BOOLEAN", label: "Boolean" },
  { value: "DATETIME", label: "Datetime" },
];

const STRING_OPERATION_OPTIONS: Array<{
  value: StringFilterOperation;
  label: string;
}> = [
  { value: "EQUAL", label: "Equal" },
  { value: "NOT_EQUAL", label: "Not equal" },
  { value: "STARTS_WITH", label: "Starts with" },
  { value: "ENDS_WITH", label: "Ends with" },
  { value: "CONTAINS", label: "Contains" },
  { value: "NOT_CONTAINS", label: "Not contains" },
  { value: "IN", label: "In" },
  { value: "NOT_IN", label: "Not in" },
];

const NUMERIC_OPERATION_OPTIONS: Array<{
  value: NumericFilterOperation;
  label: string;
}> = [
  { value: "EQUAL", label: "Equal" },
  { value: "NOT_EQUAL", label: "Not equal" },
  { value: "GREATER_THAN", label: "Greater than" },
  { value: "LESS_THAN", label: "Less than" },
  { value: "GREATER_OR_EQUAL", label: "Greater or equal" },
  { value: "LESS_OR_EQUAL", label: "Less or equal" },
];

const BOOLEAN_OPERATION_OPTIONS: Array<{
  value: BooleanFilterOperation;
  label: string;
}> = [
  { value: "EQUAL", label: "Equal" },
  { value: "NOT_EQUAL", label: "Not equal" },
];

const DEFAULT_DRAFT: DraftState = {
  conditionType: "SIMPLE",
  simpleExpression: "",
  durationValue: "",
  dynamicValue: false,
  timeUnit: "SECONDS",
  dynamicSourceType: "NO_DYNAMIC_VALUE",
  sourceAttribute: "",
  inheritFromOwner: false,
  keyFilters: [],
};

const DEFAULT_ADD_KEY_FILTER_DRAFT = (): AddKeyFilterDraft => ({
  keyType: "ATTRIBUTE",
  keyName: "",
  valueType: undefined,
  filtersExpanded: true,
  filters: [],
});

const createClientId = () =>
  `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const cloneKeyFilterRule = (rule: KeyFilterRule): KeyFilterRule => ({
  ...rule,
});

const toAddKeyFilterDraft = (item: KeyFilterItem): AddKeyFilterDraft => ({
  keyType: item.keyType,
  keyName: item.keyName,
  valueType: item.valueType,
  filtersExpanded: true,
  filters: item.filters.map(cloneKeyFilterRule),
});

const formatOperationLabel = (
  valueType: ValueType,
  operation: string,
): string => {
  if (valueType === "STRING") {
    return (
      STRING_OPERATION_OPTIONS.find((item) => item.value === operation)
        ?.label ?? operation
    );
  }

  if (valueType === "BOOLEAN") {
    return (
      BOOLEAN_OPERATION_OPTIONS.find((item) => item.value === operation)
        ?.label ?? operation
    );
  }

  return (
    NUMERIC_OPERATION_OPTIONS.find((item) => item.value === operation)?.label ??
    operation
  );
};

const formatRulePreviewValue = (
  valueType: ValueType,
  rule: KeyFilterRule,
): string => {
  if (rule.kind === "complex") {
    return "complex";
  }

  if (valueType === "BOOLEAN") {
    return (rule as BooleanFilterRule).value ? "true" : "false";
  }

  const value = String(
    (rule as StringFilterRule | NumericFilterRule | DateTimeFilterRule).value ??
      "",
  ).trim();

  if (!value) {
    return "(empty)";
  }

  if (valueType === "STRING") {
    return `\"${value}\"`;
  }

  return value;
};

const toRulePreviewLabel = (
  item: KeyFilterItem,
  rule: KeyFilterRule,
): string => {
  if (rule.kind === "complex") {
    return `[${item.keyName}] complex`;
  }

  const operation = formatOperationLabel(
    item.valueType,
    rule.operation,
  ).toLowerCase();
  const value = formatRulePreviewValue(item.valueType, rule);
  return `[${item.keyName}] ${operation} ${value}`;
};

const isStoredConditionConfig = (
  value: unknown,
): value is StoredConditionConfig => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const config = value as Record<string, unknown>;
  return config.kind === "FPL_ALARM_CONDITION_V1";
};

const parseValueToDraft = (rawValue: string): DraftState => {
  const value = String(rawValue ?? "").trim();
  if (!value) {
    return { ...DEFAULT_DRAFT };
  }

  try {
    const parsed = JSON.parse(value);
    if (!isStoredConditionConfig(parsed)) {
      return { ...DEFAULT_DRAFT, simpleExpression: rawValue ?? "" };
    }

    return {
      conditionType: parsed.conditionType ?? "SIMPLE",
      simpleExpression: parsed.simpleExpression ?? "",
      durationValue: parsed.duration?.durationValue ?? "",
      dynamicValue: Boolean(parsed.duration?.dynamicValue),
      timeUnit: (parsed.duration?.timeUnit as DurationUnit) ?? "SECONDS",
      dynamicSourceType:
        (parsed.duration?.dynamicSourceType as DynamicSourceType) ??
        "NO_DYNAMIC_VALUE",
      sourceAttribute: parsed.duration?.sourceAttribute ?? "",
      inheritFromOwner: Boolean(parsed.duration?.inheritFromOwner),
      keyFilters: (parsed.keyFilters ?? [])
        .filter((item) => item?.keyType && item?.keyName && item?.valueType)
        .map((item) => ({
          id: createClientId(),
          keyType: item.keyType,
          keyName: item.keyName,
          valueType: item.valueType,
          filters: (item.filters ?? []).map((rule) => {
            if (rule.kind === "complex") {
              return {
                id: createClientId(),
                kind: "complex",
              } satisfies ComplexFilterRule;
            }

            if (item.valueType === "BOOLEAN") {
              return {
                id: createClientId(),
                kind: "simple",
                operation:
                  (rule.operation as BooleanFilterOperation) ?? "EQUAL",
                value: rule.value === true,
              } satisfies BooleanFilterRule;
            }

            if (item.valueType === "NUMERIC") {
              return {
                id: createClientId(),
                kind: "simple",
                operation:
                  (rule.operation as NumericFilterOperation) ?? "EQUAL",
                value: String(rule.value ?? ""),
              } satisfies NumericFilterRule;
            }

            if (item.valueType === "DATETIME") {
              return {
                id: createClientId(),
                kind: "simple",
                operation:
                  (rule.operation as DateTimeFilterOperation) ?? "EQUAL",
                value: String(rule.value ?? ""),
              } satisfies DateTimeFilterRule;
            }

            return {
              id: createClientId(),
              kind: "simple",
              operation: (rule.operation as StringFilterOperation) ?? "EQUAL",
              ignoreCase: Boolean(rule.ignoreCase),
              value: String(rule.value ?? ""),
            } satisfies StringFilterRule;
          }),
        })),
    };
  } catch {
    return { ...DEFAULT_DRAFT, simpleExpression: rawValue ?? "" };
  }
};

const toStoredValue = (draft: DraftState): string => {
  const keyFiltersPayload = draft.keyFilters.map((item) => ({
    keyType: item.keyType,
    keyName: item.keyName,
    valueType: item.valueType,
    filters: item.filters.map((rule) => {
      if (rule.kind === "complex") {
        return { kind: "complex" as const };
      }

      if (item.valueType === "BOOLEAN") {
        const typedRule = rule as BooleanFilterRule;
        return {
          kind: "simple" as const,
          operation: typedRule.operation,
          value: typedRule.value,
        };
      }

      if (item.valueType === "NUMERIC") {
        const typedRule = rule as NumericFilterRule;
        return {
          kind: "simple" as const,
          operation: typedRule.operation,
          value: typedRule.value,
        };
      }

      if (item.valueType === "DATETIME") {
        const typedRule = rule as DateTimeFilterRule;
        return {
          kind: "simple" as const,
          operation: typedRule.operation,
          value: typedRule.value,
        };
      }

      const typedRule = rule as StringFilterRule;
      return {
        kind: "simple" as const,
        operation: typedRule.operation,
        ignoreCase: typedRule.ignoreCase,
        value: typedRule.value,
      };
    }),
  }));

  const hasKeyFilters = keyFiltersPayload.length > 0;

  if (draft.conditionType === "SIMPLE") {
    if (!hasKeyFilters) {
      return draft.simpleExpression.trim();
    }

    return JSON.stringify({
      kind: "FPL_ALARM_CONDITION_V1",
      conditionType: "SIMPLE",
      simpleExpression: draft.simpleExpression,
      keyFilters: keyFiltersPayload,
    } satisfies StoredConditionConfig);
  }

  if (draft.conditionType === "DURATION") {
    const payload: StoredConditionConfig = {
      kind: "FPL_ALARM_CONDITION_V1",
      conditionType: "DURATION",
      duration: {
        dynamicValue: draft.dynamicValue,
        durationValue: draft.durationValue,
        timeUnit: draft.timeUnit,
        dynamicSourceType: draft.dynamicSourceType,
        sourceAttribute: draft.sourceAttribute,
        inheritFromOwner: draft.inheritFromOwner,
      },
      keyFilters: keyFiltersPayload,
    };
    return JSON.stringify(payload);
  }

  return JSON.stringify({
    kind: "FPL_ALARM_CONDITION_V1",
    conditionType: "REPEATING",
    keyFilters: keyFiltersPayload,
  } satisfies StoredConditionConfig);
};

const hasConfiguredCondition = (value: string) => {
  const parsed = parseValueToDraft(value);
  if (parsed.keyFilters.length > 0) {
    return true;
  }

  if (parsed.conditionType === "SIMPLE") {
    return parsed.simpleExpression.trim().length > 0;
  }

  return true;
};

const toSummary = (value: string) => {
  const parsed = parseValueToDraft(value);

  if (parsed.keyFilters.length > 0) {
    const previews = parsed.keyFilters.flatMap((item) =>
      item.filters.length === 0
        ? [`[${item.keyName}] no filters`]
        : item.filters.map((rule) => toRulePreviewLabel(item, rule)),
    );

    if (previews.length <= 2) {
      return previews.join(" and ");
    }

    return `${previews.slice(0, 2).join(" and ")} and ${previews.length - 2} more`;
  }

  if (parsed.conditionType === "SIMPLE") {
    return parsed.simpleExpression.trim()
      ? `Simple: ${parsed.simpleExpression}`
      : "Simple condition not configured";
  }

  if (parsed.conditionType === "DURATION") {
    if (parsed.dynamicValue) {
      const source = DYNAMIC_SOURCE_TYPE_OPTIONS.find(
        (item) => item.value === parsed.dynamicSourceType,
      )?.label;
      const withAttribute = parsed.sourceAttribute.trim()
        ? ` (${parsed.sourceAttribute.trim()})`
        : "";
      return `Duration: ${source ?? "Dynamic"}${withAttribute}`;
    }

    const unit = DURATION_UNIT_OPTIONS.find(
      (item) => item.value === parsed.timeUnit,
    )?.label;

    return `Duration: ${parsed.durationValue || "-"} ${unit ?? "Seconds"}`;
  }

  return "Repeating condition";
};

export interface AlarmConditionEditorProps {
  value: string;
  onChange: (nextValue: string) => void;
  disabled?: boolean;
  deviceProfileId?: string;
}

export function AlarmConditionEditor({
  value,
  onChange,
  disabled = false,
  deviceProfileId,
}: AlarmConditionEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<DraftState>(DEFAULT_DRAFT);
  const [isKeyFiltersExpanded, setIsKeyFiltersExpanded] = useState(true);
  const [isFilterPreviewExpanded, setIsFilterPreviewExpanded] = useState(false);
  const [isAddKeyFilterDialogOpen, setIsAddKeyFilterDialogOpen] =
    useState(false);
  const [editingKeyFilterId, setEditingKeyFilterId] = useState<string | null>(
    null,
  );
  const [addKeyFilterDraft, setAddKeyFilterDraft] = useState<AddKeyFilterDraft>(
    DEFAULT_ADD_KEY_FILTER_DRAFT(),
  );
  const [hasRequestedKeyNames, setHasRequestedKeyNames] = useState(false);

  const shouldFetchAttributeKeys =
    isAddKeyFilterDialogOpen &&
    hasRequestedKeyNames &&
    addKeyFilterDraft.keyType === "ATTRIBUTE" &&
    Boolean(deviceProfileId);

  const shouldFetchTimeSeriesKeys =
    isAddKeyFilterDialogOpen &&
    hasRequestedKeyNames &&
    addKeyFilterDraft.keyType === "TIME_SERIES" &&
    Boolean(deviceProfileId);

  const {
    data: attributeKeys,
    isLoading: isAttributeKeysLoading,
    error: attributeKeysError,
  } = useSWR(
    shouldFetchAttributeKeys
      ? ["conditionAttributeKeys", deviceProfileId]
      : null,
    async () =>
      DeviceService.fetchDeviceProfileAttributeKeys(
        deviceProfileId!,
        "SERVER_SCOPE",
      ),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 5 * 60 * 1000,
    },
  );

  const {
    data: timeSeriesKeys,
    isLoading: isTimeSeriesKeysLoading,
    error: timeSeriesKeysError,
  } = useSWR(
    shouldFetchTimeSeriesKeys
      ? ["conditionTimeseriesKeys", deviceProfileId]
      : null,
    async () =>
      DeviceService.fetchDeviceProfileLatestTelemetryKeys(deviceProfileId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 5 * 60 * 1000,
    },
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDraft(parseValueToDraft(value));
    setIsKeyFiltersExpanded(true);
    setIsFilterPreviewExpanded(false);
  }, [isOpen, value]);

  const summary = useMemo(() => toSummary(value), [value]);
  const isConfigured = useMemo(() => hasConfiguredCondition(value), [value]);

  const showInheritFromOwner =
    draft.dynamicValue &&
    (draft.dynamicSourceType === "CURRENT_CUSTOMER" ||
      draft.dynamicSourceType === "CURRENT_DEVICE");

  const keyNameOptions =
    addKeyFilterDraft.keyType === "ATTRIBUTE"
      ? (attributeKeys ?? []).map((key) => ({ value: key, label: key }))
      : (timeSeriesKeys ?? []).map((key) => ({ value: key, label: key }));

  const addSimpleFilterRule = () => {
    const id = createClientId();
    setAddKeyFilterDraft((prev) => {
      if (!prev.valueType) {
        return prev;
      }

      if (prev.valueType === "STRING") {
        return {
          ...prev,
          filters: [
            ...prev.filters,
            {
              id,
              kind: "simple",
              operation: "EQUAL",
              ignoreCase: false,
              value: "",
            } satisfies StringFilterRule,
          ],
        };
      }

      if (prev.valueType === "NUMERIC") {
        return {
          ...prev,
          filters: [
            ...prev.filters,
            {
              id,
              kind: "simple",
              operation: "EQUAL",
              value: "",
            } satisfies NumericFilterRule,
          ],
        };
      }

      if (prev.valueType === "BOOLEAN") {
        return {
          ...prev,
          filters: [
            ...prev.filters,
            {
              id,
              kind: "simple",
              operation: "EQUAL",
              value: false,
            } satisfies BooleanFilterRule,
          ],
        };
      }

      return {
        ...prev,
        filters: [
          ...prev.filters,
          {
            id,
            kind: "simple",
            operation: "EQUAL",
            value: "",
          } satisfies DateTimeFilterRule,
        ],
      };
    });
  };

  const addComplexFilterRule = () => {
    setAddKeyFilterDraft((prev) => ({
      ...prev,
      filters: [...prev.filters, { id: createClientId(), kind: "complex" }],
    }));
  };

  const removeFilterRule = (id: string) => {
    setAddKeyFilterDraft((prev) => ({
      ...prev,
      filters: prev.filters.filter((item) => item.id !== id),
    }));
  };

  const removeKeyFilter = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      keyFilters: prev.keyFilters.filter((item) => item.id !== id),
    }));
  };

  const editKeyFilter = (item: KeyFilterItem) => {
    setAddKeyFilterDraft(toAddKeyFilterDraft(item));
    setEditingKeyFilterId(item.id);
    setHasRequestedKeyNames(false);
    setIsAddKeyFilterDialogOpen(true);
  };

  const applyNewKeyFilter = () => {
    if (!addKeyFilterDraft.keyType) {
      return;
    }

    if (!addKeyFilterDraft.keyName.trim()) {
      return;
    }

    const selectedValueType = addKeyFilterDraft.valueType;

    if (!selectedValueType) {
      return;
    }

    setDraft((prev) => {
      const nextItem: KeyFilterItem = {
        id: editingKeyFilterId ?? createClientId(),
        keyType: addKeyFilterDraft.keyType,
        keyName: addKeyFilterDraft.keyName.trim(),
        valueType: selectedValueType,
        filters: addKeyFilterDraft.filters.map(cloneKeyFilterRule),
      };

      if (!editingKeyFilterId) {
        return {
          ...prev,
          keyFilters: [...prev.keyFilters, nextItem],
        };
      }

      return {
        ...prev,
        keyFilters: prev.keyFilters.map((item) =>
          item.id === editingKeyFilterId ? nextItem : item,
        ),
      };
    });

    setAddKeyFilterDraft(DEFAULT_ADD_KEY_FILTER_DRAFT());
    setEditingKeyFilterId(null);
    setIsAddKeyFilterDialogOpen(false);
    setHasRequestedKeyNames(false);
  };

  const previewItems = useMemo(
    () =>
      draft.keyFilters.flatMap((item) =>
        item.filters.length === 0
          ? [`[${item.keyName}] no filters`]
          : item.filters.map((rule) => toRulePreviewLabel(item, rule)),
      ),
    [draft.keyFilters],
  );

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        className={[
          "w-full justify-start",
          !isConfigured &&
            "border-amber-500 text-amber-700 hover:text-amber-700",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className="block w-full truncate text-left">
          {isConfigured ? summary : "Condition not configured"}
        </span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Condition</DialogTitle>
            <DialogDescription>
              Configure condition type, key filters and filter preview.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Condition type</label>
              <Select
                options={CONDITION_TYPE_OPTIONS}
                value={draft.conditionType}
                onValueChange={(next) =>
                  setDraft((prev) => ({
                    ...prev,
                    conditionType: (next as ConditionType) ?? "SIMPLE",
                  }))
                }
              />
            </div>

            <div className="rounded-lg border border-muted">
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left"
                onClick={() => setIsKeyFiltersExpanded((prev) => !prev)}
              >
                <span className="text-sm font-medium">Key filters</span>
                {isKeyFiltersExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {isKeyFiltersExpanded && (
                <div className="space-y-3 border-t border-muted px-3 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Configure key filters.
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                        setAddKeyFilterDraft(DEFAULT_ADD_KEY_FILTER_DRAFT());
                        setEditingKeyFilterId(null);
                        setHasRequestedKeyNames(false);
                        setIsAddKeyFilterDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add key filter
                    </Button>
                  </div>

                  {draft.keyFilters.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No key filters added.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {draft.keyFilters.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-md border border-muted bg-muted/20 px-3 py-2"
                        >
                          <div className="text-sm font-medium">
                            {KEY_TYPE_OPTIONS.find(
                              (o) => o.value === item.keyType,
                            )?.label ?? item.keyType}
                            {" - "}
                            {item.keyName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {VALUE_TYPE_OPTIONS.find(
                              (o) => o.value === item.valueType,
                            )?.label ?? item.valueType}
                            {" | "}
                            {item.filters.length} filters
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 gap-1"
                              onClick={() => editKeyFilter(item)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 gap-1 text-destructive hover:text-destructive"
                              onClick={() => removeKeyFilter(item.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-muted">
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left"
                onClick={() => setIsFilterPreviewExpanded((prev) => !prev)}
              >
                <span className="text-sm font-medium">Filter preview</span>
                {isFilterPreviewExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {isFilterPreviewExpanded && (
                <div className="space-y-3 border-t border-muted px-3 py-3">
                  {previewItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No filter previews yet.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {previewItems.map((label, index) => (
                        <div
                          key={`${label}-${index}`}
                          className="rounded-md border border-muted bg-muted/20 px-2.5 py-1.5 text-xs font-medium"
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {draft.conditionType === "DURATION" && (
              <div className="space-y-4 rounded-lg border border-muted bg-muted/20 p-3">
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
                  {!draft.dynamicValue ? (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Duration value
                      </label>
                      <Input
                        value={draft.durationValue}
                        onChange={(event) =>
                          setDraft((prev) => ({
                            ...prev,
                            durationValue: event.target.value,
                          }))
                        }
                        placeholder="Enter duration"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Dynamic source type
                      </label>
                      <Select
                        options={DYNAMIC_SOURCE_TYPE_OPTIONS}
                        value={draft.dynamicSourceType}
                        onValueChange={(next) =>
                          setDraft((prev) => ({
                            ...prev,
                            dynamicSourceType:
                              (next as DynamicSourceType) ?? "NO_DYNAMIC_VALUE",
                            inheritFromOwner:
                              next === "CURRENT_CUSTOMER" ||
                              next === "CURRENT_DEVICE"
                                ? prev.inheritFromOwner
                                : false,
                          }))
                        }
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time unit</label>
                    <Select
                      options={DURATION_UNIT_OPTIONS}
                      value={draft.timeUnit}
                      onValueChange={(next) =>
                        setDraft((prev) => ({
                          ...prev,
                          timeUnit: (next as DurationUnit) ?? "SECONDS",
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-md border border-muted px-3 py-2">
                  <label className="text-sm font-medium">Dynamic value</label>
                  <Switch
                    checked={draft.dynamicValue}
                    onCheckedChange={(checked) =>
                      setDraft((prev) => ({
                        ...prev,
                        dynamicValue: checked,
                      }))
                    }
                  />
                </div>

                {draft.dynamicValue && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Source attribute
                    </label>
                    <Input
                      value={draft.sourceAttribute}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          sourceAttribute: event.target.value,
                        }))
                      }
                      placeholder="Enter source attribute"
                    />
                  </div>
                )}

                {showInheritFromOwner && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="condition-inherit-from-owner"
                      checked={draft.inheritFromOwner}
                      onCheckedChange={(checked) =>
                        setDraft((prev) => ({
                          ...prev,
                          inheritFromOwner: Boolean(checked),
                        }))
                      }
                    />
                    <label
                      htmlFor="condition-inherit-from-owner"
                      className="text-sm"
                    >
                      Inherit from owner
                    </label>
                  </div>
                )}
              </div>
            )}

            {draft.conditionType === "REPEATING" && (
              <div className="rounded-lg border border-muted bg-muted/20 p-3 text-sm text-muted-foreground">
                Repeating condition details will be configured in the next step.
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
              onClick={() => {
                onChange(toStoredValue(draft));
                setIsOpen(false);
              }}
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isAddKeyFilterDialogOpen}
        onOpenChange={(nextOpen) => {
          setIsAddKeyFilterDialogOpen(nextOpen);
          if (!nextOpen) {
            setAddKeyFilterDraft(DEFAULT_ADD_KEY_FILTER_DRAFT());
            setEditingKeyFilterId(null);
            setHasRequestedKeyNames(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingKeyFilterId ? "Edit key filter" : "Add key filter"}
            </DialogTitle>
            <DialogDescription>
              Configure key type, key name, value type and filters.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Key attribute</label>
              <Select
                options={KEY_TYPE_OPTIONS}
                value={addKeyFilterDraft.keyType}
                onValueChange={(next) => {
                  setAddKeyFilterDraft((prev) => ({
                    ...prev,
                    keyType: (next as KeyType) ?? "ATTRIBUTE",
                    keyName: "",
                  }));
                  setHasRequestedKeyNames(false);
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Key name</label>
              {addKeyFilterDraft.keyType === "CONSTANT" ||
              addKeyFilterDraft.valueType === "STRING" ? (
                <Input
                  value={addKeyFilterDraft.keyName}
                  onChange={(event) =>
                    setAddKeyFilterDraft((prev) => ({
                      ...prev,
                      keyName: event.target.value,
                    }))
                  }
                  placeholder="Enter key name"
                />
              ) : !deviceProfileId ? (
                <>
                  <Input
                    value={addKeyFilterDraft.keyName}
                    onChange={(event) =>
                      setAddKeyFilterDraft((prev) => ({
                        ...prev,
                        keyName: event.target.value,
                      }))
                    }
                    placeholder="Enter key name"
                  />
                  <p className="text-xs text-muted-foreground">
                    Key list is unavailable before profile is created, so enter
                    key name manually.
                  </p>
                </>
              ) : (
                <>
                  <Select
                    options={keyNameOptions}
                    value={addKeyFilterDraft.keyName}
                    onOpenChange={(open) => {
                      if (open) {
                        setHasRequestedKeyNames(true);
                      }
                    }}
                    onValueChange={(next) =>
                      setAddKeyFilterDraft((prev) => ({
                        ...prev,
                        keyName: next,
                      }))
                    }
                    placeholder={
                      addKeyFilterDraft.keyType === "ATTRIBUTE"
                        ? isAttributeKeysLoading
                          ? "Loading attribute keys..."
                          : "Select attribute key"
                        : isTimeSeriesKeysLoading
                          ? "Loading time series keys..."
                          : "Select time series key"
                    }
                    emptyMessage="No keys found"
                    disabled={isAttributeKeysLoading || isTimeSeriesKeysLoading}
                  />

                  {attributeKeysError &&
                    addKeyFilterDraft.keyType === "ATTRIBUTE" && (
                      <p className="text-xs text-red-600">
                        Could not load attribute keys.
                      </p>
                    )}
                  {timeSeriesKeysError &&
                    addKeyFilterDraft.keyType === "TIME_SERIES" && (
                      <p className="text-xs text-red-600">
                        Could not load time series keys.
                      </p>
                    )}
                </>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Value type</label>
              <Select
                options={VALUE_TYPE_OPTIONS}
                value={addKeyFilterDraft.valueType}
                onValueChange={(next) =>
                  setAddKeyFilterDraft((prev) => ({
                    ...prev,
                    valueType: (next as ValueType) || undefined,
                    filtersExpanded: true,
                    filters: [],
                  }))
                }
              />
            </div>

            {addKeyFilterDraft.valueType && (
              <div className="rounded-lg border border-muted">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-2 text-left"
                  onClick={() =>
                    setAddKeyFilterDraft((prev) => ({
                      ...prev,
                      filtersExpanded: !prev.filtersExpanded,
                    }))
                  }
                >
                  <span className="text-sm font-medium">Filters</span>
                  {addKeyFilterDraft.filtersExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                {addKeyFilterDraft.filtersExpanded && (
                  <div className="space-y-3 border-t border-muted px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2"
                        onClick={addSimpleFilterRule}
                      >
                        <Plus className="h-4 w-4" />
                        Add
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2"
                        onClick={addComplexFilterRule}
                      >
                        <Plus className="h-4 w-4" />
                        Add complex
                      </Button>
                    </div>

                    {addKeyFilterDraft.filters.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No filters added.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {addKeyFilterDraft.filters.map((rule) => (
                          <div
                            key={rule.id}
                            className="space-y-3 rounded-md border border-muted bg-muted/20 p-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-xs font-medium uppercase text-muted-foreground">
                                {rule.kind === "complex" ? "Complex" : "Simple"}
                              </div>
                              <button
                                type="button"
                                className="text-muted-foreground hover:text-destructive"
                                onClick={() => removeFilterRule(rule.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            {rule.kind === "complex" ? (
                              <p className="text-sm text-muted-foreground">
                                Complex filter details will be added next.
                              </p>
                            ) : addKeyFilterDraft.valueType === "STRING" ? (
                              <div className="grid gap-3 md:grid-cols-3">
                                <div className="space-y-1">
                                  <label className="text-xs font-medium">
                                    Operation
                                  </label>
                                  <Select
                                    options={STRING_OPERATION_OPTIONS}
                                    value={(rule as StringFilterRule).operation}
                                    onValueChange={(next) =>
                                      setAddKeyFilterDraft((prev) => ({
                                        ...prev,
                                        filters: prev.filters.map((current) =>
                                          current.id === rule.id
                                            ? {
                                                ...(current as StringFilterRule),
                                                operation:
                                                  (next as StringFilterOperation) ??
                                                  "EQUAL",
                                              }
                                            : current,
                                        ),
                                      }))
                                    }
                                  />
                                </div>
                                <div className="flex items-center">
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      id={`ignore-case-${rule.id}`}
                                      checked={
                                        (rule as StringFilterRule).ignoreCase
                                      }
                                      onCheckedChange={(checked) =>
                                        setAddKeyFilterDraft((prev) => ({
                                          ...prev,
                                          filters: prev.filters.map(
                                            (current) =>
                                              current.id === rule.id
                                                ? {
                                                    ...(current as StringFilterRule),
                                                    ignoreCase:
                                                      Boolean(checked),
                                                  }
                                                : current,
                                          ),
                                        }))
                                      }
                                    />
                                    <label
                                      htmlFor={`ignore-case-${rule.id}`}
                                      className="text-sm"
                                    >
                                      Ignore case
                                    </label>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs font-medium">
                                    Value
                                  </label>
                                  <Input
                                    value={(rule as StringFilterRule).value}
                                    onChange={(event) =>
                                      setAddKeyFilterDraft((prev) => ({
                                        ...prev,
                                        filters: prev.filters.map((current) =>
                                          current.id === rule.id
                                            ? {
                                                ...(current as StringFilterRule),
                                                value: event.target.value,
                                              }
                                            : current,
                                        ),
                                      }))
                                    }
                                    placeholder="Enter value"
                                  />
                                </div>
                              </div>
                            ) : addKeyFilterDraft.valueType === "NUMERIC" ? (
                              <div className="grid gap-3 md:grid-cols-2">
                                <div className="space-y-1">
                                  <label className="text-xs font-medium">
                                    Operation
                                  </label>
                                  <Select
                                    options={NUMERIC_OPERATION_OPTIONS}
                                    value={
                                      (rule as NumericFilterRule).operation
                                    }
                                    onValueChange={(next) =>
                                      setAddKeyFilterDraft((prev) => ({
                                        ...prev,
                                        filters: prev.filters.map((current) =>
                                          current.id === rule.id
                                            ? {
                                                ...(current as NumericFilterRule),
                                                operation:
                                                  (next as NumericFilterOperation) ??
                                                  "EQUAL",
                                              }
                                            : current,
                                        ),
                                      }))
                                    }
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs font-medium">
                                    Value
                                  </label>
                                  <Input
                                    type="number"
                                    value={(rule as NumericFilterRule).value}
                                    onChange={(event) =>
                                      setAddKeyFilterDraft((prev) => ({
                                        ...prev,
                                        filters: prev.filters.map((current) =>
                                          current.id === rule.id
                                            ? {
                                                ...(current as NumericFilterRule),
                                                value: event.target.value,
                                              }
                                            : current,
                                        ),
                                      }))
                                    }
                                    placeholder="Enter numeric value"
                                  />
                                </div>
                              </div>
                            ) : addKeyFilterDraft.valueType === "BOOLEAN" ? (
                              <div className="grid gap-3 md:grid-cols-2">
                                <div className="space-y-1">
                                  <label className="text-xs font-medium">
                                    Operation
                                  </label>
                                  <Select
                                    options={BOOLEAN_OPERATION_OPTIONS}
                                    value={
                                      (rule as BooleanFilterRule).operation
                                    }
                                    onValueChange={(next) =>
                                      setAddKeyFilterDraft((prev) => ({
                                        ...prev,
                                        filters: prev.filters.map((current) =>
                                          current.id === rule.id
                                            ? {
                                                ...(current as BooleanFilterRule),
                                                operation:
                                                  (next as BooleanFilterOperation) ??
                                                  "EQUAL",
                                              }
                                            : current,
                                        ),
                                      }))
                                    }
                                  />
                                </div>
                                <div className="flex items-end">
                                  <div className="flex items-center justify-between rounded-md border border-muted px-3 py-2 w-full">
                                    <span className="text-sm">Value</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">
                                        {(rule as BooleanFilterRule).value
                                          ? "True"
                                          : "False"}
                                      </span>
                                      <Switch
                                        checked={
                                          (rule as BooleanFilterRule).value
                                        }
                                        onCheckedChange={(checked) =>
                                          setAddKeyFilterDraft((prev) => ({
                                            ...prev,
                                            filters: prev.filters.map(
                                              (current) =>
                                                current.id === rule.id
                                                  ? {
                                                      ...(current as BooleanFilterRule),
                                                      value: checked,
                                                    }
                                                  : current,
                                            ),
                                          }))
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="grid gap-3 md:grid-cols-2">
                                <div className="space-y-1">
                                  <label className="text-xs font-medium">
                                    Operation
                                  </label>
                                  <Select
                                    options={NUMERIC_OPERATION_OPTIONS}
                                    value={
                                      (rule as DateTimeFilterRule).operation
                                    }
                                    onValueChange={(next) =>
                                      setAddKeyFilterDraft((prev) => ({
                                        ...prev,
                                        filters: prev.filters.map((current) =>
                                          current.id === rule.id
                                            ? {
                                                ...(current as DateTimeFilterRule),
                                                operation:
                                                  (next as DateTimeFilterOperation) ??
                                                  "EQUAL",
                                              }
                                            : current,
                                        ),
                                      }))
                                    }
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs font-medium">
                                    Value
                                  </label>
                                  <Input
                                    type="datetime-local"
                                    value={(rule as DateTimeFilterRule).value}
                                    onChange={(event) =>
                                      setAddKeyFilterDraft((prev) => ({
                                        ...prev,
                                        filters: prev.filters.map((current) =>
                                          current.id === rule.id
                                            ? {
                                                ...(current as DateTimeFilterRule),
                                                value: event.target.value,
                                              }
                                            : current,
                                        ),
                                      }))
                                    }
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddKeyFilterDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={
                !addKeyFilterDraft.keyType ||
                !addKeyFilterDraft.keyName.trim() ||
                !addKeyFilterDraft.valueType
              }
              onClick={applyNewKeyFilter}
            >
              {editingKeyFilterId ? "Save key filter" : "Add key filter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
