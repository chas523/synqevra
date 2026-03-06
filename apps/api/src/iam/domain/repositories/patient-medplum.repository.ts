import { PatientMedplumModel } from '../entities/patient-medplum.model';

export abstract class PatientMedplumRepository {
  abstract getByPatientId(
    patientId: number,
  ): Promise<PatientMedplumModel | null>;
  abstract save(model: PatientMedplumModel): Promise<PatientMedplumModel>;
}
