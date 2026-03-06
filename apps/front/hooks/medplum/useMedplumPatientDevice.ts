import { useCallback, useState } from "react";
import useSWR from "swr";
import { PatientService } from "@/lib/services/medplumService/patientService";
import { DeviceService } from "@/lib/services/thingsboardServices/deviceService";
import { PatientName, PatientShort } from "@/types/patientTypes";

export interface UseMedplumPatientDeviceResult {
  patientList: PatientShort[] | null;
  isLoadingPatients: boolean;
  patientsError: Error | null;
  refreshPatients: () => void;
  assignPatientToDevice: (patientId: string, deviceId: string) => Promise<any>;
  isAssigning: boolean;
  assignError: Error | null;
}

export const useMedplumPatientDevice = (
  deviceId?: string
): UseMedplumPatientDeviceResult => {
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState<Error | null>(null);

  const {
    data: patientList,
    error: patientsError,
    isLoading: isLoadingPatients,
    mutate: refreshPatients,
  } = useSWR(deviceId ? "medplum-patients" : null, async () => {
    const patients = await PatientService.fetchPatients();
    return patients.map(
      (patient) =>
        ({
          id: patient.id || "",
          name: patient.name || [],
          photo: patient.photo,
          telecom: patient.telecom?.filter(
            (t) => t.system === "phone" && t.use === "mobile"
          ),
        } as PatientShort)
    );
  });

  // Assign patient to device function
  const assignPatientToDevice = async (
    patientId: string,
    targetDeviceId: string
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
        finalDeviceId
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
