import { ICommand } from '@nestjs/cqrs';

export class DeleteImageCommand implements ICommand {
  constructor(
    public readonly imageLink: string,
    public readonly accessToken: string,
    public readonly force: boolean = false,
  ) {}
}
