import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { CreateActivationLinkError } from 'src/mailer/domain/errors/mailer.errors';

export type CreateActivationLinkProps = {
  firstname: string;
  lastname: string;
  email: string;
};
export class CreateActivationLinkCommand extends Command<
  Result<void, CreateActivationLinkError>
> {
  public readonly firstname: string;
  public readonly lastname: string;
  public readonly email: string;

  constructor(dto: CreateActivationLinkProps) {
    super();
    this.firstname = dto.firstname;
    this.lastname = dto.lastname;
    this.email = dto.email;
  }
}
