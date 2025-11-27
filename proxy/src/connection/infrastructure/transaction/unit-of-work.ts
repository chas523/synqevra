import { UserRepository } from '../../../iam/domain/repositories/user.repository';
import { ConnectionRepository } from '../../domain/repositories/connection.repository';
import { QueryRunner } from 'typeorm';

export class UnitOfWork {
  constructor(
    public readonly userRepository: UserRepository,
    public readonly connectionRepository: ConnectionRepository,
    public readonly queryRunner: QueryRunner,
  ) {}

  //to be used in repositories that need direct access to the EntityManager
  // should be removed if done with refactor
  get manager() {
    return this.queryRunner.manager;
  }

  async commit(): Promise<void> {
    await this.queryRunner.commitTransaction();
  }

  async rollback(): Promise<void> {
    await this.queryRunner.rollbackTransaction();
  }

  async release(): Promise<void> {
    await this.queryRunner.release();
  }
}
