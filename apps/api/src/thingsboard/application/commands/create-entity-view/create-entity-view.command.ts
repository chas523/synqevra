import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import {
  CreateEntityViewRequest,
  EntityView,
} from 'src/thingsboard/application/ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

export type CreateEntityViewErrors = ThingsboardApiException;

export type CreateEntityViewProps = {
  accessToken: string;
  payload: CreateEntityViewRequest;
};

export class CreateEntityViewCommand extends Command<
  Result<EntityView, CreateEntityViewErrors>
> {
  public readonly accessToken: string;
  public readonly payload: CreateEntityViewRequest;

  constructor(props: CreateEntityViewProps) {
    super();
    this.accessToken = props.accessToken;
    this.payload = props.payload;
  }
}
