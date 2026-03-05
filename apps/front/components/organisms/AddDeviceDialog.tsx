"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FormField from "@/components/molecules/FormField";
import LoadingButton from "@/components/atoms/LoadingButton";
import { MEDICAL_PARAMETERS } from "@/components/pages/DeviceDetailPage";
import type { CreateDeviceRequest } from "@/types/thingsboardDeviceTypes";

export interface AddDeviceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (deviceData: CreateDeviceRequest) => Promise<void>;
    isLoading?: boolean;
}

export function AddDeviceDialog({
    open,
    onOpenChange,
    onSubmit,
    isLoading = false,
}: AddDeviceDialogProps) {
    const [formData, setFormData] = useState<CreateDeviceRequest>({
        name: "",
        label: null,
        parameters: [],
    });

    const toggleParameter = (key: string) => {
        setFormData((prev) => {
            const currentParams = prev.parameters || [];
            const isSelected = currentParams.includes(key);
            return {
                ...prev,
                parameters: isSelected
                    ? currentParams.filter((k) => k !== key)
                    : [...currentParams, key],
            };
        });
    };

    const handleInputChange = (field: keyof CreateDeviceRequest, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value || null,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            return;
        }
        try {
            await onSubmit(formData);
            setFormData({ name: "", label: null, parameters: [] });
            onOpenChange(false);
        } catch { }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Device</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <FormField
                        label="Device Name"
                        name="name"
                        type="text"
                        placeholder="Thermometer #ABCD"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                    />

                    <FormField
                        label="Label (optional)"
                        name="label"
                        type="text"
                        placeholder="Body temperature sensor"
                        value={formData.label || ""}
                        onChange={(e) => handleInputChange("label", e.target.value)}
                    />

                    <div className="space-y-3">
                        <div className="text-sm font-medium">Measurement Types</div>
                        <div className="flex flex-wrap gap-2">
                            {MEDICAL_PARAMETERS.map((parameter) => {
                                const isSelected = formData.parameters?.includes(parameter.key);
                                return (
                                    <button
                                        type="button"
                                        key={parameter.key}
                                        onClick={() => toggleParameter(parameter.key)}
                                        className={`px-3 py-1.5 text-xs rounded-md transition-colors ${isSelected
                                                ? "bg-blue-100 text-blue-700 border border-blue-200"
                                                : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
                                            }`}
                                    >
                                        {parameter.label}
                                    </button>
                                );
                            })}
                        </div>
                        {formData.parameters && formData.parameters.length > 0 && (
                            <div className="text-xs text-slate-500">
                                Selected: {formData.parameters.join(", ")}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-4">
                        <LoadingButton
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            isLoading={isLoading}
                            textBeforeClick="Create Device"
                            textAfterClick="Creating..."
                            disabled={isLoading || !formData.name.trim()}
                        />
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
