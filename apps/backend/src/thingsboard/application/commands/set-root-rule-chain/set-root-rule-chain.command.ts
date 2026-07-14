export class SetRootRuleChainCommand {
  constructor(
    public readonly accessToken: string,
    public readonly ruleChainId: string,
  ) {}
}
