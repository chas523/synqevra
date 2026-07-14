import { PatientModel } from '../entities/patient.model';

export abstract class PatientRepository {
  abstract getPatientByEmail(email: string): Promise<PatientModel | null>;
  abstract getPatientById(id: number): Promise<PatientModel | null>;
  abstract save(model: PatientModel): Promise<PatientModel>;
  abstract updateHashedRt(
    patientId: number,
    hashedRt: string | null,
  ): Promise<void>;
}
