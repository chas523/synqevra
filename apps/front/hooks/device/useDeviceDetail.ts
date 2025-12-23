import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMedplumDevice } from "@/hooks/medplum/useMedplumDevice";
import { useMedplumPatientDevice } from "@/hooks/medplum/useMedplumPatientDevice";
import { useDevice } from "@/hooks/thingsboard/device/useDevice";
import { useUpdateDeviceAttributes } from "@/hooks/thingsboard/device/useUpdateDeviceAttributes";
import type { DeviceParameterLimits } from "@/types/deviceParameterTypes";

export const useDeviceDetail = (deviceId: string) => {
  const router = useRouter();

  const deviceHook = useDevice(deviceId);
  const updateHook = useUpdateDeviceAttributes(deviceId);
  const medplumPatientDeviceHook = useMedplumPatientDevice(deviceId);
  const medplumDeviceHook = useMedplumDevice(deviceId);

  const [limits, setLimits] = useState<DeviceParameterLimits>({});

  const currentLimits = useMemo(() => {
    return (
      (deviceHook.attributes?.find((attr) => attr.key === "limits")
        ?.value as DeviceParameterLimits) || {}
    );
  }, [deviceHook.attributes]);

  const isLoading = deviceHook.isLoading || medplumDeviceHook.isLoadingDevice;
  const hasParameters = Object.keys(limits).length > 0;

  useEffect(() => {
    setLimits(currentLimits);
  }, [currentLimits]);

  const handleBackToList = useCallback(() => {
    router.push("/devices");
  }, [router]);

  const handleRemoveLimit = useCallback((key: string) => {
    setLimits((prev) => {
      const { [key]: _, ...newLimits } = prev;
      return newLimits;
    });
  }, []);

  const handleRemoveSpecificThreshold = useCallback(
    (parameterKey: string, thresholdType: string) => {
      setLimits((prev) => {
        if (!prev[parameterKey]) return prev;

        const { [thresholdType]: _, ...updatedParameter } = prev[parameterKey];

        if (Object.keys(updatedParameter).length === 0) {
          const { [parameterKey]: __, ...newLimits } = prev;
          return newLimits;
        } else {
          return {
            ...prev,
            [parameterKey]: updatedParameter,
          };
        }
      });
    },
    [],
  );

  const handleAddParameter = useCallback(
    (parameterKey: string, thresholdType: string, value: string) => {
      const numValue = parseFloat(value);

      setLimits((prev) => {
        const existingParam = prev?.[parameterKey] ?? {};

        if (!Number.isNaN(numValue)) {
          return {
            ...prev,
            [parameterKey]: {
              ...existingParam,
              [thresholdType]: numValue,
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
            [parameterKey]: {
              ...existingParam,
              [thresholdType]: [...existingValues, value],
            },
          };
        }
      });
    },
    [],
  );

  const handleSaveChanges = useCallback(async () => {
    try {
      await updateHook.updateAttributes(limits);
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
          deviceId,
        );
        medplumDeviceHook.refreshDevice();
      } catch (error) {
        console.error("Error assigning patient:", error);
        throw error;
      }
    },
    [medplumPatientDeviceHook, deviceId, medplumDeviceHook],
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

    onBackToList: handleBackToList,
    onRefresh: deviceHook.refresh,
    onSaveChanges: handleSaveChanges,
    onRemoveLimit: handleRemoveLimit,
    onRemoveSpecificThreshold: handleRemoveSpecificThreshold,
    onAddParameter: handleAddParameter,
  };
};
