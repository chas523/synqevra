"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Select from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Queue,
    SubmitStrategy,
    ProcessingStrategy,
    SUBMIT_STRATEGY_OPTIONS,
    PROCESSING_STRATEGY_OPTIONS,
} from "@/types/queueTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import * as z from "zod";
import { Copy, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import InfoTooltip from "../molecules/InfoTooltip";

const queueSchema = z.object({
    name: z.string().min(1, "Name is required"),
    topic: z.string().optional(),
    pollInterval: z.coerce.number().min(1),
    partitions: z.coerce.number().min(1),
    consumerPerPartition: z.boolean(),
    packProcessingTimeout: z.coerce.number().min(1),
    submitStrategy: z.object({
        type: z.string(),
        batchSize: z.coerce.number().optional().nullable(),
    }),
    processingStrategy: z.object({
        type: z.string(),
        retries: z.coerce.number().min(0),
        failurePercentage: z.coerce.number().min(0).max(100),
        pauseBetweenRetries: z.coerce.number().min(0),
        maxPauseBetweenRetries: z.coerce.number().min(0),
    }),
    duplicateMsgToAllPartitions: z.boolean().optional(),
    description: z.string().optional(),
    customProperties: z.string().optional(),
});

type QueueFormValues = z.infer<typeof queueSchema>;

interface QueueFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    queue: Queue | null;
    onSave: (queue: Queue) => Promise<void>;
}

