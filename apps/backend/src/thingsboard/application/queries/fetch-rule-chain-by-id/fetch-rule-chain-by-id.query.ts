export class FetchRuleChainByIdQuery {
  constructor(
    public readonly accessToken: string,
    public readonly id: string,
  ) {}
}
