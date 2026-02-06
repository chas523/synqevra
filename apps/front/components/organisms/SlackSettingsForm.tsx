"use client";

import { useId, useEffect, useState, useCallback, DragEvent, ChangeEvent } from "react";
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
import { Upload, X, FileJson } from "lucide-react";

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
    const [isDragging, setIsDragging] = useState(false);
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

    const handleFileRead = useCallback((file: File) => {
        if (!file.name.endsWith('.json')) {
            setFileError("Please upload a JSON file");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            try {
                JSON.parse(content); // Validate JSON
                setFirebaseFileName(file.name);
                setFirebaseFileContent(content);
                setFileError("");
                setIsFormDirty(true);
            } catch {
                setFileError("Invalid JSON file");
            }
        };
        reader.readAsText(file);
    }, []);

    const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileRead(file);
        }
    }, [handleFileRead]);

    const handleFileInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileRead(file);
        }
    }, [handleFileRead]);

    const handleRemoveFile = useCallback(() => {
        setFirebaseFileName("");
        setFirebaseFileContent("");
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

                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`
                                    relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
                                    ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
                                    ${fileError ? 'border-destructive' : ''}
                                `}
                            >
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileInput}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center gap-2">
                                    <Upload className="w-8 h-8 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        Drag and drop your Firebase service account credentials file or{" "}
                                        <span className="text-primary font-medium">Browse file</span>
                                    </p>
                                </div>
                                {!firebaseFileName && (
                                    <button
                                        type="button"
                                        onClick={() => { }}
                                        className="absolute top-2 right-2 p-1 hover:bg-muted rounded"
                                    >
                                        <X className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                )}
                            </div>

                            {fileError && (
                                <p className="text-sm text-destructive">{fileError}</p>
                            )}

                            {firebaseFileName && (
                                <div className="flex items-center gap-2 mt-2">
                                    <FileJson className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">{firebaseFileName}</span>
                                    <button
                                        type="button"
                                        onClick={handleRemoveFile}
                                        className="p-1 hover:bg-muted rounded ml-auto"
                                    >
                                        <X className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                </div>
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

