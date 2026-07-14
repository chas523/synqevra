import { ICommand } from '@nestjs/cqrs';

export class UploadImageCommand implements ICommand {
  constructor(
    public readonly file: Buffer,
    public readonly fileName: string,
    public readonly title: string,
    public readonly accessToken: string,
    public readonly imageSubType: string = 'IMAGE',
  ) {}
}
