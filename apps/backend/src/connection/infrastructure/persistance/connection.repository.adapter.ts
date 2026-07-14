import { Injectable } from '@nestjs/common';
import { ConnectionRepository } from '../../domain/repositories/connection.repository';
import { ConnectionModel } from 'src/connection/domain/entities/connection.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection } from './connection.entity';
import { EntityManager, Repository } from 'typeorm';
import { ConnectionMapper } from './connection.mapper';

@Injectable()
export class ConnectionRepositoryAdapter extends ConnectionRepository {
  constructor(
    @InjectRepository(Connection)
    private readonly repository: Repository<Connection>,
  ) {
    super();
  }

  withManager(manager: EntityManager): ConnectionRepositoryAdapter {
    const repository = manager.getRepository(Connection);
    return new ConnectionRepositoryAdapter(repository);
  }

  create(userId: number): ConnectionModel | null {
    const entity = this.repository.create({
      user: { id: userId },
    });

    return entity ? ConnectionMapper.toDomain(entity) : null;
  }

  async save(model: ConnectionModel): Promise<ConnectionModel | null> {
    const entity = ConnectionMapper.toOrm(model);
    const saved = await this.repository.save(entity);

    return saved ? ConnectionMapper.toDomain(saved) : null;
  }

  async getConnectionByUserId(userId: number): Promise<ConnectionModel | null> {
    const entity = await this.repository.findOne({
      where: { user: { id: userId } },
      relations: { thingsboard: true, medplum: true },
    });

    return entity ? ConnectionMapper.toDomain(entity) : null;
  }

  async getOrCreateByUserId(userId: number): Promise<ConnectionModel> {
    console.log('userID: ', userId);
    let entity = await this.repository.findOne({
      where: { user: { id: userId } },
      relations: { thingsboard: true, medplum: true },
    });
    console.log('entity: ', entity);
    if (!entity) {
      console.log('Creating new Connection entity');
      entity = this.repository.create({
        user: { id: userId },
      });
      console.log('New entity before save: ', entity);
      entity = await this.repository.save(entity);
      console.log('New entity after save: ', entity);
    }
    console.log('Returning entidty: ', entity);
    return ConnectionMapper.toDomain(entity);
  }
  async getConnectionByTenantId(
    tenantId: string,
  ): Promise<ConnectionModel | null> {
    const entity = await this.repository.findOne({
      where: {
        thingsboard: {
          tenantId: tenantId,
        },
      },
      relations: ['thingsboard', 'medplum'],
    });

    return entity ? ConnectionMapper.toDomain(entity) : null;
  }
}
