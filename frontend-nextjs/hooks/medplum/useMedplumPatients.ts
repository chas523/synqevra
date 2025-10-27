import { useCallback, useState } from "react";
import useSWR from "swr";
import { PatientService } from "@/lib/services/medplumService/patientService";
import { DeviceService } from "@/lib/services/thingsboardServices/deviceService";
import { PatientName, PatientShort } from "@/types/patientTypes";

export interface UseMedplumPatientResult {
  patientList: PatientShort[] | null;
  isLoadingPatients: boolean;
  patientsError: Error | null;
  refreshPatients: () => void;
}

export const useMedplumPatients = (): UseMedplumPatientResult => {
  const {
    data: patientList,
    error: patientsError,
    isLoading: isLoadingPatients,
    mutate: refreshPatients,
  } = useSWR("medplum-patients-2", () => PatientService.fetchPatients());
  console.log(patientList);
  return {
    patientList: patientList || null,
    isLoadingPatients,
    patientsError,
    refreshPatients,
  };
};
