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
    type SendNotificationRequest,
} from "@/lib/services/thingsboardServices/notificationService";
import { Send, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { CreateRecipientGroupDialog } from "./CreateRecipientGroupDialog";

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

export const SendNotificationDialog = ({
    open,
    onOpenChange,
    onSuccess,
}: SendNotificationDialogProps) => {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [deliveryMethods, setDeliveryMethods] = useState<
        Record<string, boolean>
    >({});
    const [availableMethods, setAvailableMethods] = useState<string[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [isLoadingMethods, setIsLoadingMethods] = useState(false);

    // Recipient groups state
    const [recipientGroups, setRecipientGroups] = useState<
        NotificationTarget[]
    >([]);
    const [selectedRecipientIds, setSelectedRecipientIds] = useState<
        string[]
    >([]);
    const [isLoadingTargets, setIsLoadingTargets] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    useEffect(() => {
        if (open) {
            loadDeliveryMethods();
            loadRecipientGroups();
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
            // Extract targets array from response
            setRecipientGroups(response.targets || []);
        } catch (error) {
            console.error("Failed to load recipient groups:", error);
            toast.error("Failed to load recipient groups");
            setRecipientGroups([]); // Set empty array on error
        } finally {
            setIsLoadingTargets(false);
        }
    };

    const handleClose = () => {
        setSubject("");
        setMessage("");
        setDeliveryMethods({});
        setSelectedRecipientIds([]);
        onOpenChange(false);
    };

    const handleToggleRecipient = (recipientId: string) => {
        setSelectedRecipientIds((prev) =>
            prev.includes(recipientId)
                ? prev.filter((id) => id !== recipientId)
                : [...prev, recipientId],
        );
    };

    const handleSend = async () => {
        if (!subject.trim() || !message.trim()) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (selectedRecipientIds.length === 0) {
            toast.error("Please select at least one recipient group");
            return;
        }

        const enabledMethods = Object.entries(deliveryMethods)
            .filter(([_, enabled]) => enabled)
            .map(([method]) => method);

        if (enabledMethods.length === 0) {
            toast.error("Please select at least one delivery method");
            return;
        }

        setIsSending(true);
        try {
            const deliveryMethodsTemplates: Record<string, any> = {};
            enabledMethods.forEach((method) => {
                deliveryMethodsTemplates[method] = {
                    enabled: true,
                    subject: subject,
                    body: message,
                };
            });

            const request: SendNotificationRequest = {
                targets: selectedRecipientIds,
                template: {
                    deliveryMethodsTemplates,
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

    const isValid =
        subject.trim() !== "" &&
        message.trim() !== "" &&
        selectedRecipientIds.length > 0;

    // Ensure recipientGroups is always an array
    const recipientGroupsArray = Array.isArray(recipientGroups) ? recipientGroups : [];

    const selectedRecipients = recipientGroupsArray.filter((r) =>
        selectedRecipientIds.includes(r.id.id),
    );

    return (
        <>
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="text-black dark:text-white flex items-center gap-2">
                            <Send className="h-5 w-5" />
                            Send Notification
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Recipients */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-black dark:text-white">
                                    Recipients*
                                </Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowCreateDialog(true)}
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
                                <>
                                    {/* Selected recipients as badges */}
                                    {selectedRecipients.length > 0 && (
                                        <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px] bg-muted/30">
                                            {selectedRecipients.map(
                                                (recipient) => (
                                                    <Badge
                                                        key={recipient.id.id}
                                                        variant="secondary"
                                                        className="gap-1 pr-1"
                                                    >
                                                        {recipient.name}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleToggleRecipient(
                                                                    recipient.id
                                                                        .id,
                                                                )
                                                            }
                                                            className="hover:bg-muted rounded-full p-0.5"
                                                        >
                                                            <X className="h-3 w-3" />
                                                            <span className="sr-only">
                                                                Remove
                                                            </span>
                                                        </button>
                                                    </Badge>
                                                ),
                                            )}
                                        </div>
                                    )}

                                    {/* Available recipient groups */}
                                    <div className="space-y-2 border rounded-lg p-3 dark:border-gray-700 max-h-[150px] overflow-y-auto">
                                        {recipientGroupsArray.map((group) => (
                                            <div
                                                key={group.id.id}
                                                className="flex items-center space-x-2"
                                            >
                                                <Checkbox
                                                    id={`recipient-${group.id.id}`}
                                                    checked={selectedRecipientIds.includes(
                                                        group.id.id,
                                                    )}
                                                    onCheckedChange={() =>
                                                        handleToggleRecipient(
                                                            group.id.id,
                                                        )
                                                    }
                                                />
                                                <label
                                                    htmlFor={`recipient-${group.id.id}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-300 cursor-pointer flex-1"
                                                >
                                                    {group.name}
                                                </label>
                                            </div>
                                        ))}
                                        {recipientGroupsArray.length === 0 && (
                                            <p className="text-sm text-gray-500 text-center py-2">
                                                No recipient groups available.
                                                Create one to get started.
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-black dark:text-white">
                                Subject*
                            </Label>
                            <Input
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Enter notification subject"
                                maxLength={200}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-black dark:text-white">
                                Message*
                            </Label>
                            <Textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter notification message"
                                className="min-h-[120px]"
                                maxLength={1000}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {message.length}/1000 characters
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-black dark:text-white">
                                Delivery Methods*
                            </Label>
                            {isLoadingMethods ? (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Loading delivery methods...
                                </div>
                            ) : (
                                <div className="space-y-2 border rounded-lg p-3 dark:border-gray-700">
                                    {availableMethods.map((method) => (
                                        <div
                                            key={method}
                                            className="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                id={method}
                                                checked={
                                                    deliveryMethods[method] ||
                                                    false
                                                }
                                                onCheckedChange={(checked) =>
                                                    setDeliveryMethods(
                                                        (prev) => ({
                                                            ...prev,
                                                            [method]:
                                                                checked === true,
                                                        }),
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor={method}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-300 cursor-pointer"
                                            >
                                                {DELIVERY_METHOD_LABELS[
                                                    method
                                                ] || method}
                                            </label>
                                        </div>
                                    ))}
                                    {availableMethods.length === 0 && (
                                        <p className="text-sm text-gray-500">
                                            No delivery methods available
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={handleClose}
                            disabled={isSending}
                            className="text-black dark:text-white dark:bg-slate-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSend}
                            disabled={
                                !isValid || isSending || isLoadingMethods
                            }
                        >
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
        </>
    );
};
