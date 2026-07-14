import { IQuery } from '@nestjs/cqrs';

export class FetchWidgetBundleByIdQuery implements IQuery {
  constructor(
    public readonly bundleId: string,
    public readonly accessToken: string,
  ) {}
}
