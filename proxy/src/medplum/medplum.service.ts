import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { MedplumClient } from '@medplum/core';
import * as process from 'node:process';

@Injectable()
export class MedplumService {
  private readonly client = new MedplumClient({
    baseUrl: process.env.MEDPLUM_URL ?? 'http://host.docker.internal:8103',
  });

  private loginPromise: Promise<MedplumClient> | null = null;

  initMedplum(): Promise<MedplumClient> {
    if (!this.loginPromise) {
      const clientId = process.env.MEDPLUM_CLIENT_ID as string;
      const clientSecret = process.env.MEDPLUM_CLIENT_SECRET as string;

      if (!clientId || !clientSecret) {
        throw new InternalServerErrorException({
          statusCode: 500,
          error: 'MedplumConfigMissing',
          message: 'Missing Medplum client credentials (env vars).',
        });
      }

      this.loginPromise = this.client
        .startClientLogin(clientId, clientSecret)
        .then(() => this.client)
        .catch((err) => {
          this.loginPromise = null;
          throw new ServiceUnavailableException({
            statusCode: 503,
            error: 'MedplumAuthFailed',
            message: `Failed to authenticate with Medplum`,
            reason:
              process.env.NODE_ENV !== 'production'
                ? err instanceof Error
                  ? err.message
                  : String(err)
                : undefined,
          });
        });
    }
    return this.loginPromise;
  }
}
