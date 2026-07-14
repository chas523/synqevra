import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import {
  Asset,
  CreateAssetRequest,
} from 'src/thingsboard/application/ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

export type CreateAssetErrors = ThingsboardApiException;

export type CreateAssetProps = {
  accessToken: string;
  payload: CreateAssetRequest;
};

export class CreateAssetCommand extends Command<
  Result<Asset, CreateAssetErrors>
> {
  public readonly accessToken: string;
  public readonly payload: CreateAssetRequest;

  constructor(props: CreateAssetProps) {
    super();
    this.accessToken = props.accessToken;
    this.payload = props.payload;
  }
}
