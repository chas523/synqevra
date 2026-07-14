"use client";

import { AlarmConditionEditor } from "@/components/molecules/AlarmConditionEditor";
import { AlarmScheduleEditor } from "@/components/molecules/AlarmScheduleEditor";
import Select from "@/components/molecules/PortalSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

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
  name: string;
  createRuleConditions: CreateRuleCondition[];
  clearRuleConditions: ClearRuleCondition[];
};

type AlarmRulesTabProps = {
  alarmRules: AlarmRule[];
  expandedAlarmIds: Set<string>;
  expandedCreateConditionIds: Set<string>;
  severityOptions: Array<{ value: AlarmSeverity; label: string }>;
  isSaving: boolean;
  hasAvailableCreateSeverityAction: (alarm: AlarmRule) => boolean;
  getCreateSeverityOptionsAction: (
    alarm: AlarmRule,
    currentConditionId: string,
  ) => Array<{ value: AlarmSeverity; label: string; disabled: boolean }>;
  onToggleAlarmExpandedAction: (alarmId: string) => void;
  onDeleteAlarmRuleAction: (alarmId: string) => void;
  onUpdateAlarmNameAction: (alarmId: string, value: string) => void;
  onToggleCreateConditionExpandedAction: (conditionId: string) => void;
  onDeleteCreateConditionAction: (alarmId: string, conditionId: string) => void;
  onUpdateCreateConditionSeverityAction: (
    alarmId: string,
    conditionId: string,
    value: AlarmSeverity,
  ) => void;
  onUpdateCreateConditionValueAction: (
    alarmId: string,
    conditionId: string,
    field: "condition" | "schedule" | "additionalInfo",
    value: string,
  ) => void;
  onAddCreateConditionAction: (alarmId: string) => void;
  onDeleteClearConditionAction: (alarmId: string, conditionId: string) => void;
  onUpdateClearConditionValueAction: (
    alarmId: string,
    conditionId: string,
    field: "condition" | "schedule" | "additionalInfo",
    value: string,
  ) => void;
  onAddClearConditionAction: (alarmId: string) => void;
  onAddAlarmRuleAction: () => void;
};

