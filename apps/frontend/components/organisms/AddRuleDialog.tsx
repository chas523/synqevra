"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NotificationService } from "@/lib/services/thingsboardServices/notificationService";
import { Bell, ChevronRight, Loader2, Plus, X, Pencil } from "lucide-react";
import { toast } from "sonner";
import { CreateRecipientGroupDialog } from "./CreateRecipientGroupDialog";
import { MultiSelect } from "@/components/ui/multi-select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

interface AddRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type Step = 1 | 2 | 3;

const TRIGGER_TYPES = [
  { value: "ENTITIES_LIMIT", label: "Entities Limit" },
  { value: "API_USAGE_LIMIT", label: "API Usage Limit" },
  { value: "NEW_PLATFORM_VERSION", label: "New Platform Version" },
  { value: "RATE_LIMITS", label: "Exceeded Rate Limits" },
  { value: "TASK_PROCESSING_FAILURE", label: "Task Processing Failure" },
  { value: "RESOURCES_SHORTAGE", label: "Resources Shortage" },
];

const API_FEATURES = [
  { value: "TRANSPORT", label: "Device API" },
  { value: "DB", label: "Telemetry persistence" },
  { value: "RE", label: "Rule Engine executions" },
  { value: "JS", label: "JavaScript executions" },
  { value: "TBEL", label: "TBEL executions" },
  { value: "EMAIL", label: "Email messages" },
  { value: "SMS", label: "SMS messages" },
];

const NOTIFY_ON = [
  { value: "ENABLED", label: "Enabled" },
  { value: "WARNING", label: "Warning" },
  { value: "DISABLED", label: "Disabled" },
];

const RATE_LIMIT_OPTIONS = [
  {
    value: "REST_REQUESTS_PER_TENANT",
    label: "REST API requests per customer",
  },
  { value: "REST_REQUESTS_PER_CUSTOMER", label: "REST API requests" },
  { value: "WS_UPDATES_PER_SESSION", label: "WS updates per session" },
  {
    value: "CASSANDRA_WRITE_QUERIES_CORE",
    label: "Rest API Cassandra write queries",
  },
  {
    value: "CASSANDRA_READ_QUERIES_CORE",
    label: "Rest API and WS telemetry Cassandra read queries",
  },
  {
    value: "CASSANDRA_WRITE_QUERIES_RULE_ENGINE",
    label: "Rule Engine telemetry Cassandra write queries",
  },
  {
    value: "CASSANDRA_READ_QUERIES_RULE_ENGINE",
    label: "Rule Engine telemetry Cassandra read queries",
  },
  {
    value: "CASSANDRA_WRITE_QUERIES_MONOLITH",
    label: "Monolith telemetry Cassandra write queries",
  },
  {
    value: "CASSANDRA_READ_QUERIES_MONOLITH",
    label: "Monolith telemetry Cassandra read queries",
  },
  { value: "TRANSPORT_MESSAGES_PER_TENANT", label: "Transport messages" },
  {
    value: "TRANSPORT_MESSAGES_PER_DEVICE",
    label: "Transport messages per device",
  },
  {
    value: "TRANSPORT_MESSAGES_PER_GATEWAY",
    label: "Transport messages per gateway",
  },
  {
    value: "TRANSPORT_MESSAGES_PER_GATEWAY_DEVICE",
    label: "Transport messages per gateway device",
  },
  { value: "EDGE_EVENTS", label: "Edge events" },
  { value: "EDGE_EVENTS_PER_EDGE", label: "Edge events per edge" },
  { value: "EDGE_UPLINK_MESSAGES", label: "Edge uplink messages" },
  {
    value: "EDGE_UPLINK_MESSAGES_PER_EDGE",
    label: "Edge uplink messages per edge",
  },
  { value: "ENTITY_EXPORT", label: "Entity version creation" },
  { value: "ENTITY_IMPORT", label: "Entity version load" },
  { value: "NOTIFICATION_REQUESTS", label: "Notification requests" },
  {
    value: "NOTIFICATION_REQUESTS_PER_RULE",
    label: "Notification requests per rule",
  },
];

