import type { Patient } from "@medplum/fhirtypes";
import { proxyApi } from "@/lib/api/api";
import type {} from "@/types/thingsboardDeviceTypes";

// export interface DevicesResponse {
//   data: Device[];
//   totalPages: number;
//   totalElements: number;
//   hasNext: boolean;
// }

export class PatientService {
  public static async fetchPatients(): Promise<Patient[]> {
    const { data } = await proxyApi.get<Patient[]>(`/medplum/patient`);
    return Array.isArray(data)
      ? data.map((p: Patient) => ({
          ...p,
          name: p.name ?? [
            { family: "UnknownLastName", given: ["UnknownName"] },
          ],
        }))
      : [];
  }
  public static async fetchPatientById(id: string): Promise<Patient> {
    const { data } = await proxyApi.get<Patient>(`/medplum/patient/${id}`);
    return {
      ...data,
      name: data.name ?? [
        { family: "UnknownLastName", given: ["UnknownName"] },
      ],
    };
  }

  public static async updatePatientById(
    patientData: Patient,
    id: string,
  ): Promise<Patient> {
    const { data } = await proxyApi.put<Patient>(
      `/medplum/patient/${id}`,
      patientData,
    );
    return {
      ...data,
      name: data.name ?? [
        { family: "UnknownLastName", given: ["UnknownName"] },
      ],
    };
  }

  public static async assignPatientToDevice(
    patientId: string,
    deviceId: string,
  ): Promise<void> {
    await proxyApi.post(`/medplum/patient/${patientId}/device/${deviceId}`);
  }

  public static async createPatient(patientData: Patient): Promise<Patient> {
    const { data } = await proxyApi.post<Patient>(
      `/medplum/patient`,
      patientData,
    );
    return {
      ...data,
      name: data.name ?? [
        { family: "UnknownLastName", given: ["UnknownName"] },
      ],
    };
  }
}
