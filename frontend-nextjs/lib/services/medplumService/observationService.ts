import type { Observation } from "@medplum/fhirtypes";
import { proxyApi } from "@/lib/api/api";

export interface ObservationsResponse {
  observations: Observation[];
  totalCount: number;
}

export class ObservationService {
  public static async getPatientObservations(
    patientId: string,
    count?: number,
  ): Promise<Observation[] | null> {
    const params = new URLSearchParams();
    if (count) {
      params.append("count", count.toString());
    }

    const url = `/medplum/patient/${patientId}/observations${params.toString() ? `?${params.toString()}` : ""}`;
    const { data } = await proxyApi.get<Observation[]>(url);

    return Array.isArray(data) ? data : null;
  }
}
