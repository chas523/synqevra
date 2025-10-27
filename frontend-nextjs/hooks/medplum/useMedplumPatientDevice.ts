import { useState, useCallback } from "react";
import useSWR from "swr";
import {
  PatientNames,
  PatientService,
} from "@/lib/services/medplumService/patientService";
import { DeviceService } from "@/lib/services/thingsboardServices/deviceService";

export interface UseMedplumPatientDeviceResult {
  patientList: PatientNames | null;
  isLoadingPatients: boolean;
  patientsError: Error | null;
  refreshPatients: () => void;
  assignPatientToDevice: (patientId: string, deviceId: string) => Promise<any>;
  isAssigning: boolean;
  assignError: Error | null;
}

export const useMedplumPatientDevice = (
  deviceId?: string,
): UseMedplumPatientDeviceResult => {
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState<Error | null>(null);

  const {
    data: patientList,
    error: patientsError,
    isLoading: isLoadingPatients,
    mutate: refreshPatients,
  } = useSWR("medplum-patients", () => PatientService.fetchPatients());

  // Assign patient to device function
  const assignPatientToDevice = async (
    patientId: string,
    targetDeviceId: string,
  ) => {
    const finalDeviceId = targetDeviceId || deviceId;

    if (!finalDeviceId) {
      throw new Error("Device ID is required for assignment");
    }

    setIsAssigning(true);
    setAssignError(null);

    try {
      const result = await PatientService.assignPatientToDevice(
        patientId,
        finalDeviceId,
      );
      return result;
    } catch (err) {
      setAssignError(err as Error);
      throw err;
    } finally {
      setIsAssigning(false);
    }
  };

  return {
    patientList: patientList || null,
    isLoadingPatients,
    patientsError,
    refreshPatients,
    assignPatientToDevice,
    isAssigning,
    assignError,
  };
};
