import { IQuery } from '@nestjs/cqrs';

export class FetchImagesQuery implements IQuery {
  constructor(
    public readonly page: number = 0,
    public readonly pageSize: number = 10,
    public readonly sortProperty: string = 'createdTime',
    public readonly sortOrder: 'ASC' | 'DESC' = 'DESC',
    public readonly imageSubType: string = 'IMAGE',
    public readonly includeSystemImages: boolean = false,
    public readonly textSearch: string | undefined,
    public readonly accessToken: string,
  ) {}
}
