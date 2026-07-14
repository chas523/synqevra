import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { RegisterTenantError } from 'src/thingsboard/domain/errors/thingsboard.errors';
import { RegisterTenantRequestDto } from 'src/thingsboard/interface/rest/dtos/request/register-tenant.request.dto';
import { RegisterTenantResponseDto } from 'src/thingsboard/interface/rest/dtos/response/register-tenant.response.dto';
import { UnitOfWork } from '../../../../connection/infrastructure/transaction/unit-of-work';

export class RegisterTenantCommand extends Command<
  Result<RegisterTenantResponseDto, RegisterTenantError>
> {
  constructor(
    public readonly userId: number,
    public readonly formData: RegisterTenantRequestDto,
    public readonly uow: UnitOfWork,
  ) {
    super();
  }
}
