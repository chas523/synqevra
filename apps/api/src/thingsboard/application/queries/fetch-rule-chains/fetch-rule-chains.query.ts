export class FetchRuleChainsQuery {
  constructor(
    public readonly accessToken: string,
    public readonly page: number,
    public readonly pageSize: number,
    public readonly type?: string,
    public readonly sortProperty?: string,
    public readonly sortOrder?: 'ASC' | 'DESC',
  ) {}
}
