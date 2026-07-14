export class FetchRuleChainsQuery {
  constructor(
    public readonly accessToken: string,
    public readonly page: number,
    public readonly pageSize: number,
    public readonly type?: 'CORE' | 'EDGE',
    public readonly sortProperty: string = 'createdTime',
    public readonly sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {}
}
