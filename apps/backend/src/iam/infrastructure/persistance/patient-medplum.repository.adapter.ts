import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientMedplumRepository } from '../../domain/repositories/patient-medplum.repository';
import { PatientMedplumModel } from '../../domain/entities/patient-medplum.model';
import { PatientMedplum } from './patient-medplum.entity';
import { PatientMedplumMapper } from './patient-medplum.mapper';

@Injectable()
export class PatientMedplumRepositoryAdapter extends PatientMedplumRepository {
  constructor(
    @InjectRepository(PatientMedplum)
    private readonly repository: Repository<PatientMedplum>,
  ) {
    super();
  }

  async getByPatientId(patientId: number): Promise<PatientMedplumModel | null> {
    const entity = await this.repository.findOne({ where: { patientId } });
    return entity ? PatientMedplumMapper.toDomain(entity) : null;
  }

  async save(model: PatientMedplumModel): Promise<PatientMedplumModel> {
    const entity = PatientMedplumMapper.toOrm(model);
    const saved = await this.repository.save(entity);
    return PatientMedplumMapper.toDomain(saved);
  }
}
