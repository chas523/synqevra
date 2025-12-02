import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { UserNotFoundError } from 'src/pending-user/domain/errors/pending-user.errors';

export type DeletePendingUserProps = {
  id: number;
};
export class DeletePendingUserCommand extends Command<
  Result<void, UserNotFoundError>
> {
  public readonly id: number;

  constructor(dto: DeletePendingUserProps) {
    super();
    this.id = dto.id;
  }
}
