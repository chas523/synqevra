export const TELEMETRY_LABELS: Record<string, string> = {
  temperature: "Temperature",
  heart_rate: "Heart Rate",
  respiratory_rate: "Respiratory Rate",
  blood_pressure_systolic: "Systolic Blood Pressure",
  blood_pressure_diastolic: "Diastolic Blood Pressure",
  oxygen_saturation: "Oxygen Saturation",
  is_awake: "Awake Status",
};

export function formatTelemetryKeyLabel(key: string): string {
  const knownLabel = TELEMETRY_LABELS[key];
  if (knownLabel) {
    return knownLabel;
  }

  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
