import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { EntityViewTypeInfo } from 'src/thingsboard/application/ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

export type FetchEntityViewTypesErrors = ThingsboardApiException;

export type FetchEntityViewTypesProps = {
  accessToken: string;
};

export class FetchEntityViewTypesCommand extends Command<
  Result<EntityViewTypeInfo[], FetchEntityViewTypesErrors>
> {
  public readonly accessToken: string;

  constructor(props: FetchEntityViewTypesProps) {
    super();
    this.accessToken = props.accessToken;
  }
}
