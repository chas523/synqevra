import { Injectable } from '@nestjs/common';
import { MedplumRepository } from '../../domain/repositories/medplum.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Medplum } from './medplum.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateMedplumCommand } from 'src/medplum/application/dto/create-medplum.command';
import { MedplumModel } from 'src/medplum/domain/entities/medplum.model';
import { MedplumMapper } from './medplum.mapper';

@Injectable()
export class MedplumRepositoryAdapter extends MedplumRepository {
  constructor(
    @InjectRepository(Medplum)
    private readonly repository: Repository<Medplum>,
  ) {
    super();
  }

  withManager(manager: EntityManager): MedplumRepositoryAdapter {
    const repository = manager.getRepository(Medplum);
    return new MedplumRepositoryAdapter(repository);
  }

  create(command: CreateMedplumCommand): MedplumModel | null {
    const entity = this.repository.create(command);

    return entity ? MedplumMapper.toDomain(entity) : null;
  }

  async save(model: MedplumModel): Promise<MedplumModel | null> {
    const entity = MedplumMapper.toOrm(model);
    const saved = await this.repository.save(entity);

    return saved ? MedplumMapper.toDomain(saved) : null;
  }

  async findById(id: number): Promise<MedplumModel | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? MedplumMapper.toDomain(entity) : null;
  }

  async findByUserId(userId: number): Promise<MedplumModel | null> {
    const entity = await this.repository
      .createQueryBuilder('medplum')
      .innerJoin('medplum.connection', 'connection')
      .innerJoin('connection.user', 'user')
      .where('user.id = :userId', { userId })
      .getOne();

    return entity ? MedplumMapper.toDomain(entity) : null;
  }

  async findByTenantId(tenantId: string): Promise<MedplumModel | null> {
    const entity = await this.repository
      .createQueryBuilder('medplum')
      .innerJoin('medplum.connection', 'connection')
      .innerJoin('connection.thingsboard', 'tb')
      .where('tb.tenantId = :tenantId', { tenantId })
      .getOne();

    return entity ? MedplumMapper.toDomain(entity) : null;
  }
}
