import { MedplumModel } from '../entities/medplum.model';
import { CreateMedplumCommand } from '../../application/dto/create-medplum.command';
import { EntityManager } from 'typeorm';
import { MedplumRepositoryAdapter } from '../../infrastructure/persistance/medplum.repository.adapter';

export abstract class MedplumRepository {
  abstract withManager(manager: EntityManager): MedplumRepositoryAdapter;
  abstract create(command: CreateMedplumCommand): MedplumModel | null;
  abstract save(model: MedplumModel): Promise<MedplumModel | null>;
  abstract findByUserId(userId: number): Promise<MedplumModel | null>;
  abstract findByTenantId(tenantId: string): Promise<MedplumModel | null>;
}
