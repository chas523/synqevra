export class SaveEntityAttributesCommand {
  constructor(
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly scope: 'SERVER_SCOPE' | 'CLIENT_SCOPE' | 'SHARED_SCOPE',
    public readonly attributes: Record<string, unknown>,
    public readonly accessToken: string,
  ) {}
}
