"use client";

import { useState } from "react";
import { extractErrorMessage } from "@/lib/utils";
import type { CreateDeviceRequest } from "@/types/thingsboardDeviceTypes";
import { LoadingButton } from "../atoms";
import { ErrorMessage, FormField } from "../molecules";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Plus } from "lucide-react";
import { MEDICAL_PARAMETERS } from "../pages/DeviceDetailPage";

export interface DeviceFormProps {
  onSubmit: (deviceData: CreateDeviceRequest) => Promise<void>;
  isLoading?: boolean;
  error?: Error | null;
  className?: string;
}

const DeviceForm = ({
  onSubmit,
  isLoading = false,
  error,
  className = "",
}: DeviceFormProps) => {
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

  const handleInputChange = (
    field: keyof CreateDeviceRequest,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value || null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Device name is required");
      return;
    }
    try {
      await onSubmit(formData);
      setFormData({ name: "", label: null, parameters: [] });
    } catch {}
  };

  return (
    <div className="h-fit rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/60 text-accent-foreground">
          <Plus className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">
          Add New Device
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          label="Device Name"
          name="name"
          type="text"
          placeholder="Thermometer #ABCD"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          required
          labelClassName="mb-2 text-muted-foreground"
          inputClassName="rounded-xl border border-border bg-muted/30 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
        />

        <FormField
          label="Label (optional)"
          name="label"
          type="text"
          placeholder="Body temperature sensor - chest placed"
          value={formData.label || ""}
          onChange={(e) => handleInputChange("label", e.target.value)}
          labelClassName="mb-2 text-muted-foreground"
          inputClassName="rounded-xl border border-border bg-muted/30 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
        />

        <div className="mt-6 border-t border-border pt-6">
          <div className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
            Select Measurement Types
          </div>
          <div className="flex flex-wrap gap-2">
            {MEDICAL_PARAMETERS.map((parameter) => {
              const isSelected = formData.parameters?.includes(parameter.key);
              return (
                <button
                  type="button"
                  key={parameter.key}
                  onClick={() => toggleParameter(parameter.key)}
                  style={{ fontSize: "12px" }}
                  className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? "border border-primary/30 bg-primary/10 text-primary"
                      : "border border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {parameter.label}
                </button>
              );
            })}
          </div>
          {formData.parameters && formData.parameters.length > 0 && (
            <div className="mt-2 text-xs text-muted-foreground">
              Selected: {formData.parameters.join(", ")}
            </div>
          )}
        </div>

        <LoadingButton
          type="submit"
          className="ml-auto flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed"
          isLoading={isLoading}
          textBeforeClick="Create Device"
          textAfterClick="Creating..."
          disabled={isLoading}
          iconBeforeClick={<Plus className="w-5 h-5" />}
        />
      </form>

      {error && <ErrorMessage message={extractErrorMessage(error)} />}
    </div>
  );
};

export default DeviceForm;
