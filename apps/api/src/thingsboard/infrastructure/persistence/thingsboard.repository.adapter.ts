import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { EntityManager, Repository } from 'typeorm';
import { ThingsboardRepositoryPort } from 'src/thingsboard/application/ports/thingsboard.repository.port';
import { Thingsboard } from './thingsboard.entity';
import { ThingsboardModel } from 'src/thingsboard/domain/models/thingsboard.model';
import { ThingsboardMapper } from './thingsboard.mapper';

@Injectable()
export class ThingsboardRepositoryAdapter implements ThingsboardRepositoryPort {
  constructor(
    @InjectRepository(Thingsboard)
    private readonly repository: Repository<Thingsboard>,
  ) { }

  withManager(manager: EntityManager): ThingsboardRepositoryAdapter {
    const repository = manager.getRepository(Thingsboard);
    return new ThingsboardRepositoryAdapter(repository);
  }

  async save(thingsboard: ThingsboardModel): Promise<ThingsboardModel> {
    const ormEntity = ThingsboardMapper.toOrm(thingsboard);
    const saved = await this.repository.save(ormEntity);
    return ThingsboardMapper.toDomain(saved);
  }

  async findByUserId(userId: number): Promise<ThingsboardModel | null> {
    const ormEntity = await this.repository.findOne({
      where: { connection: { user: { id: userId } } },
      relations: { connection: { user: true } },
    });
    if (!ormEntity) {
      return null;
    }
    return ThingsboardMapper.toDomain(ormEntity);
  }

  async update(thingsboard: ThingsboardModel): Promise<ThingsboardModel> {
    const ormEntity = ThingsboardMapper.toOrm(thingsboard);
    const updated = await this.repository.save(ormEntity);
    return ThingsboardMapper.toDomain(updated);
  }

  async findByTenantId(tenantId: string): Promise<ThingsboardModel | null> {
    const ormEntity = await this.repository.findOne({
      where: { tenantId },
      relations: { connection: true },
    });
    return ormEntity ? ThingsboardMapper.toDomain(ormEntity) : null;
  }

  async getTokens(userId: number): Promise<ThingsboardModel | null> {
    const entity = await this.repository.findOne({
      where: { connection: { user: { id: userId } } },
      relations: { connection: true },
    });

    return entity ? ThingsboardMapper.toDomain(entity) : null;
  }
}
