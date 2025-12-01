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
    });

    return entity ? ConnectionMapper.toDomain(entity) : null;
  }
}
