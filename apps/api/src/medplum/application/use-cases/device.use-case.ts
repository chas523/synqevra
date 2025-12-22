import { MedplumClientPort } from '../ports/medplum-client.port';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DeviceUseCase {
  constructor(private readonly medplumClient: MedplumClientPort) {}

  async getDevice(userId: number, deviceId: string) {
    return this.medplumClient.findDeviceWithUserId(userId, deviceId);
  }

  async createDevice(
    userId: number,
    dto: { identifier: string; patientRef: string },
  ) {
    return this.medplumClient.createDevice(dto, userId);
  }

  async assignPatientToDevice(
    patientId: string,
    deviceId: string,
    userId: number,
  ) {
    return await this.medplumClient.assignPatientToDevice(
      patientId,
      deviceId,
      userId,
    );
  }
}
