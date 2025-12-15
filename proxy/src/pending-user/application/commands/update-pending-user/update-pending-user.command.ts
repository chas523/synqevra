import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { PendingUserModel } from 'src/pending-user/domain/models/pending-user.model';
import { UserNotFoundError } from 'src/pending-user/domain/errors/pending-user.errors';
import { PendingUserStatus } from 'src/pending-user/domain/enums/status.enum';

export type UpdatePendingUserProps = {
  id: number;
  activationToken?: string;
  expiresAt?: Date;
  status?: PendingUserStatus;
};

export class UpdatePendingUserCommand extends Command<
  Result<PendingUserModel, UserNotFoundError>
> {
  public readonly id: number;
  public readonly activationToken?: string;
  public readonly expiresAt?: Date;
  public readonly status?: PendingUserStatus;

  constructor(dto: UpdatePendingUserProps) {
    super();
    this.id = dto.id;
    this.activationToken = dto.activationToken;
    this.expiresAt = dto.expiresAt;
    this.status = dto.status;
  }
}
