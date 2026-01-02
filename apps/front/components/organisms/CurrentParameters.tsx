import type {
  DeviceParameterConfig,
  DeviceParameterLimits,
  MedicalParameter,
} from "@/types/deviceParameterTypes";
import { Label, Text } from "../atoms";
import ParameterCard from "../molecules/ParameterCard";

export interface CurrentParametersProps {
  limits: DeviceParameterConfig;
  medicalParameters: MedicalParameter[];
  onRemoveLimit: (key: string) => void;
  onRemoveSpecificThreshold: (
    parameterKey: string,
    thresholdType: string
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
  console.log("Rendering CurrentParameters with limits:", limits);
  console.log("limits.limits:", Object.keys(limits.limits).length);
  console.log("limits.telemetry_keys:", limits.telemetry_keys.length);

  //no telemetry keys at all - nothing to show
  if (limits.telemetry_keys.length === 0) {
    return null;
  }

  //count how many have configured limits
  const configuredCount = limits.telemetry_keys.filter(
    (key) => limits.limits[key] && Object.keys(limits.limits[key]).length > 0
  ).length;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-lg font-medium">Current Threshold Values</Label>
        <Text size="sm" className="text-gray-500">
          {configuredCount} of {limits.telemetry_keys.length} parameter
          {limits.telemetry_keys.length !== 1 ? "s" : ""} configured
        </Text>
      </div>

      <div className="space-y-4">
        {limits.telemetry_keys.map((parameterKey) => {
          const paramInfo = medicalParameters.find(
            (p) => p.key === parameterKey
          );
          const parameterValue = limits.limits[parameterKey];
          console.log(
            "Rendering ParameterCard for:",
            parameterKey,
            parameterValue
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
