export class DeleteRuleChainCommand {
  constructor(
    public readonly accessToken: string,
    public readonly ruleChainId: string,
  ) {}
}
