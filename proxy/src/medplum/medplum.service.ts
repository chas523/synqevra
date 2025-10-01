import { Injectable } from '@nestjs/common';
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

      console.log(
        'Attempting to connect to Medplum at:',
        this.client.getBaseUrl(),
      );
      console.log('Using client ID:', clientId ? 'ID exists' : 'ID missing');

      this.loginPromise = this.client
        .startClientLogin(clientId, clientSecret)
        .then(() => this.client);
    }
    return this.loginPromise;
  }
}
