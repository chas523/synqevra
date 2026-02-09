"use client";

import { useId, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardAction,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InfoTooltip from "@/components/molecules/InfoTooltip";
import { LoadingButton } from "../atoms";
import { useForm } from "react-hook-form";
import { NotificationSettings } from "@/types/notificationSettingsTypes";
import { FileDropzone } from "@/components/molecules/FileDropzone";

interface SlackSettingsFormProps {
    initialSettings: NotificationSettings | null;
    onSave: (settings: NotificationSettings) => Promise<void>;
    isSaving?: boolean;
}

interface FormData {
    botToken: string;
}

export const SlackSettingsForm = ({
    initialSettings,
    onSave,
    isSaving = false,
}: SlackSettingsFormProps) => {
    const formId = useId();
    const [firebaseFileName, setFirebaseFileName] = useState<string>("");
    const [firebaseFileContent, setFirebaseFileContent] = useState<string>("");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [fileError, setFileError] = useState<string>("");
    const [isFormDirty, setIsFormDirty] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { isValid, isSubmitting, isDirty },
        reset,
    } = useForm<FormData>({
        mode: "onChange",
        defaultValues: {
            botToken: initialSettings?.deliveryMethodsConfigs?.SLACK?.botToken || "",
        },
    });

    useEffect(() => {
        if (initialSettings?.deliveryMethodsConfigs?.SLACK) {
            reset({
                botToken: initialSettings.deliveryMethodsConfigs.SLACK.botToken || "",
            });
        }
        if (initialSettings?.deliveryMethodsConfigs?.MOBILE_APP) {
            setFirebaseFileName(initialSettings.deliveryMethodsConfigs.MOBILE_APP.firebaseServiceAccountCredentialsFileName || "");
            setFirebaseFileContent(initialSettings.deliveryMethodsConfigs.MOBILE_APP.firebaseServiceAccountCredentials || "");
        }
    }, [initialSettings, reset]);

    const handleFilesSelected = useCallback((files: File[]) => {
        if (files.length === 0) return;

        const file = files[0];
        if (!file.name.endsWith('.json')) {
            setFileError("Please upload a JSON file");
            setSelectedFiles([]);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            try {
                JSON.parse(content); // Validate JSON
                setFirebaseFileName(file.name);
                setFirebaseFileContent(content);
                setSelectedFiles([file]);
                setFileError("");
                setIsFormDirty(true);
            } catch {
                setFileError("Invalid JSON file");
                setSelectedFiles([]);
            }
        };
        reader.readAsText(file);
    }, []);

    const handleRemoveFile = useCallback(() => {
        setFirebaseFileName("");
        setFirebaseFileContent("");
        setSelectedFiles([]);
        setIsFormDirty(true);
    }, []);

    const onSubmit = async (data: FormData) => {
        const updatedSettings: NotificationSettings = {
            deliveryMethodsConfigs: {
                SLACK: {
                    botToken: data.botToken,
                    method: 'SLACK',
                },
                ...(firebaseFileName && firebaseFileContent ? {
                    MOBILE_APP: {
                        firebaseServiceAccountCredentialsFileName: firebaseFileName,
                        firebaseServiceAccountCredentials: firebaseFileContent,
                        method: 'MOBILE_APP' as const,
                    },
                } : {}),
            },
        };
        await onSave(updatedSettings);
        reset(data);
        setIsFormDirty(false);
    };

    const handleUndo = () => {
        reset({
            botToken: initialSettings?.deliveryMethodsConfigs?.SLACK?.botToken || "",
        });
        setFirebaseFileName(initialSettings?.deliveryMethodsConfigs?.MOBILE_APP?.firebaseServiceAccountCredentialsFileName || "");
        setFirebaseFileContent(initialSettings?.deliveryMethodsConfigs?.MOBILE_APP?.firebaseServiceAccountCredentials || "");
        setSelectedFiles([]);
        setIsFormDirty(false);
    };

    const isAnyDirty = isDirty || isFormDirty;

    return (
        <Card className="w-full">
            <CardHeader className="border-b">
                <CardTitle className="text-xl">Slack Settings</CardTitle>
                <CardAction>
                    <InfoTooltip
                        content={
                            <div className="space-y-2">
                                <p>Configure Slack integration for notifications.</p>
                                <p>You need a Slack Bot Token to send notifications to Slack channels.</p>
                            </div>
                        }
                    />
                </CardAction>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                <form
                    id={formId}
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6 flex flex-col"
                >
                    <div className="space-y-2">
                        <Label htmlFor={`${formId}-botToken`}>Slack API Token</Label>
                        <Input
                            id={`${formId}-botToken`}
                            {...register("botToken")}
                            placeholder="xoxb-your-slack-bot-token"
                        />
                        <p className="text-sm text-muted-foreground">
                            Enter your Slack Bot OAuth Token. You can create one in the Slack API dashboard.
                        </p>
                    </div>

                    {/* Mobile Settings Section */}
                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-lg font-semibold">Mobile Settings</h3>

                        <div className="space-y-2">
                            <Label>Firebase service account credentials JSON file</Label>
                            <FileDropzone
                                accept=".json"
                                multiple={false}
                                onFilesSelected={handleFilesSelected}
                                selectedFiles={selectedFiles}
                                onRemoveFile={handleRemoveFile}
                            />
                            {fileError && (
                                <p className="text-sm text-destructive">{fileError}</p>
                            )}
                            {firebaseFileName && selectedFiles.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    Current file: {firebaseFileName}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-row gap-3 ml-auto pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-fit h-9"
                            onClick={handleUndo}
                        >
                            Undo
                        </Button>
                        <LoadingButton
                            type="submit"
                            className="w-fit h-9"
                            isLoading={isSaving || isSubmitting}
                            textBeforeClick="Save"
                            textAfterClick="Saving..."
                            disabled={!isAnyDirty || isSaving || isSubmitting}
                        />
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default SlackSettingsForm;


