"use client";
import { useState } from "react";
import type {
  MedicalParameter,
  ThresholdOption,
} from "@/types/deviceParameterTypes";
import { Input, Label } from "../atoms";
import { Button } from "../ui/button";
import Select, { type SelectOption } from "../ui/select";

export interface ParameterSelectorProps {
  availableParameters: MedicalParameter[];
  thresholdOptions: ThresholdOption[];
  onAddParameter: (
    parameterKey: string,
    thresholdType: string,
    value: string,
  ) => void;
  className?: string;
}

const ParameterSelector = ({
  availableParameters,
  thresholdOptions,
  onAddParameter,
  className = "",
}: ParameterSelectorProps) => {
  const [selectedParameterKey, setSelectedParameterKey] = useState<string>("");
  const [selectedThreshold, setSelectedThreshold] = useState<string>("");
  const [parameterValue, setParameterValue] = useState<string>("");

  const parameterOptions: SelectOption[] = availableParameters.map((param) => ({
    value: param.key,
    label: param.label,
    description: param.unit ? `Unit: ${param.unit}` : undefined,
  }));

  const thresholdTypeOptions: SelectOption[] = thresholdOptions.map(
    (option) => ({
      value: option.value,
      label: option.label,
    }),
  );

  const handleAddParameter = () => {
    if (selectedParameterKey && selectedThreshold && parameterValue.trim()) {
      onAddParameter(selectedParameterKey, selectedThreshold, parameterValue);
      setSelectedParameterKey("");
      setSelectedThreshold("");
      setParameterValue("");
    }
  };

  const renderValueInput = () => {
    const baseProps = {
      value: parameterValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setParameterValue(e.target.value),
      className: "w-32",
    };

    switch (selectedThreshold) {
      case "minimum":
      case "maximum":
        return (
          <Input
            type="number"
            step="0.1"
            placeholder="Enter numeric value..."
            {...baseProps}
          />
        );
      case "equal":
      case "not_equal":
        return (
          <Input type="text" placeholder="Enter text value..." {...baseProps} />
        );
      default:
        return null;
    }
  };

  if (availableParameters.length === 0) return null;

  return (
    <div className={`space-y-4 pt-4 border-t ${className}`}>
      <Label className="text-lg font-medium">Add New Parameter</Label>
      <p className="text-sm text-gray-600">
        Select a medical parameter and set its threshold value for monitoring.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-1 gap-2">
          <Select
            options={parameterOptions}
            value={selectedParameterKey}
            onValueChange={setSelectedParameterKey}
            placeholder="Select medical parameter"
          />

          {selectedParameterKey && (
            <>
              <Select
                options={thresholdTypeOptions}
                value={selectedThreshold}
                onValueChange={setSelectedThreshold}
                placeholder="Select threshold type"
              />

              {selectedThreshold && (
                <>
                  {renderValueInput()}
                  <Button
                    onClick={handleAddParameter}
                    disabled={!parameterValue.trim()}
                  >
                    +
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParameterSelector;
