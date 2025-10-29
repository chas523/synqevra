import { NewPatientRequest } from "@medplum/core";
import { Patient } from "@medplum/fhirtypes";
import { useCallback, useState } from "react";
import useSWR from "swr";
import { PatientService } from "@/lib/services/medplumService/patientService";
import { DeviceService } from "@/lib/services/thingsboardServices/deviceService";
import { PatientName, PatientShort } from "@/types/patientTypes";

export interface UseMedplumPatientResult {
  patientList: Patient[] | null;
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

export const useCreateMedplumPatient = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createPatient = async (patientData: Patient) => {
    setLoading(true);
    setError(null);
    try {
      const patient = await PatientService.createPatient(patientData);
      return patient;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createPatient, loading, error };
};
