"use client";

import { useParams } from "next/navigation";
import { DeviceDetailTemplate } from "@/components/templates";
import { useDeviceDetail } from "@/hooks/device/useDeviceDetail";
import type {
  MedicalParameter,
  ThresholdOption,
} from "@/types/deviceParameterTypes";

const MEDICAL_PARAMETERS: MedicalParameter[] = [
  { key: "temperature", label: "Temperature (°C)", unit: "°C" },
  { key: "heart_rate", label: "Heart Rate (BPM)", unit: "BPM" },
  { key: "oxygen_saturation", label: "Oxygen Saturation (%)", unit: "%" },
  { key: "respiratory_rate", label: "Respiratory Rate (RPM)", unit: "RPM" },
  { key: "is_awake", label: "Is Awake (Yes/No)" },
];

const THRESHOLD_OPTIONS: ThresholdOption[] = [
  { value: "minimum", label: "Minimum" },
  { value: "maximum", label: "Maximum" },
  { value: "equal", label: "Equal" },
  { value: "not_equal", label: "NotEqual" },
];

const DeviceDetailPage = () => {
  const { id } = useParams();
  const deviceId = id as string;

  const deviceDetail = useDeviceDetail(deviceId);

  return (
    <DeviceDetailTemplate
      {...deviceDetail}
      medicalParameters={MEDICAL_PARAMETERS}
      thresholdOptions={THRESHOLD_OPTIONS}
    />
  );
};

export default DeviceDetailPage;
