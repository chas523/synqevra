import type { Practitioner } from "@medplum/fhirtypes";
import { proxyApi } from "@/lib/api/api";
import type { FuturePractitionerData } from "@/types/practitionerTypes";
import type {} from "@/types/thingsboardDeviceTypes";

// export interface DevicesResponse {
//   data: Device[];
//   totalPages: number;
//   totalElements: number;
//   hasNext: boolean;
// }

export class PractitionerService {
  public static async fetchPractitioners(): Promise<Practitioner[]> {
    const response = await proxyApi.get<Practitioner[]>(
      `/medplum/practitioners`
    );
    const data = response.data ?? [];
    return data;

    // const mockPractitioners: Practitioner[] = [
    //   {
    //     resourceType: "Practitioner",
    //     id: "1",
    //     name: [{ family: "Smith", given: ["John"] }],
    //   },
    //   {
    //     resourceType: "Practitioner",
    //     id: "2",
    //     name: [{ family: "Johnson", given: ["Jane"] }],
    //   },
    //   {
    //     resourceType: "Practitioner",
    //     id: "3",
    //     name: [{ family: "Williams", given: ["Robert"] }],
    //   },
    // ];

    // return mockPractitioners.map((p: Practitioner) => ({
    //   ...p,
    //   name: p.name ?? [{ family: "UnknownLastName", given: ["UnknownName"] }],
    // }));
  }

  //   public static async fetchPractitionerById(id: string): Promise<Practitioner> {
  //     const { data } = await proxyApi.get<Practitioner>(
  //       `/medplum/practitioner/${id}`,
  //     );
  //     return {
  //       ...data,
  //       name: data.name ?? [
  //         { family: "UnknownLastName", given: ["UnknownName"] },
  //       ],
  //     };
  //   }

  //   public static async updatePractitionerById(
  //     practitionerData: Practitioner,
  //     id: string,
  //   ): Promise<Practitioner> {
  //     const { data } = await proxyApi.put<Practitioner>(
  //       `/medplum/practitioner/${id}`,
  //       practitionerData,
  //     );
  //     return {
  //       ...data,
  //       name: data.name ?? [
  //         { family: "UnknownLastName", given: ["UnknownName"] },
  //       ],
  //     };
  //   }

  //   public static async assignPractitionerToDevice(
  //     practitionerId: string,
  //     deviceId: string,
  //   ): Promise<void> {
  //     await proxyApi.post(
  //       `/medplum/practitioner/${practitionerId}/device/${deviceId}`,
  //     );
  //   }

  public static async invite(
    futurePractitionerData: FuturePractitionerData
  ): Promise<void> {
    await proxyApi.post<void>(`/auth/invite`, futurePractitionerData);
  }

  public static async configurePractitioner(
    token: string,
    data: {
      firstName: string;
      lastName: string;
      userEmail: string;
      userPhone?: string;
      userDescription?: string;
      password: string;
      confirmPassword: string;
    }
  ): Promise<void> {
    await proxyApi.post<void>(
      `/connection/confirm-practitioner?token=${token}`,
      {
        ...data,
      }
    );
  }
}
