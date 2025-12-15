import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserRepository } from '../../../iam/domain/repositories/user.repository';
import { ConnectionRepository } from '../../domain/repositories/connection.repository';
import { UnitOfWork } from './unit-of-work';
import { MedplumRepository } from '../../../medplum/domain/repositories/medplum.repository';

@Injectable()
export class UnitOfWorkFactory {
  constructor(
    private readonly dataSource: DataSource,
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
    @Inject(ConnectionRepository)
    private readonly connectionRepository: ConnectionRepository,
    @Inject(MedplumRepository)
    private readonly medplumRepository: MedplumRepository,
  ) {}

  async create(): Promise<UnitOfWork> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const manager = queryRunner.manager;

    const userRepo = this.userRepository.withManager(manager);
    const connectionRepo = this.connectionRepository.withManager(manager);
    const medplumRepo = this.medplumRepository.withManager(manager);

    return new UnitOfWork(userRepo, connectionRepo, medplumRepo, queryRunner);
  }
}
