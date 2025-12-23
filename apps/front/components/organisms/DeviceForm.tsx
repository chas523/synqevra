import { useState } from "react";
import { extractErrorMessage } from "@/lib/utils";
import type { CreateDeviceRequest } from "@/types/thingsboardDeviceTypes";
import { LoadingButton } from "../atoms";
import { ErrorMessage, FormField } from "../molecules";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

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
  });

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
      setFormData({ name: "", label: null });
    } catch {}
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Create New Device</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Device Name"
            name="name"
            type="text"
            placeholder="Enter device name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            required
          />

          <FormField
            label="Label (optional)"
            name="label"
            type="text"
            placeholder="Enter device label"
            value={formData.label || ""}
            onChange={(e) => handleInputChange("label", e.target.value)}
          />

          <LoadingButton
            type="submit"
            className="w-full cursor-pointer bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg"
            isLoading={isLoading}
            textBeforeClick="Create Device"
            textAfterClick="Creating..."
            disabled={isLoading}
          />
        </form>
        {error && <ErrorMessage message={extractErrorMessage(error)} />}
      </CardContent>
    </Card>
  );
};

export default DeviceForm;
