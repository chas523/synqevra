import type { Observation } from "@medplum/fhirtypes";
import useSWR from "swr";
import { ObservationService } from "@/lib/services/medplumService/observationService";

export interface UseMedplumObservationsResult {
  observations: Observation[] | null;
  isLoadingObservations: boolean;
  observationsError: Error | null;
  refreshObservations: () => void;
}

export const useMedplumObservationsByPatientId = (
  patientId: string | undefined | null,
  count?: number,
): UseMedplumObservationsResult => {
  const {
    data: observations,
    error: observationsError,
    isLoading: isLoadingObservations,
    mutate: refreshObservations,
  } = useSWR(
    patientId ? `medplum-observations-${patientId}-${count || "all"}` : null,
    () => {
      return patientId
        ? ObservationService.getPatientObservations(patientId, count)
        : null;
    },
  );

  return {
    observations: observations || null,
    isLoadingObservations,
    observationsError,
    refreshObservations,
  };
};
