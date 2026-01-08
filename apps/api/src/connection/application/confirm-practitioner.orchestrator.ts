import { UnitOfWorkFactory } from '../infrastructure/transaction/unit-of-work.factory';
import { InitialConnectionUseCase } from './use-cases/initial-connection.use-case';
import { InitialConnectionCommand } from './dto/initial-connection.command';
import { InitialConnectionResult } from './dto/initial-connection.result';
import { Injectable } from '@nestjs/common';
import { ConfirmPractitionerUseCase } from './use-cases/confirm-practitioner.use-case';
import { ConfirmPractitionerCommandForm } from './dto/confirm-practitioner.command';
import { ConfirmPractitionerResult } from './dto/confirm-practitioner.result';

@Injectable()
export class ConfirmPractitionerOrchestrator {
  constructor(
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    private readonly confirmPractitionerUseCase: ConfirmPractitionerUseCase,
  ) {}

  async run(
    command: ConfirmPractitionerCommandForm,
    token: string,
  ): Promise<ConfirmPractitionerResult> {
    const uow = await this.unitOfWorkFactory.create();

    try {
      const result = await this.confirmPractitionerUseCase.execute(
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
