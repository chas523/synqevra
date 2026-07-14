export class FetchDeviceRelationsQuery {
  constructor(
    public readonly deviceId: string,
    public readonly direction: 'FROM' | 'TO' = 'FROM',
    public readonly accessToken?: string,
  ) {}
}
