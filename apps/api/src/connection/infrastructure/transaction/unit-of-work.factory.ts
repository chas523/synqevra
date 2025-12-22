import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserRepository } from '../../../iam/domain/repositories/user.repository';
import { ConnectionRepository } from '../../domain/repositories/connection.repository';
import { UnitOfWork } from './unit-of-work';
import { MedplumRepository } from '../../../medplum/domain/repositories/medplum.repository';
import {
  THINGSBOARD_REPOSITORY_PORT,
  ThingsboardRepositoryPort,
} from '../../../thingsboard/application/ports/thingsboard.repository.port';
import {
  PENDING_USER_REPOSITORY_PORT,
  PendingUserRepositoryPort,
} from '../../../pending-user/application/ports/pending-user.repository.port';

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
    @Inject(THINGSBOARD_REPOSITORY_PORT)
    private readonly thingsboardRepository: ThingsboardRepositoryPort,
    @Inject(PENDING_USER_REPOSITORY_PORT)
    private readonly pendingUserRepository: PendingUserRepositoryPort,
  ) {}

  async create(): Promise<UnitOfWork> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const manager = queryRunner.manager;

    const userRepo = this.userRepository.withManager(manager);
    const connectionRepo = this.connectionRepository.withManager(manager);
    const medplumRepo = this.medplumRepository.withManager(manager);
    const thingsboardRepo = this.thingsboardRepository.withManager(manager);
    const pendingUserRepo = this.pendingUserRepository.withManager(manager);

    return new UnitOfWork(
      userRepo,
      connectionRepo,
      medplumRepo,
      thingsboardRepo,
      pendingUserRepo,
      queryRunner,
    );
  }
}
