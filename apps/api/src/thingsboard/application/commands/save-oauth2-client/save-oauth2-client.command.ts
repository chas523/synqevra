import { ICommand } from '@nestjs/cqrs';

export class SaveOAuth2ClientCommand implements ICommand {
  constructor(
    public readonly accessToken: string,
    public readonly payload: any,
  ) {}
}
