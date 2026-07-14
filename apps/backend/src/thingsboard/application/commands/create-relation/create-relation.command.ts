export class CreateRelationCommand {
  constructor(
    public readonly fromId: string,
    public readonly fromType: string,
    public readonly toId: string,
    public readonly toType: string,
    public readonly relationType: string,
    public readonly additionalInfo: any = null,
    public readonly accessToken: string,
  ) {}
}
