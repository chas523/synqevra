import { UnitOfWorkFactory } from '../infrastructure/transaction/unit-of-work.factory';
import { InitialConnectionUseCase } from './use-cases/initial-connection.use-case';
import { InitialConnectionCommand } from './dto/initial-connection.command';
import { InitialConnectionResult } from './dto/initial-connection.result';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InitialConnectionOrchestrator {
  constructor(
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    private readonly initialConnectionUseCase: InitialConnectionUseCase,
  ) {}

  async run(
    command: InitialConnectionCommand,
    token: string,
  ): Promise<InitialConnectionResult> {
    const uow = await this.unitOfWorkFactory.create();

    try {
      const result = await this.initialConnectionUseCase.execute(
        command,
        token,
        uow,
      );

      await uow.commit();
      return result;
    } catch (error) {
      await uow.rollback();
      throw error;
    } finally {
      await uow.release();
    }
  }
}
