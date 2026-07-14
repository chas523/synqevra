import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { UnitOfWork } from 'src/connection/infrastructure/transaction/unit-of-work';
import { ConfirmPractitionerError } from 'src/thingsboard/domain/errors/thingsboard.errors';
import { ConfirmPractitionerResponseDto } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-confirm-practitioner.response.dto';

export class ConfirmPractitionerCommand extends Command<
  Result<ConfirmPractitionerResponseDto, ConfirmPractitionerError>
> {
  constructor(
    public readonly formFields: {
      userEmail: string;
      firstName?: string;
      lastName?: string;
      userPhone?: string;
      userDescription?: string;
      password?: string;
      confirmPassword?: string;
    },
    public readonly tenantId: string,
    public readonly userId: number,
    public readonly uow: UnitOfWork,
  ) {
    super();
  }
}
