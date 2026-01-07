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
    value: string
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
    <div className="h-fit bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl dark:shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
          <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
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
          labelClassName="text-slate-600 dark:text-gray-300 mb-2"
          inputClassName="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
        />

        <FormField
          label="Label (optional)"
          name="label"
          type="text"
          placeholder="Body temperature sensor - chest placed"
          value={formData.label || ""}
          onChange={(e) => handleInputChange("label", e.target.value)}
          labelClassName="text-slate-600 dark:text-gray-300 mb-2"
          inputClassName="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
        />

        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
          <div className="text-xs text-slate-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
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
                      ? "bg-blue-100 dark:bg-blue-500/30 border border-blue-300 dark:border-blue-400/50 text-blue-600 dark:text-blue-300"
                      : "bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20"
                  }`}
                >
                  {parameter.label}
                </button>
              );
            })}
          </div>
          {formData.parameters && formData.parameters.length > 0 && (
            <div className="mt-2 text-xs text-slate-500 dark:text-gray-500">
              Selected: {formData.parameters.join(", ")}
            </div>
          )}
        </div>

        <LoadingButton
          type="submit"
          className="ml-auto cursor-pointer bg-gradient-to-r from-blue-500 to-slate-500 hover:from-blue-600 hover:to-slate-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20 disabled:shadow-none flex items-center justify-center gap-2"
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
