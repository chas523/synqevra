import { Injectable } from '@nestjs/common';
import { MedplumClientPort } from '../ports/medplum-client.port';
import { Patient } from '@medplum/fhirtypes';

@Injectable()
export class PatientUseCase {
  constructor(private readonly medplumClient: MedplumClientPort) {}

  async getPatientList(userId: number) {
    return this.medplumClient.getPatientList(userId);
  }

  async getPatientById(id: string, userId: number) {
    return this.medplumClient.findPatientById(id, userId);
  }

  async updatePatient(id: string, patientDto: Patient, userId: number) {
    return this.medplumClient.updatePatient(id, patientDto, userId);
  }

  async createPatient(patientDto: Patient, userId: number) {
    return this.medplumClient.createPatient(patientDto, userId);
  }

  async getPatientObservations(id: string, userId: number, count?: number) {
    return this.medplumClient.findPatientObservations(id, count, userId);
  }
}
