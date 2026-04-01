export class CreateRuleChainFullCommand {
  constructor(
    public readonly accessToken: string,
    public readonly payload: any,
  ) {}
}
