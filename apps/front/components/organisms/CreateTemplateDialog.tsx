"use client";

import { useState } from "react";
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
import { NotificationComposer } from "@/components/organisms/NotificationComposer";
import { NotificationService } from "@/lib/services/thingsboardServices/notificationService";
import { toast } from "sonner";
import { Loader2, Plus, Save } from "lucide-react";
import { IconPickerDialog } from "@/components/molecules/IconPickerDialog";

interface CreateTemplateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function CreateTemplateDialog({
    open,
    onOpenChange,
    onSuccess,
}: CreateTemplateDialogProps) {
    const [name, setName] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [iconEnabled, setIconEnabled] = useState(true);
    const [iconName, setIconName] = useState("notifications");
    const [iconColor, setIconColor] = useState("#FFFFFF");
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [actionButtonEnabled, setActionButtonEnabled] = useState(false);
    const [actionButtonText, setActionButtonText] = useState("");
    const [actionButtonLink, setActionButtonLink] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleClose = () => {
        setName("");
        setSubject("");
        setMessage("");
        setIconEnabled(true);
        setIconName("notifications");
        setIconColor("#FFFFFF");
        setActionButtonEnabled(false);
        setActionButtonText("");
        setActionButtonLink("");
        onOpenChange(false);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error("Please enter a template name");
            return;
        }
        if (!subject.trim() || !message.trim()) {
            toast.error("Please fill in subject and message");
            return;
        }

        setIsSaving(true);
        try {
            // For now, we only support WEB method configuration in the UI
            // mirroring the current behavior of SendNotificationDialog
            const deliveryMethodsTemplates: Record<string, any> = {
                WEB: {
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
                    method: "WEB",
                }
            };

            await NotificationService.createNotificationTemplate({
                name: name,
                notificationType: "GENERAL",
                configuration: {
                    deliveryMethodsTemplates,
                }
            });

            toast.success("Template created successfully");
            handleClose();
            onSuccess?.();
        } catch (error: any) {
            console.error("Failed to create template:", error);
            toast.error(error?.message || "Failed to create template");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            Create Notification Template
                        </DialogTitle>
                        <DialogDescription>
                            Create a reusable template for your notifications.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label>Template Name*</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="E.g., System Maintenance Alert"
                            />
                        </div>

                        <NotificationComposer
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
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Create Template
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <IconPickerDialog
                open={showIconPicker}
                onOpenChange={setShowIconPicker}
                currentIcon={iconName}
                onSelectIcon={setIconName}
            />
        </>
    );
}
