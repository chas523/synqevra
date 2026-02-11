"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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
    const [recipientGroups, setRecipientGroups] = useState<NotificationTarget[]>([]);
    const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
    const [isLoadingTargets, setIsLoadingTargets] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [deliveryMethods, setDeliveryMethods] = useState<Record<string, boolean>>({});
    const [availableMethods, setAvailableMethods] = useState<string[]>([]);
    const [isLoadingMethods, setIsLoadingMethods] = useState(false);

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

    // Step 3: Review
    const [preview, setPreview] = useState<any>(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (open) {
            loadDeliveryMethods();
            loadRecipient Groups();
            // Reset to step 1
            setCurrentStep(1);
        }
    }, [open]);

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
            // Filter out "Affected tenant's administrators"
            const filtered = (response.targets || []).filter(
                (target: NotificationTarget) =>
                    !target.name.toLowerCase().includes("affected tenant")
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

            const previewRequest = {
                targets: selectedRecipientIds,
                template: {
                    name: `temp-${Date.now()}`,
                    notificationType: "GENERAL",
                    configuration: {
                        deliveryMethodsTemplates,
                    },
                },
                additionalConfig: {
                    sendingDelayInSec: 0,
                },
            };

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
            if (selectedRecipientIds.length === 0) {
                toast.error("Please select at least one recipient group");
                return;
            }
            const enabledMethods = Object.values(deliveryMethods).some((v) => v);
            if (!enabledMethods) {
                toast.error("Please select at least one delivery method");
                return;
            }
            setCurrentStep(2);
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
            setCurrentStep((currentStep - 1) as Step);
        }
    };

    const handleSend = async () => {
        setIsSending(true);
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

            const request = {
                targets: selectedRecipientIds,
                template: {
                    name: `notification-${Date.now()}`,
                    notificationType: "GENERAL",
                    configuration: {
                        deliveryMethodsTemplates,
                    },
                },
                additionalConfig: {
                    sendingDelayInSec: 0,
                },
            };

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
                                recipientGroupsArray={recipientGroupsArray}
                                selectedRecipientIds={selectedRecipientIds}
                                isLoadingTargets={isLoadingTargets}
                                onToggleRecipient={handleToggleRecipient}
                                onCreateNew={() => setShowCreateDialog(true)}
                                deliveryMethods={deliveryMethods}
                                availableMethods={availableMethods}
                                isLoadingMethods={isLoadingMethods}
                                onToggleDeliveryMethod={(method, enabled) =>
                                    setDeliveryMethods((prev) => ({
                                        ...prev,
                                        [method]: enabled,
                                    }))
                                }
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
                                preview={preview}
                                isLoadingPreview={isLoadingPreview}
                                selectedRecipients={selectedRecipients}
                                deliveryMethods={deliveryMethods}
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
    recipientGroupsArray,
    selectedRecipientIds,
    isLoadingTargets,
    onToggleRecipient,
    onCreateNew,
    deliveryMethods,
    availableMethods,
    isLoadingMethods,
    onToggleDeliveryMethod,
}: any) {
    return (
        <div className="space-y-4">
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

            {/* Delivery Methods */}
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
        </div>
    );
}

// Step 2: Compose
function Step2Compose({
    subject,
    onSubjectChange,
    message,
    onMessageChange,
    iconEnabled,
    onIconEnabledChange,
    iconName,
    iconColor,
    onIconClick,
    onColorChange,
    actionButtonEnabled,
    onActionButtonEnabledChange,
    actionButtonText,
    onActionButtonTextChange,
    actionButtonLink,
    onActionButtonLinkChange,
}: any) {
    return (
        <div className="space-y-4">
            <h3 className="font-semibold">Customize messages</h3>

            {/* Web Method Section */}
            <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <Bell className="h-4 w-4" />
                    Web
                </div>

                {/* Subject */}
                <div className="space-y-2">
                    <Label>Subject*</Label>
                    <Input
                        value={subject}
                        onChange={(e) => onSubjectChange(e.target.value)}
                        placeholder="Enter subject"
                    />
                </div>

                {/* Message */}
                <div className="space-y-2">
                    <Label>Message*</Label>
                    <Textarea
                        value={message}
                        onChange={(e) => onMessageChange(e.target.value)}
                        placeholder="Enter message"
                        className="min-h-[100px]"
                    />
                </div>

                {/* Icon Section */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="icon-enabled"
                            checked={iconEnabled}
                            onCheckedChange={(checked) => onIconEnabledChange(checked === true)}
                        />
                        <Label htmlFor="icon-enabled" className="cursor-pointer">
                            Icon
                        </Label>
                    </div>

                    {iconEnabled && (
                        <div className="flex items-center gap-2 pl-6">
                            <button
                                onClick={onIconClick}
                                className="flex items-center justify-center w-10 h-10 rounded border hover:bg-gray-100"
                            >
                                <span
                                    className="material-icons"
                                    style={{ color: iconColor }}
                                >
                                    {iconName}
                                </span>
                            </button>
                            <div className="flex-1">
                                <ColorPicker value={iconColor} onChange={onColorChange} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Button Section */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="action-button-enabled"
                            checked={actionButtonEnabled}
                            onCheckedChange={(checked) =>
                                onActionButtonEnabledChange(checked === true)
                            }
                        />
                        <Label htmlFor="action-button-enabled" className="cursor-pointer">
                            Action button
                        </Label>
                    </div>

                    {actionButtonEnabled && (
                        <div className="space-y-2 pl-6">
                            <div>
                                <Label>Button text*</Label>
                                <Input
                                    value={actionButtonText}
                                    onChange={(e) => onActionButtonTextChange(e.target.value)}
                                    placeholder="Enter button text"
                                />
                            </div>
                            <div>
                                <Label>Link*</Label>
                                <Input
                                    value={actionButtonLink}
                                    onChange={(e) => onActionButtonLinkChange(e.target.value)}
                                    placeholder="Enter link URL"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Step 3: Review
function Step3Review({
    preview,
    isLoadingPreview,
    selectedRecipients,
    deliveryMethods,
}: any) {
    const enabledMethods = Object.entries(deliveryMethods)
        .filter(([_, enabled]) => enabled)
        .map(([method]) => DELIVERY_METHOD_LABELS[method] || method);

    return (
        <div className="space-y-4">
            {isLoadingPreview ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            ) : (
                <>
                    {/* Preview */}
                    {preview && (
                        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                            <h4 className="font-semibold mb-2">Preview</h4>
                            <pre className="text-sm whitespace-pre-wrap">
                                {JSON.stringify(preview, null, 2)}
                            </pre>
                        </div>
                    )}

                    {/* Summary */}
                    <div className="space-y-2">
                        <div>
                            <Label>Recipients ({selectedRecipients.length})</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {selectedRecipients.map((recipient: NotificationTarget) => (
                                    <Badge key={recipient.id.id} variant="secondary">
                                        {recipient.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label>Delivery Methods</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {enabledMethods.map((method) => (
                                    <Badge key={method} variant="secondary">
                                        {method}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
