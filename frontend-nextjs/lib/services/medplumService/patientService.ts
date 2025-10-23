import { proxyApi } from "@/lib/api/api";
import type {} from "@/types/thingsboardDeviceTypes";

// export interface DevicesResponse {
//   data: Device[];
//   totalPages: number;
//   totalElements: number;
//   hasNext: boolean;
// }
export interface PatientName {
  id: string;
  family: string;
  given: string[];
}

export type PatientNames = PatientName[];

export class PatientService {
  public static async fetchPatients(): Promise<PatientNames> {
    const { data } = await proxyApi.get(`/medplum/patient`);
    // Map FHIR Patient to PatientName type
    return Array.isArray(data)
      ? data.map((p: any) => ({
          id: p.id,
          family: p.name?.[0]?.family ?? "UnknownLastName",
          given: p.name?.[0]?.given ?? ["UnknownName"],
        }))
      : [];
  }

  public static async assignPatientToDevice(
    patientId: string,
    deviceId: string,
  ): Promise<void> {
    await proxyApi.post(`/medplum/patient/${patientId}/device/${deviceId}`);
  }
}