export function AlarmRulesTab({
  alarmRules,
  expandedAlarmIds,
  expandedCreateConditionIds,
  severityOptions,
  isSaving,
  hasAvailableCreateSeverityAction: hasAvailableCreateSeverity,
  getCreateSeverityOptionsAction: getCreateSeverityOptions,
  onToggleAlarmExpandedAction: onToggleAlarmExpanded,
  onDeleteAlarmRuleAction: onDeleteAlarmRule,
  onUpdateAlarmNameAction: onUpdateAlarmName,
  onToggleCreateConditionExpandedAction: onToggleCreateConditionExpanded,
  onDeleteCreateConditionAction: onDeleteCreateCondition,
  onUpdateCreateConditionSeverityAction: onUpdateCreateConditionSeverity,
  onUpdateCreateConditionValueAction: onUpdateCreateConditionValue,
  onAddCreateConditionAction: onAddCreateCondition,
  onDeleteClearConditionAction: onDeleteClearCondition,
  onUpdateClearConditionValueAction: onUpdateClearConditionValue,
  onAddClearConditionAction: onAddClearCondition,
  onAddAlarmRuleAction: onAddAlarmRule,
}: AlarmRulesTabProps) {
  return (
    <div className="space-y-4">
      {alarmRules.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          No alarm rules configured
        </div>
      ) : (
        <div className="space-y-2">
          {alarmRules.map((alarm) => {
            const isExpanded = expandedAlarmIds.has(alarm.id);

            return (
              <div key={alarm.id} className="rounded-lg border border-muted">
                <div className="flex items-center justify-between bg-muted/30 p-4">
                  <div className="flex flex-1 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleAlarmExpanded(alarm.id)}
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

                  <button
                    type="button"
                    onClick={() => onDeleteAlarmRule(alarm.id)}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                {isExpanded && (
                  <div className="space-y-4 border-t border-muted p-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Alarm type*
                      </label>
                      <Input
                        value={alarm.name}
                        onChange={(event) =>
                          onUpdateAlarmName(alarm.id, event.target.value)
                        }
                        placeholder="Enter alarm type"
                        disabled={isSaving}
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
                                    onToggleCreateConditionExpanded(
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
                                    {severityOptions.find(
                                      (option) =>
                                        option.value === condition.severity,
                                    )?.label ?? "Condition"}
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    onDeleteCreateCondition(
                                      alarm.id,
                                      condition.id,
                                    )
                                  }
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
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
                                        onUpdateCreateConditionSeverity(
                                          alarm.id,
                                          condition.id,
                                          value as AlarmSeverity,
                                        )
                                      }
                                      disabled={isSaving}
                                    />
                                  </div>

                                  <div>
                                    <label className="mb-1 block text-xs font-medium">
                                      Condition
                                    </label>
                                    <AlarmConditionEditor
                                      value={condition.condition}
                                      onChange={(nextValue) =>
                                        onUpdateCreateConditionValue(
                                          alarm.id,
                                          condition.id,
                                          "condition",
                                          nextValue,
                                        )
                                      }
                                      disabled={isSaving}
                                    />
                                  </div>

                                  <div>
                                    <label className="mb-1 block text-xs font-medium">
                                      Schedule
                                    </label>
                                    <AlarmScheduleEditor
                                      value={condition.schedule}
                                      onChange={(nextValue) =>
                                        onUpdateCreateConditionValue(
                                          alarm.id,
                                          condition.id,
                                          "schedule",
                                          nextValue,
                                        )
                                      }
                                      disabled={isSaving}
                                    />
                                  </div>

                                  <div>
                                    <label className="mb-1 block text-xs font-medium">
                                      Additional info
                                    </label>
                                    <Textarea
                                      value={condition.additionalInfo}
                                      onChange={(event) =>
                                        onUpdateCreateConditionValue(
                                          alarm.id,
                                          condition.id,
                                          "additionalInfo",
                                          event.target.value,
                                        )
                                      }
                                      placeholder="Enter additional information"
                                      disabled={isSaving}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onAddCreateCondition(alarm.id)}
                        disabled={
                          isSaving || !hasAvailableCreateSeverity(alarm)
                        }
                        className="mt-2 gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add create condition
                      </Button>
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
                            <div className="flex items-center justify-end">
                              <button
                                type="button"
                                onClick={() =>
                                  onDeleteClearCondition(alarm.id, condition.id)
                                }
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div>
                              <label className="mb-1 block text-xs font-medium">
                                Condition
                              </label>
                              <AlarmConditionEditor
                                value={condition.condition}
                                onChange={(nextValue) =>
                                  onUpdateClearConditionValue(
                                    alarm.id,
                                    condition.id,
                                    "condition",
                                    nextValue,
                                  )
                                }
                                disabled={isSaving}
                              />
                            </div>

                            <div>
                              <label className="mb-1 block text-xs font-medium">
                                Schedule
                              </label>
                              <AlarmScheduleEditor
                                value={condition.schedule}
                                onChange={(nextValue) =>
                                  onUpdateClearConditionValue(
                                    alarm.id,
                                    condition.id,
                                    "schedule",
                                    nextValue,
                                  )
                                }
                                disabled={isSaving}
                              />
                            </div>

                            <div>
                              <label className="mb-1 block text-xs font-medium">
                                Additional info
                              </label>
                              <Textarea
                                value={condition.additionalInfo}
                                onChange={(event) =>
                                  onUpdateClearConditionValue(
                                    alarm.id,
                                    condition.id,
                                    "additionalInfo",
                                    event.target.value,
                                  )
                                }
                                placeholder="Enter additional information"
                                disabled={isSaving}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onAddClearCondition(alarm.id)}
                        disabled={
                          isSaving || alarm.clearRuleConditions.length >= 1
                        }
                        className="mt-2 gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add clear condition
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Button
        type="button"
        onClick={onAddAlarmRule}
        disabled={isSaving}
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Add alarm rule
      </Button>
    </div>
  );
}
