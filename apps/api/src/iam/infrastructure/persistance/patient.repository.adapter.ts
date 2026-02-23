import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientRepository } from '../../domain/repositories/patient.repository';
import { PatientModel } from '../../domain/entities/patient.model';
import { Patient } from './patient.entity';
import { PatientMapper } from './patient.mapper';

@Injectable()
export class PatientRepositoryAdapter extends PatientRepository {
    constructor(
        @InjectRepository(Patient)
        private readonly repository: Repository<Patient>,
    ) {
        super();
    }

    async getPatientByEmail(email: string): Promise<PatientModel | null> {
        const entity = await this.repository.findOne({ where: { email } });
        return entity ? PatientMapper.toDomain(entity) : null;
    }

    async getPatientById(id: number): Promise<PatientModel | null> {
        const entity = await this.repository.findOne({ where: { id } });
        return entity ? PatientMapper.toDomain(entity) : null;
    }

    async save(model: PatientModel): Promise<PatientModel> {
        const entity = PatientMapper.toOrm(model);
        const saved = await this.repository.save(entity);
        return PatientMapper.toDomain(saved);
    }

    async updateHashedRt(patientId: number, hashedRt: string | null): Promise<void> {
        await this.repository.update({ id: patientId }, { hashedRt });
    }
}
