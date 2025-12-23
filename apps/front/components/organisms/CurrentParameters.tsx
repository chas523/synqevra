import type {
  DeviceParameterLimits,
  MedicalParameter,
} from "@/types/deviceParameterTypes";
import { Label, Text } from "../atoms";
import ParameterCard from "../molecules/ParameterCard";

export interface CurrentParametersProps {
  limits: DeviceParameterLimits;
  medicalParameters: MedicalParameter[];
  onRemoveLimit: (key: string) => void;
  onRemoveSpecificThreshold: (
    parameterKey: string,
    thresholdType: string,
  ) => void;
  className?: string;
}

const CurrentParameters = ({
  limits,
  medicalParameters,
  onRemoveLimit,
  onRemoveSpecificThreshold,
  className = "",
}: CurrentParametersProps) => {
  if (Object.keys(limits).length === 0) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-lg font-medium">Current Threshold Values</Label>
        <Text size="sm" className="text-gray-500">
          {Object.keys(limits).length} parameter
          {Object.keys(limits).length !== 1 ? "s" : ""} configured
        </Text>
      </div>

      <div className="space-y-4">
        {Object.entries(limits).map(([parameterKey, parameterValue]) => {
          const paramInfo = medicalParameters.find(
            (p) => p.key === parameterKey,
          );

          return (
            <ParameterCard
              key={parameterKey}
              parameterKey={parameterKey}
              parameterValue={parameterValue}
              paramInfo={paramInfo}
              onRemoveAll={onRemoveLimit}
              onRemoveThreshold={onRemoveSpecificThreshold}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CurrentParameters;
