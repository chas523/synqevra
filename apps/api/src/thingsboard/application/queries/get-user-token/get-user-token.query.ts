export class GetUserTokenQuery {
  constructor(
    public readonly userId: string,
    public readonly sysAdminAccessToken: string,
  ) {}
}
