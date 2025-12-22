export interface MedicalParameter {
  key: string;
  label: string;
  unit?: string;
}

export interface ThresholdOption {
  value: "minimum" | "maximum" | "equal" | "not_equal";
  label: string;
}

export interface DeviceParameterLimits {
  [parameterKey: string]: {
    [thresholdType: string]: number | string | string[];
  };
}

export interface DeviceParameterConfig {
  limits: DeviceParameterLimits;
  telemetry_keys: string[];
}
