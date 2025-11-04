import type { Patient } from "@medplum/fhirtypes";
import { useState } from "react";
import useSWR from "swr";
import { PatientService } from "@/lib/services/medplumService/patientService";

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
export const useUpdateMedplumPatient = (id: string | undefined | null) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updatePatient = async (patientData: Patient) => {
    if (!id) {
      const err = new Error("Patient ID is required");
      setError(err);
      throw err;
    }
    setLoading(true);
    setError(null);
    try {
      const patient = await PatientService.updatePatientById(patientData, id);
      return patient;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updatePatient, loading, error };
};

export const useMedplumPatientById = (id: string | undefined | null) => {
  const {
    data: patient,
    error,
    isLoading,
    mutate,
  } = useSWR(id ? `medplum-patient-${id}` : null, () => {
    return id ? PatientService.fetchPatientById(id) : null;
  });

  return {
    patient: patient,
    isLoading,
    error,
    refreshPatient: mutate,
  };
};