export const QueueFormDialog = ({
    open,
    onOpenChange,
    queue,
    onSave,
}: QueueFormDialogProps) => {
    const [isSaving, setIsSaving] = useState(false);
    const [expandedSection, setExpandedSection] = useState<string | null>("submit-settings");

    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        formState: { errors },
    } = useForm<QueueFormValues>({
        resolver: zodResolver(queueSchema) as any,
        defaultValues: {
            name: "",
            pollInterval: 25,
            partitions: 10,
            consumerPerPartition: true,
            packProcessingTimeout: 2000,
            submitStrategy: {
                type: "BURST",
                batchSize: 1000,
            },
            processingStrategy: {
                type: "SKIP_ALL_FAILURES",
                retries: 3,
                failurePercentage: 0,
                pauseBetweenRetries: 3,
                maxPauseBetweenRetries: 3,
            },
            duplicateMsgToAllPartitions: false,
            description: "",
            customProperties: "",
        },
    });

    const submitStrategyType = watch("submitStrategy.type");

    useEffect(() => {
        if (open) {
            if (queue) {
                reset({
                    name: queue.name,
                    topic: queue.topic,
                    pollInterval: queue.pollInterval,
                    partitions: queue.partitions,
                    consumerPerPartition: queue.consumerPerPartition,
                    packProcessingTimeout: queue.packProcessingTimeout,
                    submitStrategy: {
                        type: queue.submitStrategy.type,
                        batchSize: queue.submitStrategy.batchSize
                    },
                    processingStrategy: {
                        type: queue.processingStrategy.type,
                        retries: queue.processingStrategy.retries,
                        failurePercentage: queue.processingStrategy.failurePercentage,
                        pauseBetweenRetries: queue.processingStrategy.pauseBetweenRetries,
                        maxPauseBetweenRetries: queue.processingStrategy.maxPauseBetweenRetries
                    },
                    duplicateMsgToAllPartitions: !!queue.additionalInfo?.duplicateMsgToAllPartitions,
                    description: queue.additionalInfo?.description || "",
                    customProperties: queue.additionalInfo?.queueProperties || "",
                });
            } else {
                reset({
                    name: "",
                    topic: "",
                    pollInterval: 25,
                    partitions: 10,
                    consumerPerPartition: true,
                    packProcessingTimeout: 2000,
                    submitStrategy: {
                        type: "BURST",
                        batchSize: 1000,
                    },
                    processingStrategy: {
                        type: "SKIP_ALL_FAILURES",
                        retries: 3,
                        failurePercentage: 0,
                        pauseBetweenRetries: 3,
                        maxPauseBetweenRetries: 3,
                    },
                    duplicateMsgToAllPartitions: false,
                    description: "",
                    customProperties: "",
                });
            }
        }
    }, [open, queue, reset]);

    const onSubmit = async (values: QueueFormValues) => {
        setIsSaving(true);
        try {
            const payload: Queue = {
                ...queue,
                name: values.name,
                ...(queue?.topic ? { topic: queue.topic } : {}),
                pollInterval: values.pollInterval,
                partitions: values.partitions,
                consumerPerPartition: values.consumerPerPartition,
                packProcessingTimeout: values.packProcessingTimeout,
                submitStrategy: {
                    type: values.submitStrategy.type as any,
                    batchSize: values.submitStrategy.batchSize || undefined
                },
                processingStrategy: {
                    type: values.processingStrategy.type as any,
                    retries: values.processingStrategy.retries,
                    failurePercentage: values.processingStrategy.failurePercentage,
                    pauseBetweenRetries: values.processingStrategy.pauseBetweenRetries,
                    maxPauseBetweenRetries: values.processingStrategy.maxPauseBetweenRetries
                },
                additionalInfo: {
                    description: values.description,
                    queueProperties: values.customProperties,
                    duplicateMsgToAllPartitions: values.duplicateMsgToAllPartitions
                }
            };

            // Ensure topic is present, default to tb_rule_engine.<name> if missing and creating
            if (!payload.topic) {
                // Or specifically tb_rule_engine.1 as user requested if name is not enough?
                // But strictly the user said "tb_rule_engine.1" is missing.
                // We will try to infer or just set a sensible default if it's empty.
                // For now, let's just use the name if it looks like a suffix, or default to tb_rule_engine.1 if that is what they expect for a singleton?
                // Actually, "tb_rule_engine.1" looks like a specific partition notation.
                // Let's assume standard naming 'tb_rule_engine' is the prefix.
                // But I will strictly add the 'topic' field to the payload.
                // If the user wants to EDIT it, they can't right now (it's optional and hidden).
                // I'll make sure we send a topic.
                payload.topic = queue?.topic || `tb_rule_engine.${values.name}`.replace(/\s+/g, '_').toLowerCase();
            }

            // Hardcode tb_rule_engine.1 if the user name was suggestive? No, that's dangerous.
            // I will Trust the user meant they want the field TO BE SENT.
            // I'll add a check: if values.topic is empty, auto-generate.

            await onSave(payload);
            onOpenChange(false);
        } catch (error: any) {

            const errorMessage = error?.response?.data?.message || error?.message || "Failed to save queue";
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const copyId = () => {
        if (queue?.id?.id) {
            navigator.clipboard.writeText(queue.id.id);
            toast.success("Copied queue ID to clipboard");
        }
    };

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const SectionHeader = ({ title, section }: { title: string, section: string }) => (
        <button
            type="button"
            onClick={() => toggleSection(section)}
            className="flex w-full items-center justify-between py-4 text-sm font-medium hover:underline"
        >
            {title}
            {expandedSection === section ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between mr-8">
                        <DialogTitle>{queue ? `${queue.name}` : "Add queue"}</DialogTitle>
                        {queue && (
                            <Button variant="ghost" size="icon" onClick={copyId} title="Copy Queue ID" type="button">
                                <Copy className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name*</Label>
                        <Input id="name" {...register("name")} />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>

                    <div className="border-b">
                        <SectionHeader title="Submit settings" section="submit-settings" />
                        {expandedSection === "submit-settings" && (
                            <div className="pb-4 space-y-4">
                                <div className="space-y-2">
                                    <Label>Strategy type *</Label>
                                    <Controller
                                        control={control}
                                        name="submitStrategy.type"
                                        render={({ field }) => (
                                            <div className="space-y-2">
                                                {SUBMIT_STRATEGY_OPTIONS.map((option) => (
                                                    <div key={option.value} className="flex items-center space-x-2">
                                                        <input
                                                            type="radio"
                                                            id={`submit-${option.value}`}
                                                            name={field.name}
                                                            value={option.value}
                                                            checked={field.value === option.value}
                                                            onChange={field.onChange}
                                                            className="aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                        />
                                                        <label htmlFor={`submit-${option.value}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                            {option.label}
                                                        </label>
                                                        <InfoTooltip content={option.description || option.label} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    />
                                </div>
                                {submitStrategyType === 'BATCH' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="batchSize">Batch size *</Label>
                                        <Input type="number" id="batchSize" {...register("submitStrategy.batchSize")} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="border-b">
                        <SectionHeader title="Retries processing settings" section="retries-settings" />
                        {expandedSection === "retries-settings" && (
                            <div className="pb-4 space-y-4">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Processing type *</Label>
                                        <Controller
                                            control={control}
                                            name="processingStrategy.type"
                                            render={({ field }) => (
                                                <div className="space-y-2">
                                                    {PROCESSING_STRATEGY_OPTIONS.map((option) => (
                                                        <div key={option.value} className="flex items-center space-x-2">
                                                            <input
                                                                type="radio"
                                                                id={`proc-${option.value}`}
                                                                name={field.name}
                                                                value={option.value}
                                                                checked={field.value === option.value}
                                                                onChange={field.onChange}
                                                                className="aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                            />
                                                            <label htmlFor={`proc-${option.value}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                                {option.label}
                                                            </label>
                                                            <InfoTooltip content={option.description || option.label} />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <Label>Retries settings</Label>
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">Number of retries (0 - unlimited)*</Label>
                                            <Input type="number" {...register("processingStrategy.retries")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">Failure messages for skipping retries, %*</Label>
                                            <Input type="number" {...register("processingStrategy.failurePercentage")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">Retry within, sec*</Label>
                                            <Input type="number" {...register("processingStrategy.pauseBetweenRetries")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">Additional retry within, sec*</Label>
                                            <Input type="number" {...register("processingStrategy.maxPauseBetweenRetries")} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-b">
                        <SectionHeader title="Polling settings" section="polling-settings" />
                        {expandedSection === "polling-settings" && (
                            <div className="pb-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Poll interval*</Label>
                                        <Input type="number" {...register("pollInterval")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Partitions*</Label>
                                        <Input type="number" {...register("partitions")} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-row items-center space-x-3 space-y-0 p-4 border rounded-md">
                                        <Controller
                                            control={control}
                                            name="consumerPerPartition"
                                            render={({ field }) => (
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            )}
                                        />
                                        <Label className="font-normal">
                                            Send message poll for each consumer
                                        </Label>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Processing within, ms*</Label>
                                        <Input type="number" {...register("packProcessingTimeout")} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <Controller
                            control={control}
                            name="duplicateMsgToAllPartitions"
                            render={({ field }) => (
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        <div className="space-y-1 leading-none">
                            <Label className="font-normal">
                                Duplicate message to all partitions
                            </Label>
                        </div>
                    </div>

                    <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                        <h4 className="text-sm font-medium">Custom properties</h4>
                        <p className="text-xs text-muted-foreground">Custom queue (topic) creation properties, e.g. 'retention.ms:604800000;retention.bytes:1048576000'</p>
                        <Textarea {...register("customProperties")} className="resize-none mt-2 bg-background" />
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea {...register("description")} className="resize-none" />
                        <p className="text-sm text-muted-foreground">This text will be displayed in the Queue description instead of the selected strategy</p>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? "Saving..." : Boolean(queue) ? "Save" : "Add"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
