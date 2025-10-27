import { proxyApi } from "@/lib/api/api";
import { PatientName, PatientShort } from "@/types/patientTypes";
import type {} from "@/types/thingsboardDeviceTypes";

// export interface DevicesResponse {
//   data: Device[];
//   totalPages: number;
//   totalElements: number;
//   hasNext: boolean;
// }

export class PatientService {
  public static async fetchPatients(): Promise<PatientShort[]> {
    const { data } = await proxyApi.get(`/medplum/patient`);
    return Array.isArray(data)
      ? data.map((p: PatientShort) => ({
          ...p,
          name: p.name ?? [
            { family: "UnknownLastName", given: ["UnknownName"] },
          ],
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
const mocked = [
  {
    id: "1",
    name: [{ family: "Smith", given: ["John"] }],
    gender: "male",
    birthDate: "1980-01-01",
  },
  {
    id: "2",
    name: [{ family: "Doe", given: ["Jane"] }],
    gender: "female",
    birthDate: "1985-02-02",
  },
  {
    id: "3",
    name: [{ family: "Brown", given: ["Charlie"] }],
    gender: "male",
    birthDate: "1990-03-03",
  },
  {
    id: "4",
    name: [{ family: "Johnson", given: ["Emily"] }],
    gender: "female",
    birthDate: "1992-04-04",
  },
  {
    id: "5",
    name: [{ family: "Williams", given: ["David"] }],
    gender: "male",
    birthDate: "1975-05-05",
  },
  {
    id: "6",
    name: [{ family: "Jones", given: ["Sophia"] }],
    gender: "female",
    birthDate: "1988-06-06",
  },
  {
    id: "7",
    name: [{ family: "Garcia", given: ["Miguel"] }],
    gender: "male",
    birthDate: "1995-07-07",
  },
  {
    id: "8",
    name: [{ family: "Martinez", given: ["Isabella"] }],
    gender: "female",
    birthDate: "2000-08-08",
  },
];
