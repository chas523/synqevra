"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    SelectAdmin as Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/admin_select";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    bundleAlias: z.string().min(1, "Bundle Alias is required"),
    alias: z.string().min(1, "Alias is required"),
    description: z.string().optional(),
});

interface CreateWidgetTypeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: z.infer<typeof formSchema>) => Promise<void>;
    isSubmitting: boolean;
}

export function CreateWidgetTypeDialog({
    open,
    onOpenChange,
    onSubmit,
    isSubmitting,
}: CreateWidgetTypeDialogProps) {
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            bundleAlias: "",
            alias: "",
            description: "",
        },
    });

    const onFormSubmit = async (values: z.infer<typeof formSchema>) => {
        await onSubmit(values);
        reset();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Widget Type</DialogTitle>
                    <DialogDescription>
                        Create a new widget type. This will add a blank widget template.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="My Widget" {...register("name")} />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bundleAlias">Bundle Alias</Label>
                        <Input
                            id="bundleAlias"
                            placeholder="my_bundle"
                            {...register("bundleAlias")}
                        />
                        {errors.bundleAlias && (
                            <p className="text-sm text-destructive">{errors.bundleAlias.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="alias">Alias</Label>
                        <Input id="alias" placeholder="my_widget" {...register("alias")} />
                        {errors.alias && (
                            <p className="text-sm text-destructive">{errors.alias.message}</p>
                        )}
                    </div>


                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Optional description"
                            className="resize-none"
                            {...register("description")}
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">{errors.description.message}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Creating..." : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
