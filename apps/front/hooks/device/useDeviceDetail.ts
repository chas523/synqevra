import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMedplumDevice } from "@/hooks/medplum/useMedplumDevice";
import { useMedplumPatientDevice } from "@/hooks/medplum/useMedplumPatientDevice";
import { useDevice } from "@/hooks/thingsboard/device/useDevice";
import { useUpdateDeviceAttributes } from "@/hooks/thingsboard/device/useUpdateDeviceAttributes";
import { useConnectionStatus } from "@/hooks/connection/useConnectionStatus";

import type {
  DeviceParameterConfig,
  DeviceParameterLimits,
} from "@/types/deviceParameterTypes";
import { on } from "events";

export const useDeviceDetail = (deviceId: string) => {
  const router = useRouter();

  const deviceHook = useDevice(deviceId);
  const updateHook = useUpdateDeviceAttributes(deviceId);
  const { hasMedplum } = useConnectionStatus();
  const medplumPatientDeviceHook = useMedplumPatientDevice(hasMedplum ? deviceId : undefined);
  const medplumDeviceHook = useMedplumDevice(hasMedplum ? deviceId : undefined);

  console.log("devicehook", deviceHook);
  const [limits, setLimits] = useState<DeviceParameterConfig>({
    limits: {},
    telemetry_keys: [],
  });
  const telemetryKeys = useMemo(() => {
    return (
      deviceHook.attributes?.find((attr) => attr.key === "telemetry_keys")
        ?.value || []
    );
  }, [deviceHook.attributes]);

  const currentLimits = useMemo(() => {
    return (
      (deviceHook.attributes?.find((attr) => attr.key === "limits")
        ?.value as DeviceParameterLimits) || {}
    );
  }, [deviceHook.attributes]);

  console.log("telemetryKeys", telemetryKeys);
  console.log("currentLimits", currentLimits);
  const isLoading = deviceHook.isLoading || (hasMedplum && medplumDeviceHook.isLoadingDevice);
  const hasParameters = Object.keys(limits).length > 0;
  console.log("limits", limits);

  useEffect(() => {
    setLimits({ limits: { ...currentLimits }, telemetry_keys: telemetryKeys });
  }, [currentLimits, telemetryKeys]);

  const handleBackToList = useCallback(() => {
    router.push("/devices");
  }, [router]);

  const handleRemoveLimit = useCallback((key: string) => {
    setLimits((prev) => {
      const { [key]: _, ...newLimits } = prev.limits;
      // Also remove from telemetry_keys
      //const updatedTelemetryKeys = prev.telemetry_keys.filter((k) => k !== key);
      return {
        ...prev,
        limits: newLimits,
        // telemetry_keys: updatedTelemetryKeys,
      };
    });
  }, []);

  const handleRemoveSpecificThreshold = useCallback(
    (parameterKey: string, thresholdType: string) => {
      setLimits((prev) => {
        if (!prev.limits[parameterKey]) return prev;

        const { [thresholdType]: _, ...updatedParameter } =
          prev.limits[parameterKey];

        if (Object.keys(updatedParameter).length === 0) {
          // Last threshold removed - remove from both limits and telemetry_keys
          const { [parameterKey]: __, ...newLimits } = prev.limits;
          // const updatedTelemetryKeys = prev.telemetry_keys.filter(
          //   (k) => k !== parameterKey
          // );
          return {
            ...prev,
            limits: newLimits,
            //telemetry_keys: updatedTelemetryKeys,
          };
        } else {
          return {
            ...prev,
            limits: {
              ...prev.limits,
              [parameterKey]: updatedParameter,
            },
          };
        }
      });
    },
    []
  );

  const handleAddTelemetryKey = useCallback((parameterKey: string) => {
    setLimits((prev) => {
      return prev.telemetry_keys.includes(parameterKey)
        ? prev
        : {
            ...prev,
            telemetry_keys: [...prev.telemetry_keys, parameterKey],
          };
    });
  }, []);

  const handleAddParameter = useCallback(
    (parameterKey: string, thresholdType: string, value: string) => {
      const numValue = parseFloat(value);

      setLimits((prev) => {
        const existingParam = prev.limits?.[parameterKey] ?? {};

        // Add to telemetry_keys if not already present
        const updatedTelemetryKeys = prev.telemetry_keys.includes(parameterKey)
          ? prev.telemetry_keys
          : [...prev.telemetry_keys, parameterKey];

        if (!Number.isNaN(numValue)) {
          return {
            ...prev,
            telemetry_keys: updatedTelemetryKeys,
            limits: {
              ...prev.limits,
              [parameterKey]: {
                ...existingParam,
                [thresholdType]: numValue,
              },
            },
          };
        } else {
          const existingValues = Array.isArray(existingParam[thresholdType])
            ? existingParam[thresholdType]
            : existingParam[thresholdType] !== undefined
            ? [String(existingParam[thresholdType])]
            : [];

          return {
            ...prev,
            telemetry_keys: updatedTelemetryKeys,
            limits: {
              ...prev.limits,
              [parameterKey]: {
                ...existingParam,
                [thresholdType]: [...existingValues, value],
              },
            },
          };
        }
      });
    },
    []
  );

  const handleSaveChanges = useCallback(async () => {
    try {
      await updateHook.updateAttributes(limits.limits);
      deviceHook.refresh();
    } catch (error) {
      console.error("Error updating attributes:", error);
      throw error;
    }
  }, [limits, updateHook, deviceHook]);

  const handleAssignPatient = useCallback(
    async (selectedPatientId: string) => {
      try {
        await medplumPatientDeviceHook.assignPatientToDevice(
          selectedPatientId,
          deviceId
        );
        medplumDeviceHook.refreshDevice();
      } catch (error) {
        console.error("Error assigning patient:", error);
        throw error;
      }
    },
    [medplumPatientDeviceHook, deviceId, medplumDeviceHook]
  );

  return {
    device: deviceHook.device,
    limits,
    isLoading,
    error: deviceHook.error,
    updating: updateHook.loading,
    hasParameters,

    medplumDeviceHook,
    medplumPatientDeviceHook: {
      ...medplumPatientDeviceHook,
      onAssignPatient: handleAssignPatient,
    },
    hasMedplum,

    onBackToList: handleBackToList,
    onRefresh: deviceHook.refresh,
    onSaveChanges: handleSaveChanges,
    onRemoveLimit: handleRemoveLimit,
    onRemoveSpecificThreshold: handleRemoveSpecificThreshold,
    onAddParameter: handleAddParameter,
    onAddTelemetry: handleAddTelemetryKey,
  };
};
