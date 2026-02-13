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
import { Checkbox } from "@/components/ui/checkbox";
import {
    NotificationService,
} from "@/lib/services/thingsboardServices/notificationService";
import { Send, Loader2, Plus, ChevronRight, ChevronLeft, Bell } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { CreateRecipientGroupDialog } from "./CreateRecipientGroupDialog";
import { IconPickerDialog } from "@/components/molecules/IconPickerDialog";
import { ColorPicker } from "@/components/molecules/ColorPicker";
import { NotificationComposer } from "@/components/organisms/NotificationComposer";

interface SendNotificationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

interface NotificationTarget {
    id: { id: string; entityType: string };
    name: string;
    configuration: any;
}

const DELIVERY_METHOD_LABELS: Record<string, string> = {
    WEB: "Web",
    EMAIL: "Email",
    SMS: "SMS",
    SLACK: "Slack",
    MOBILE_APP: "Mobile App",
};

type Step = 1 | 2 | 3;

export const SendNotificationDialog = ({
    open,
    onOpenChange,
    onSuccess,
}: SendNotificationDialogProps) => {
    // Wizard state
    const [currentStep, setCurrentStep] = useState<Step>(1);

    // Step 1: Setup
    const [notificationType, setNotificationType] = useState<"SCRATCH" | "TEMPLATE">("SCRATCH");
    const [recipientGroups, setRecipientGroups] = useState<NotificationTarget[]>([]);
    const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
    const [isLoadingTargets, setIsLoadingTargets] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [deliveryMethods, setDeliveryMethods] = useState<Record<string, boolean>>({});
    const [availableMethods, setAvailableMethods] = useState<string[]>([]);
    const [isLoadingMethods, setIsLoadingMethods] = useState(false);

    // Template state
    const [templates, setTemplates] = useState<any[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

    // Step 2: Compose
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [iconEnabled, setIconEnabled] = useState(true);
    const [iconName, setIconName] = useState("notifications");
    const [iconColor, setIconColor] = useState("#FFFFFF");
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [actionButtonEnabled, setActionButtonEnabled] = useState(false);
    const [actionButtonText, setActionButtonText] = useState("");
    const [actionButtonLink, setActionButtonLink] = useState("");
    const [saveAsTemplate, setSaveAsTemplate] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState("");
    const [scheduleLater, setScheduleLater] = useState(false);
    const [timezone, setTimezone] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");

    // Step 3: Review
    const [preview, setPreview] = useState<any>(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (open) {
            loadDeliveryMethods();
            loadRecipientGroups();
            loadTemplates();
            // Reset to step 1
            setCurrentStep(1);
            // Set default timezone
            try {
                setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
            } catch (e) {
                console.error("Failed to get timezone", e);
            }
        }
    }, [open]);

    const loadTemplates = async () => {
        setIsLoadingTemplates(true);
        try {
            const response = await NotificationService.getNotificationTemplates({
                pageSize: 100,
                sortProperty: 'createdTime',
                sortOrder: 'DESC',
                notificationTypes: "GENERAL"
            });
            console.log("Templates response:", response);
            setTemplates(response.templates || []);
        } catch (error) {
            console.error("Failed to load templates:", error);
            toast.error("Failed to load templates");
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    const loadDeliveryMethods = async () => {
        setIsLoadingMethods(true);
        try {
            const response = await NotificationService.getDeliveryMethods();
            const methods = response.deliveryMethods.map((dm) => dm.method);
            setAvailableMethods(methods);

            // Enable WEB by default
            const defaultMethods: Record<string, boolean> = {};
            methods.forEach((method) => {
                defaultMethods[method] = method === "WEB";
            });
            setDeliveryMethods(defaultMethods);
        } catch (error) {
            console.error("Failed to load delivery methods:", error);
            toast.error("Failed to load delivery methods");
        } finally {
            setIsLoadingMethods(false);
        }
    };

    const loadRecipientGroups = async () => {
        setIsLoadingTargets(true);
        try {
            const response = await NotificationService.getNotificationTargets();
            // Filter out "Affected tenant's administrators" and sort alphabetically
            const filtered = (response.targets || [])
                .filter(
                    (target: NotificationTarget) =>
                        !target.name.toLowerCase().includes("affected tenant")
                )
                .sort((a: NotificationTarget, b: NotificationTarget) =>
                    a.name.localeCompare(b.name)
                );
            setRecipientGroups(filtered);
        } catch (error) {
            console.error("Failed to load recipient groups:", error);
            toast.error("Failed to load recipient groups");
            setRecipientGroups([]);
        } finally {
            setIsLoadingTargets(false);
        }
    };

    const handleClose = () => {
        setCurrentStep(1);
        setSubject("");
        setMessage("");
        setDeliveryMethods({});
        setSelectedRecipientIds([]);
        setIconEnabled(true);
        setIconName("notifications");
        setIconColor("#FFFFFF");
        setActionButtonEnabled(false);
        setActionButtonText("");
        setActionButtonLink("");
        setPreview(null);
        setNotificationType("SCRATCH");
        setSelectedTemplateId("");
        setSaveAsTemplate(false);
        setSaveAsTemplate(false);
        setNewTemplateName("");
        setScheduleLater(false);
        setScheduledTime("");
        onOpenChange(false);
    };

    const handleToggleRecipient = (recipientId: string) => {
        setSelectedRecipientIds((prev) =>
            prev.includes(recipientId)
                ? prev.filter((id) => id !== recipientId)
                : [...prev, recipientId]
        );
    };

    const generatePreview = async () => {
        setIsLoadingPreview(true);
        try {
            let previewRequest: any = {
                targets: selectedRecipientIds,
                additionalConfig: {
                    sendingDelayInSec: 0,
                },
            };

            if (notificationType === "TEMPLATE") {
                previewRequest.templateId = {
                    id: selectedTemplateId,
                    entityType: "NOTIFICATION_TEMPLATE"
                };
            } else {
                const enabledMethods = Object.entries(deliveryMethods)
                    .filter(([_, enabled]) => enabled)
                    .map(([method]) => method);

                // Build payload matching ThingsBoard format
                const deliveryMethodsTemplates: Record<string, any> = {};
                enabledMethods.forEach((method) => {
                    deliveryMethodsTemplates[method] = {
                        subject: subject,
                        body: message,
                        additionalConfig: {
                            icon: {
                                enabled: iconEnabled,
                                icon: iconName,
                                color: iconColor,
                            },
                            actionButtonConfig: {
                                enabled: actionButtonEnabled,
                                ...(actionButtonEnabled && {
                                    text: actionButtonText,
                                    linkType: "LINK",
                                    link: actionButtonLink,
                                }),
                            },
                        },
                        enabled: true,
                        method: method,
                    };
                });

                previewRequest.template = {
                    name: `temp-${Date.now()}`,
                    notificationType: "GENERAL",
                    configuration: {
                        deliveryMethodsTemplates,
                    },
                };
            }

            const result = await NotificationService.previewNotification(previewRequest);
            setPreview(result);
        } catch (error: any) {
            console.error("Failed to generate preview:", error);
            toast.error("Failed to generate preview");
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const handleNextStep = async () => {
        if (currentStep === 1) {
            if (notificationType === "TEMPLATE" && !selectedTemplateId) {
                toast.error("Please select a template");
                return;
            }
            if (selectedRecipientIds.length === 0) {
                toast.error("Please select at least one recipient group");
                return;
            }

            if (notificationType === "SCRATCH") {
                const enabledMethods = Object.values(deliveryMethods).some((v) => v);
                if (!enabledMethods) {
                    toast.error("Please select at least one delivery method");
                    return;
                }
                setCurrentStep(2);
            } else {
                // If using template, skip compose step and go to review
                setCurrentStep(3);
                await generatePreview();
            }
        } else if (currentStep === 2) {
            if (!subject.trim() || !message.trim()) {
                toast.error("Please fill in subject and message");
                return;
            }
            setCurrentStep(3);
            await generatePreview();
        }
    };

    const handleBackStep = () => {
        if (currentStep > 1) {
            // If using template and we are at step 3, go back to step 1 (skipping step 2)
            if (notificationType === "TEMPLATE" && currentStep === 3) {
                setCurrentStep(1);
            } else {
                setCurrentStep((currentStep - 1) as Step);
            }
        }
    };

    const handleSend = async () => {
        setIsSending(true);
        try {
            let request: any = {
                targets: selectedRecipientIds,
                additionalConfig: {
                    sendingDelayInSec: 0,
                },
            };

            if (scheduleLater && scheduledTime) {
                const now = new Date();
                const target = new Date(scheduledTime);
                const delayInSec = Math.floor((target.getTime() - now.getTime()) / 1000);

                if (delayInSec < 0) {
                    toast.error("Scheduled time must be in the future");
                    setIsSending(false);
                    return;
                }

                request.additionalConfig.sendingDelayInSec = delayInSec;
                request.sendingDelayInSec = delayInSec;
            }

            if (notificationType === "TEMPLATE") {
                request.templateId = {
                    id: selectedTemplateId,
                    entityType: "NOTIFICATION_TEMPLATE"
                };
            } else {
                const enabledMethods = Object.entries(deliveryMethods)
                    .filter(([_, enabled]) => enabled)
                    .map(([method]) => method);

                const deliveryMethodsTemplates: Record<string, any> = {};
                enabledMethods.forEach((method) => {
                    deliveryMethodsTemplates[method] = {
                        subject: subject,
                        body: message,
                        additionalConfig: {
                            icon: {
                                enabled: iconEnabled,
                                icon: iconName,
                                color: iconColor,
                            },
                            actionButtonConfig: {
                                enabled: actionButtonEnabled,
                                ...(actionButtonEnabled && {
                                    text: actionButtonText,
                                    linkType: "LINK",
                                    link: actionButtonLink,
                                }),
                            },
                        },
                        enabled: true,
                        method: method,
                    };
                });

                request.template = {
                    name: `notification-${Date.now()}`,
                    notificationType: "GENERAL",
                    configuration: {
                        deliveryMethodsTemplates,
                    },
                };
            }

            if (saveAsTemplate && notificationType === 'SCRATCH' && newTemplateName) {
                try {
                    const enabledMethods = Object.entries(deliveryMethods)
                        .filter(([_, enabled]) => enabled)
                        .map(([method]) => method);

                    const deliveryMethodsTemplates: Record<string, any> = {};
                    enabledMethods.forEach((method) => {
                        deliveryMethodsTemplates[method] = {
                            subject: subject,
                            body: message,
                            additionalConfig: {
                                icon: {
                                    enabled: iconEnabled,
                                    icon: iconName,
                                    color: iconColor,
                                },
                                actionButtonConfig: {
                                    enabled: actionButtonEnabled,
                                    ...(actionButtonEnabled && {
                                        text: actionButtonText,
                                        linkType: "LINK",
                                        link: actionButtonLink,
                                    }),
                                },
                            },
                            enabled: true,
                            method: method,
                        };
                    });

                    await NotificationService.createNotificationTemplate({
                        name: newTemplateName,
                        notificationType: "GENERAL",
                        configuration: {
                            deliveryMethodsTemplates,
                        }
                    });
                    toast.success("Template saved successfully");
                    // Refresh templates list
                    loadTemplates();
                } catch (error) {
                    console.error("Failed to save template:", error);
                    toast.error("Failed to save template");
                    // Don't stop sending if template save fails? Or maybe stop?
                    // Let's continue sending but warn user.
                }
            }

            await NotificationService.sendNotification(request);
            toast.success("Notification sent successfully");
            handleClose();
            onSuccess?.();
        } catch (error: any) {
            console.error("Failed to send notification:", error);
            toast.error(error?.message || "Failed to send notification");
        } finally {
            setIsSending(false);
        }
    };

    const recipientGroupsArray = Array.isArray(recipientGroups) ? recipientGroups : [];
    const selectedRecipients = recipientGroupsArray.filter((r) =>
        selectedRecipientIds.includes(r.id.id)
    );

    return (
        <>
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-visible flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            New notification
                        </DialogTitle>
                        <DialogDescription>
                            Send a notification to selected recipients.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Stepper */}
                    <div className="flex items-center justify-center gap-2 py-2 border-b">
                        <StepIndicator step={1} currentStep={currentStep} label="Setup" />
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                        <StepIndicator step={2} currentStep={currentStep} label="Compose" />
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                        <StepIndicator step={3} currentStep={currentStep} label="Review" />
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 overflow-y-auto py-4 space-y-4">
                        {currentStep === 1 && (
                            <Step1Setup
                                notificationType={notificationType}
                                onNotificationTypeChange={setNotificationType}
                                templates={templates}
                                selectedTemplateId={selectedTemplateId}
                                onTemplateChange={setSelectedTemplateId}
                                isLoadingTemplates={isLoadingTemplates}
                                recipientGroupsArray={recipientGroupsArray}
                                selectedRecipientIds={selectedRecipientIds}
                                isLoadingTargets={isLoadingTargets}
                                onToggleRecipient={handleToggleRecipient}
                                onCreateNew={() => setShowCreateDialog(true)}
                                deliveryMethods={deliveryMethods}
                                availableMethods={availableMethods}
                                isLoadingMethods={isLoadingMethods}
                                onToggleDeliveryMethod={(method: string, enabled: boolean) =>
                                    setDeliveryMethods((prev) => ({
                                        ...prev,
                                        [method]: enabled,
                                    }))
                                }
                                scheduleLater={scheduleLater}
                                onScheduleLaterChange={setScheduleLater}
                                timezone={timezone}
                                onTimezoneChange={setTimezone}
                                scheduledTime={scheduledTime}
                                onScheduledTimeChange={setScheduledTime}
                            />
                        )}

                        {currentStep === 2 && (
                            <Step2Compose
                                subject={subject}
                                onSubjectChange={setSubject}
                                message={message}
                                onMessageChange={setMessage}
                                iconEnabled={iconEnabled}
                                onIconEnabledChange={setIconEnabled}
                                iconName={iconName}
                                iconColor={iconColor}
                                onIconClick={() => setShowIconPicker(true)}
                                onColorChange={setIconColor}
                                actionButtonEnabled={actionButtonEnabled}
                                onActionButtonEnabledChange={setActionButtonEnabled}
                                actionButtonText={actionButtonText}
                                onActionButtonTextChange={setActionButtonText}
                                actionButtonLink={actionButtonLink}
                                onActionButtonLinkChange={setActionButtonLink}
                            />
                        )}

                        {currentStep === 3 && (
                            <Step3Review
                                isLoadingPreview={isLoadingPreview}
                                selectedRecipients={selectedRecipients}
                                deliveryMethods={deliveryMethods}
                                iconEnabled={iconEnabled}
                                iconName={iconName}
                                iconColor={iconColor}
                                subject={subject}
                                message={message}
                                actionButtonEnabled={actionButtonEnabled}
                                actionButtonText={actionButtonText}
                                actionButtonLink={actionButtonLink}
                                notificationType={notificationType}
                                preview={preview}
                                saveAsTemplate={saveAsTemplate}
                                onSaveAsTemplateChange={setSaveAsTemplate}
                                newTemplateName={newTemplateName}
                                onNewTemplateNameChange={setNewTemplateName}
                            />
                        )}
                    </div>

                    <DialogFooter className="border-t pt-4">
                        <div className="flex justify-between w-full">
                            <Button
                                variant="ghost"
                                onClick={currentStep === 1 ? handleClose : handleBackStep}
                            >
                                {currentStep === 1 ? "Cancel" : "Back"}
                            </Button>
                            <div className="flex gap-2">
                                {currentStep < 3 && (
                                    <Button onClick={handleNextStep}>
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                )}
                                {currentStep === 3 && (
                                    <Button onClick={handleSend} disabled={isSending}>
                                        {isSending ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4 mr-2" />
                                                Send
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <CreateRecipientGroupDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onSuccess={() => {
                    loadRecipientGroups();
                    setShowCreateDialog(false);
                }}
            />

            <IconPickerDialog
                open={showIconPicker}
                onOpenChange={setShowIconPicker}
                currentIcon={iconName}
                onSelectIcon={setIconName}
            />
        </>
    );
};

// Step Indicator Component
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
                className={`
                    flex items-center justify-center w-8 h-8 rounded-full
                    ${isCompleted
                        ? "bg-blue-500 text-white"
                        : isActive
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-500"
                    }
                `}
            >
                {isCompleted ? "✓" : step}
            </div>
            <span
                className={`text-sm ${isActive ? "font-semibold text-blue-600" : "text-gray-600"
                    }`}
            >
                {label}
            </span>
        </div>
    );
}

// Step 1: Setup
function Step1Setup({
    notificationType,
    onNotificationTypeChange,
    templates,
    selectedTemplateId,
    onTemplateChange,
    isLoadingTemplates,
    recipientGroupsArray,
    selectedRecipientIds,
    isLoadingTargets,
    onToggleRecipient,
    onCreateNew,
    deliveryMethods,
    availableMethods,
    isLoadingMethods,
    onToggleDeliveryMethod,
    scheduleLater,
    onScheduleLaterChange,
    timezone,
    onTimezoneChange,
    scheduledTime,
    onScheduledTimeChange,
}: any) {
    const timezones = Intl.supportedValuesOf('timeZone');

    return (
        <div className="space-y-6">
            {/* Toggle Mode */}
            <div className="flex justify-center">
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <button
                        type="button"
                        onClick={() => onNotificationTypeChange("SCRATCH")}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${notificationType === "SCRATCH"
                            ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            }`}
                    >
                        Start from scratch
                    </button>
                    <button
                        type="button"
                        onClick={() => onNotificationTypeChange("TEMPLATE")}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${notificationType === "TEMPLATE"
                            ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            }`}
                    >
                        Use template
                    </button>
                </div>
            </div>

            {/* Template Selection */}
            {notificationType === "TEMPLATE" && (
                <div className="space-y-2">
                    <Label>Template*</Label>
                    {isLoadingTemplates ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading templates...
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={selectedTemplateId}
                                onChange={(e) => onTemplateChange(e.target.value)}
                            >
                                <option value="" disabled>Select a template</option>
                                {templates.map((template: any) => (
                                    <option key={template.id.id} value={template.id.id}>
                                        {template.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            )}

            {/* Recipients */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label>Recipients*</Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onCreateNew}
                        disabled={isLoadingTargets}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Create New
                    </Button>
                </div>

                {isLoadingTargets ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading recipient groups...
                    </div>
                ) : (
                    <div className="space-y-2 border rounded-lg p-3 max-h-[200px] overflow-y-auto">
                        {recipientGroupsArray.map((group: NotificationTarget) => (
                            <div key={group.id.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`recipient-${group.id.id}`}
                                    checked={selectedRecipientIds.includes(group.id.id)}
                                    onCheckedChange={() => onToggleRecipient(group.id.id)}
                                />
                                <label
                                    htmlFor={`recipient-${group.id.id}`}
                                    className="text-sm cursor-pointer flex-1"
                                >
                                    {group.name}
                                </label>
                            </div>
                        ))}
                        {recipientGroupsArray.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-2">
                                No recipient groups available. Create one to get started.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Delivery Methods - Only for SCRATCH */}
            {notificationType === "SCRATCH" && (
                <div className="space-y-2">
                    <Label>Delivery Methods*</Label>
                    {isLoadingMethods ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading delivery methods...
                        </div>
                    ) : (
                        <div className="space-y-2 border rounded-lg p-3">
                            {availableMethods.map((method: string) => (
                                <div key={method} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={method}
                                        checked={deliveryMethods[method] || false}
                                        onCheckedChange={(checked) =>
                                            onToggleDeliveryMethod(method, checked === true)
                                        }
                                    />
                                    <label
                                        htmlFor={method}
                                        className="text-sm cursor-pointer"
                                    >
                                        {DELIVERY_METHOD_LABELS[method] || method}
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Schedule for later toggle */}
            <div className="space-y-4 pt-2 border-t">
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="schedule-later"
                        checked={scheduleLater}
                        onCheckedChange={(checked) => onScheduleLaterChange(checked === true)}
                    />
                    <Label htmlFor="schedule-later" className="cursor-pointer">
                        Schedule for later
                    </Label>
                </div>

                {scheduleLater && (
                    <div className="pl-6 space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-2">
                            <Label>Time zone*</Label>
                            <select
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={timezone}
                                onChange={(e) => onTimezoneChange(e.target.value)}
                            >
                                {timezones.map((tz) => (
                                    <option key={tz} value={tz}>
                                        {tz}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Time*</Label>
                            <Input
                                type="datetime-local"
                                value={scheduledTime}
                                onChange={(e) => onScheduledTimeChange(e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Step 2: Compose
function Step2Compose(props: any) {
    return <NotificationComposer {...props} />;
}

// Step 3: Review
function Step3Review({
    isLoadingPreview,
    selectedRecipients,
    deliveryMethods,
    iconEnabled,
    iconName,
    iconColor,
    subject,
    message,
    actionButtonEnabled,
    actionButtonText,
    actionButtonLink,
    notificationType,
    preview,
    saveAsTemplate,
    onSaveAsTemplateChange,
    newTemplateName,
    onNewTemplateNameChange,
}: any) {

    // If we have a preview from API (especially for templates), use it
    const recipientsPreview = preview?.recipientsPreview || [];
    const totalRecipients = preview?.totalRecipientsCount || 0;

    // Extract template processing info if available
    const processedTemplate = preview?.processedTemplates?.WEB; // Assuming WEB for now or first available

    const enabledMethods = Object.entries(deliveryMethods)
        .filter(([_, enabled]) => enabled)
        .map(([method]) => DELIVERY_METHOD_LABELS[method] || method);

    return (
        <div className="space-y-6">
            {notificationType === 'SCRATCH' && (
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border space-y-4">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="save-template"
                            checked={saveAsTemplate}
                            onCheckedChange={(checked) => onSaveAsTemplateChange(checked === true)}
                        />
                        <Label htmlFor="save-template" className="cursor-pointer font-medium">
                            Save as template
                        </Label>
                    </div>

                    {saveAsTemplate && (
                        <div className="pl-6 animate-in fade-in slide-in-from-top-2">
                            <Label className="text-sm">Template Name*</Label>
                            <Input
                                value={newTemplateName}
                                onChange={(e) => onNewTemplateNameChange(e.target.value)}
                                placeholder="Enter template name"
                                className="mt-1"
                            />
                        </div>
                    )}
                </div>
            )}

            {isLoadingPreview ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            ) : (
                <>
                    {/* Stats summary */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="border rounded-lg p-3">
                            <div className="text-sm text-gray-500">Recipients Count</div>
                            <div className="text-xl font-bold">{totalRecipients}</div>
                        </div>
                        {/* We can add more stats here based on preview data */}
                    </div>

                    {/* Notification Preview Card */}
                    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                        <h3 className="text-sm font-medium mb-3">Notification Preview</h3>

                        <div className="flex gap-4 items-start bg-white dark:bg-gray-800 p-4 rounded-md border">
                            {/* Icon Logic: Use preview data if available, otherwise local state */}
                            {((processedTemplate?.additionalConfig?.icon?.enabled) || (notificationType === "SCRATCH" && iconEnabled)) && (
                                <div className="flex-shrink-0">
                                    {/* Handle icon rendering logic here - might need to read from processedTemplate if in template mode */}
                                    {(notificationType === "TEMPLATE") ? (
                                        <Bell className="h-10 w-10 text-gray-500" /> // Simplified for template preview for now or parse mdi/material from config
                                    ) : (
                                        iconName.startsWith('mdi:') ? (
                                            <div style={{
                                                WebkitMaskImage: `url(/tb-assets/mdi/${iconName.substring(4)}.svg)`,
                                                maskImage: `url(/tb-assets/mdi/${iconName.substring(4)}.svg)`,
                                                WebkitMaskSize: 'contain',
                                                maskSize: 'contain',
                                                WebkitMaskRepeat: 'no-repeat',
                                                maskRepeat: 'no-repeat',
                                                WebkitMaskPosition: 'center',
                                                maskPosition: 'center',
                                                backgroundColor: iconColor,
                                                width: '40px',
                                                height: '40px'
                                            }} />
                                        ) : (
                                            <span
                                                className="material-icons text-4xl"
                                                style={{ color: iconColor }}
                                            >
                                                {iconName}
                                            </span>
                                        )
                                    )}
                                </div>
                            )}

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-base mb-1">
                                    {processedTemplate?.subject || subject || "(No subject)"}
                                </h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {processedTemplate?.body || message || "(No message)"}
                                </p>

                                {/* Action Button Preview */}
                                {((processedTemplate?.additionalConfig?.actionButtonConfig?.enabled) || (notificationType === "SCRATCH" && actionButtonEnabled && actionButtonText)) && (
                                    <div className="mt-3">
                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="pointer-events-none"
                                        >
                                            {processedTemplate?.additionalConfig?.actionButtonConfig?.text || actionButtonText}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Button Link */}
                    {((processedTemplate?.additionalConfig?.actionButtonConfig?.enabled && processedTemplate?.additionalConfig?.actionButtonConfig?.link) || (notificationType === "SCRATCH" && actionButtonEnabled && actionButtonLink)) && (
                        <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
                            <h3 className="text-sm font-medium mb-1">Action Button Link</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 break-all">
                                {processedTemplate?.additionalConfig?.actionButtonConfig?.link || actionButtonLink}
                            </p>
                        </div>
                    )}

                    {/* Recipients */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">
                            Recipients ({selectedRecipients.length})
                        </h3>
                        <div className="border rounded-md max-h-[200px] overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                                    <tr>
                                        <th className="text-left p-2 font-medium">Recipient</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedRecipients.map((recipient: NotificationTarget, idx: number) => (
                                        <tr key={recipient.id.id || idx} className="border-t">
                                            <td className="p-2">{recipient.name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Delivery Methods */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">Delivery Methods</h3>
                        <div className="flex flex-wrap gap-2">
                            {enabledMethods.map((method) => (
                                <span
                                    key={method}
                                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                                >
                                    {method}
                                </span>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
