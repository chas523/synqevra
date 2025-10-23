import { proxyApi } from "@/lib/api/api";
import type {} from "@/types/thingsboardDeviceTypes";
import { PatientName } from "./patientService";

export class MedplumDeviceService {
  public static async fetchMedplumDevice(
    deviceId: string,
  ): Promise<MedplumDevice> {
    const { data } = await proxyApi.get<MedplumDevice>(
      `/medplum/device/${deviceId}`,
    );
    
    const result = {
      id: data.id,
      patient: data.patient ? { display: data.patient.display } : null,
    };
  
    return result;
  }
}

export type MedplumDevice = {
  id: string;
  patient: { display: string } | null;
};
