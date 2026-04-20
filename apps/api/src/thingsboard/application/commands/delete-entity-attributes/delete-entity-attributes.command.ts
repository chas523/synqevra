import { ICommand } from '@nestjs/cqrs';

export class DeleteEntityAttributesCommand implements ICommand {
  constructor(
    public readonly accessToken: string,
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly scope: 'SERVER_SCOPE' | 'CLIENT_SCOPE' | 'SHARED_SCOPE',
    public readonly keys: string,
  ) {}
}