export const AddRuleDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: AddRuleDialogProps) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Rule Details
  const [name, setName] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [description, setDescription] = useState("");

  // Step 2: Trigger
  const [triggerType, setTriggerType] = useState<string>("");
  // API Usage Limit specific
  const [apiFeatures, setApiFeatures] = useState<string[]>([]);
  const [notifyOn, setNotifyOn] = useState<string[]>([]);
  // Rate Limits specific
  const [rateLimitApis, setRateLimitApis] = useState<string[]>([]);
  // Generic
  const [triggerConfig, setTriggerConfig] = useState<any>({});

  // Step 3: Template & Recipients
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  const [recipientGroups, setRecipientGroups] = useState<any[]>([]);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>(
    [],
  );
  const [isLoadingTargets, setIsLoadingTargets] = useState(false);
  const [showCreateRecipientDialog, setShowCreateRecipientDialog] =
    useState(false);

  useEffect(() => {
    if (open) {
      resetForm();
      loadRecipientGroups();
    }
  }, [open]);

  useEffect(() => {
    if (triggerType) {
      loadTemplates();
    }
  }, [triggerType]);

  const resetForm = () => {
    setCurrentStep(1);
    setName("");
    setDescription("");
    setEnabled(true);
    setTriggerType("");
    setTriggerConfig({});
    setApiFeatures([]);
    setNotifyOn([]);
    setRateLimitApis([]);
    setSelectedTemplateId("");
    setSelectedRecipientIds([]);
  };

  const loadTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      let typeToFetch = "GENERAL";
      switch (triggerType) {
        case "ENTITIES_LIMIT":
          typeToFetch = "ENTITIES_LIMIT";
          break;
        case "API_USAGE_LIMIT":
          typeToFetch = "API_USAGE_LIMIT";
          break;
        case "NEW_PLATFORM_VERSION":
          typeToFetch = "NEW_PLATFORM_VERSION";
          break;
        case "RATE_LIMITS":
          typeToFetch = "RATE_LIMITS";
          break;
        case "TASK_PROCESSING_FAILURE":
          typeToFetch = "TASK_PROCESSING_FAILURE";
          break;
        case "RESOURCES_SHORTAGE":
          typeToFetch = "RESOURCES_SHORTAGE";
          break;
        default:
          typeToFetch = "GENERAL";
      }

      const response = await NotificationService.getNotificationTemplates({
        pageSize: 100,
        sortProperty: "createdTime",
        sortOrder: "DESC",
        notificationTypes: typeToFetch,
      });
      setTemplates(response.templates || []);
    } catch (error) {
      console.error("Failed to load templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const loadRecipientGroups = async () => {
    setIsLoadingTargets(true);
    try {
      const response = await NotificationService.getNotificationTargets();
      const filtered = (response.targets || [])
        .filter(
          (target: any) =>
            !target.name.toLowerCase().includes("affected tenant"),
        )
        .sort((a: any, b: any) => a.name.localeCompare(b.name));
      setRecipientGroups(filtered);
    } catch (error) {
      console.error("Failed to load recipient groups:", error);
      toast.error("Failed to load recipient groups");
    } finally {
      setIsLoadingTargets(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!name.trim()) {
        toast.error("Please enter a rule name");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!triggerType) {
        toast.error("Please select a trigger type");
        return;
      }
      if (triggerType === "RATE_LIMITS" && rateLimitApis.length === 0) {
        toast.error("Please select at least one rate limit");
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTemplateId) {
      toast.error("Please select a template");
      return;
    }
    if (selectedRecipientIds.length === 0) {
      toast.error("Please select at least one recipient group");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalTriggerConfig = { ...triggerConfig };

      if (triggerType === "API_USAGE_LIMIT") {
        finalTriggerConfig = {
          triggerType: "API_USAGE_LIMIT",
          apiFeatures,
          notifyOn,
        };
      } else if (triggerType === "RATE_LIMITS") {
        finalTriggerConfig = {
          triggerType: "RATE_LIMITS",
          apis: rateLimitApis,
        };
      } else {
        finalTriggerConfig = {
          triggerType: triggerType,
          ...triggerConfig,
        };
      }

      const request = {
        name,
        enabled,
        templateId: {
          id: selectedTemplateId,
          entityType: "NOTIFICATION_TEMPLATE",
        },
        triggerType,
        triggerConfig: finalTriggerConfig,
        recipientsConfig: {
          targets: selectedRecipientIds,
          triggerType: triggerType,
        },
        additionalConfig: {
          description,
        },
      };

      console.log("Rule Payload:", request);

      await NotificationService.createNotificationRule(request);
      toast.success("Notification rule created successfully");
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorData = error?.response?.data;
      if (
        errorData?.errorCode === 31 ||
        errorData?.message?.includes("already exists")
      ) {
        // Duplicate name is a validation issue, not a system error
        toast.warning(
          "Notification rule with such name already exists. Please use a different name.",
        );
      } else {
        console.error("Failed to create rule:", error);
        toast.error(
          errorData?.message ||
            error?.message ||
            "Failed to create notification rule",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTemplate = templates.find(
    (t) => t.id.id === selectedTemplateId,
  );

  // Determine step labels based on trigger type
  const triggerStepLabel =
    triggerType === "API_USAGE_LIMIT"
      ? "API usage trigger settings"
      : triggerType === "RESOURCES_SHORTAGE"
        ? "Resources shortage trigger settings"
        : "Trigger settings";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-175 flex flex-col max-h-[90vh] overflow-visible">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Add Notification Rule
          </DialogTitle>
          <DialogDescription>
            Create a new rule to trigger notifications.
          </DialogDescription>
        </DialogHeader>

        {/* Stepper matches SendNotificationDialog style */}
        <div className="flex items-center justify-center gap-2 py-2 border-b">
          <StepIndicator
            step={1}
            currentStep={currentStep}
            label="Basic settings"
          />
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <StepIndicator step={2} currentStep={currentStep} label="Trigger" />
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <StepIndicator
            step={3}
            currentStep={currentStep}
            label="Notification"
          />
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4 px-1">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Rule name*</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter rule name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                  className="min-h-25"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enabled"
                  checked={enabled}
                  onCheckedChange={(c) => setEnabled(c === true)}
                />
                <Label htmlFor="enabled" className="cursor-pointer font-normal">
                  Enable notification rule
                </Label>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Trigger Type*</Label>
                <div className="relative">
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={triggerType}
                    onChange={(e) => setTriggerType(e.target.value)}
                  >
                    <option value="" disabled>
                      Select trigger type
                    </option>
                    {TRIGGER_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {triggerType === "API_USAGE_LIMIT" && (
                <>
                  <div className="space-y-2">
                    <Label>API features</Label>
                    <MultiSelect
                      options={API_FEATURES}
                      value={apiFeatures}
                      onChange={setApiFeatures}
                      placeholder="Select API features"
                    />
                    <p className="text-xs text-muted-foreground">
                      If the field is empty, the trigger will be applied to all
                      api features
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Notify on*</Label>
                    <MultiSelect
                      options={NOTIFY_ON}
                      value={notifyOn}
                      onChange={setNotifyOn}
                      placeholder="Select states"
                    />
                  </div>
                </>
              )}

              {triggerType === "RATE_LIMITS" && (
                <div className="space-y-2">
                  <Label>Rate limits*</Label>
                  <MultiSelect
                    options={RATE_LIMIT_OPTIONS}
                    value={rateLimitApis}
                    onChange={setRateLimitApis}
                    placeholder="Select rate limits"
                  />
                  <p className="text-xs text-muted-foreground">
                    If the field is empty, the trigger will be applied to all
                    rate limits
                  </p>
                </div>
              )}

              {triggerType === "ENTITIES_LIMIT" && (
                <div className="space-y-2">
                  <Label>Threshold</Label>
                  <Input
                    type="number"
                    placeholder="0.8"
                    onChange={(e) =>
                      setTriggerConfig({
                        ...triggerConfig,
                        threshold: parseFloat(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Threshold (0.0 - 1.0)
                  </p>
                </div>
              )}

              {triggerType === "RESOURCES_SHORTAGE" && (
                <div className="space-y-6 pt-2">
                  <div className="rounded-lg border p-4 space-y-6">
                    <div className="absolute -top-3 left-3 bg-background px-1 text-sm font-medium text-muted-foreground">
                      Filter
                    </div>

                    {/* CPU Threshold */}
                    <div className="flex items-center gap-4">
                      <Label className="w-24 shrink-0">CPU threshold</Label>
                      <Slider
                        value={[(triggerConfig.cpuThreshold ?? 0) * 100]}
                        onValueChange={(val) =>
                          setTriggerConfig({
                            ...triggerConfig,
                            cpuThreshold: val[0] / 100,
                          })
                        }
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                      <div className="flex items-center gap-2 w-20 shrink-0">
                        <Input
                          type="number"
                          value={Math.round(
                            (triggerConfig.cpuThreshold ?? 0) * 100,
                          )}
                          onChange={(e) => {
                            const val = Math.min(
                              100,
                              Math.max(0, parseInt(e.target.value) || 0),
                            );
                            setTriggerConfig({
                              ...triggerConfig,
                              cpuThreshold: val / 100,
                            });
                          }}
                          className="h-8 text-right pr-2"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>

                    {/* RAM Threshold */}
                    <div className="flex items-center gap-4">
                      <Label className="w-24 shrink-0">RAM threshold</Label>
                      <Slider
                        value={[(triggerConfig.ramThreshold ?? 0) * 100]}
                        onValueChange={(val) =>
                          setTriggerConfig({
                            ...triggerConfig,
                            ramThreshold: val[0] / 100,
                          })
                        }
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                      <div className="flex items-center gap-2 w-20 shrink-0">
                        <Input
                          type="number"
                          value={Math.round(
                            (triggerConfig.ramThreshold ?? 0) * 100,
                          )}
                          onChange={(e) => {
                            const val = Math.min(
                              100,
                              Math.max(0, parseInt(e.target.value) || 0),
                            );
                            setTriggerConfig({
                              ...triggerConfig,
                              ramThreshold: val / 100,
                            });
                          }}
                          className="h-8 text-right pr-2"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>

                    {/* Storage Threshold */}
                    <div className="flex items-center gap-4">
                      <Label className="w-24 shrink-0">Storage threshold</Label>
                      <Slider
                        value={[(triggerConfig.storageThreshold ?? 0) * 100]}
                        onValueChange={(val) =>
                          setTriggerConfig({
                            ...triggerConfig,
                            storageThreshold: val[0] / 100,
                          })
                        }
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                      <div className="flex items-center gap-2 w-20 shrink-0">
                        <Input
                          type="number"
                          value={Math.round(
                            (triggerConfig.storageThreshold ?? 0) * 100,
                          )}
                          onChange={(e) => {
                            const val = Math.min(
                              100,
                              Math.max(0, parseInt(e.target.value) || 0),
                            );
                            setTriggerConfig({
                              ...triggerConfig,
                              storageThreshold: val / 100,
                            });
                          }}
                          className="h-8 text-right pr-2"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Notification Template*</Label>
                {isLoadingTemplates ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading templates...
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {templates.length === 0 ? (
                      <div className="text-sm text-yellow-600">
                        No templates found for type {triggerType}.
                      </div>
                    ) : (
                      <div className="relative">
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          value={selectedTemplateId}
                          onChange={(e) =>
                            setSelectedTemplateId(e.target.value)
                          }
                        >
                          <option value="" disabled>
                            Select a template
                          </option>
                          {templates.map((t: any) => (
                            <option key={t.id.id} value={t.id.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Recipients*</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateRecipientDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create New
                  </Button>
                </div>
                <div className="space-y-2 border rounded-lg p-3 max-h-75 overflow-y-auto">
                  {isLoadingTargets ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    recipientGroups.map((group: any) => (
                      <div
                        key={group.id.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`recipient-${group.id.id}`}
                          checked={selectedRecipientIds.includes(group.id.id)}
                          onCheckedChange={(checked) => {
                            setSelectedRecipientIds((prev) =>
                              checked
                                ? [...prev, group.id.id]
                                : prev.filter((id) => id !== group.id.id),
                            );
                          }}
                        />
                        <label
                          htmlFor={`recipient-${group.id.id}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {group.name}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button
            variant="ghost"
            onClick={() =>
              currentStep === 1
                ? onOpenChange(false)
                : setCurrentStep((prev) => (prev - 1) as Step)
            }
          >
            {currentStep === 1 ? "Cancel" : "Back"}
          </Button>
          {currentStep < 3 ? (
            <Button onClick={handleNextStep}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
      <CreateRecipientGroupDialog
        open={showCreateRecipientDialog}
        onOpenChange={setShowCreateRecipientDialog}
        onSuccess={() => {
          loadRecipientGroups();
          setShowCreateRecipientDialog(false);
        }}
      />
    </Dialog>
  );
};

function StepIndicator({
  step,
  currentStep,
  label,
}: {
  step: number;
  currentStep: number;
  label: string;
}) {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep;
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors
                    ${isCompleted ? "bg-primary text-primary-foreground" : isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}
                `}
      >
        {isCompleted ? "✓" : step}
      </div>
      <span
        className={`text-sm ${isActive ? "font-semibold text-foreground" : "text-muted-foreground"}`}
      >
        {label}
      </span>
    </div>
  );
}
