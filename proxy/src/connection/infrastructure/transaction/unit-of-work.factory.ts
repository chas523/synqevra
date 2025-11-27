import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserRepositoryAdapter } from '../../../iam/infrastructure/persistance/user.repository.adapter';
import { ConnectionRepositoryAdapter } from '../persistance/connection.repository.adapter';
import { UnitOfWork } from './unit-of-work';

@Injectable()
export class UnitOfWorkFactory {
  constructor(
    private readonly dataSource: DataSource,
    private readonly userRepositoryAdapter: UserRepositoryAdapter,
    private readonly connectionRepositoryAdapter: ConnectionRepositoryAdapter,
  ) {}

  async create(): Promise<UnitOfWork> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const manager = queryRunner.manager;

    const userRepo = this.userRepositoryAdapter.withManager(manager);
    const connectionRepo =
      this.connectionRepositoryAdapter.withManager(manager);

    return new UnitOfWork(userRepo, connectionRepo, queryRunner);
  }
}
