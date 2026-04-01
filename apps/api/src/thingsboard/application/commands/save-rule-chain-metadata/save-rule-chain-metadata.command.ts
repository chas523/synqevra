export class SaveRuleChainMetadataCommand {
  constructor(
    public readonly accessToken: string,
    public readonly ruleChainId: { entityType: string; id: string },
    public readonly metadata: any,
  ) {}
}
