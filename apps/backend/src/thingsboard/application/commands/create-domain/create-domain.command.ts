import { ICommand } from '@nestjs/cqrs';

export class CreateDomainCommand implements ICommand {
  constructor(
    public readonly accessToken: string,
    public readonly payload: {
      name: string;
      oauth2Enabled: boolean;
      propagateToEdge: boolean;
    },
    public readonly oauth2ClientIds: string[],
  ) {}
}
