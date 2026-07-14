import { Patient } from './patient.entity';
import { PatientModel } from '../../domain/entities/patient.model';
import { Role } from '../../domain/enums/role.enum';

export class PatientMapper {
  static toDomain(entity: Patient): PatientModel {
    const model = new PatientModel();
    model.id = entity.id;
    model.email = entity.email;
    model.password = entity.password;
    model.role = entity.role;
    model.hashedRt = entity.hashedRt;
    return model;
  }

  static toOrm(model: PatientModel): Patient {
    const entity = new Patient();
    if (model.id !== undefined) entity.id = model.id;
    entity.email = model.email;
    entity.password = model.password ?? '';
    entity.role = model.role ?? Role.PATIENT;
    entity.hashedRt = model.hashedRt;
    return entity;
  }
}
