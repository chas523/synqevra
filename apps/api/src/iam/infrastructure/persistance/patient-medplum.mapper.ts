import { PatientMedplum } from './patient-medplum.entity';
import { PatientMedplumModel } from '../../domain/entities/patient-medplum.model';

export class PatientMedplumMapper {
    static toDomain(entity: PatientMedplum): PatientMedplumModel {
        const model = new PatientMedplumModel();
        model.patientId = entity.patientId;
        model.medplumId = entity.medplumId;
        return model;
    }

    static toOrm(model: PatientMedplumModel): PatientMedplum {
        const entity = new PatientMedplum();
        entity.patientId = model.patientId;
        entity.medplumId = model.medplumId;
        return entity;
    }
}
