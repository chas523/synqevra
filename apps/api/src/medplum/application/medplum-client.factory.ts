import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { MedplumClient } from '@medplum/core';
import { MedplumRepository } from '../domain/repositories/medplum.repository';
import process from 'node:process';

@Injectable()
export class MedplumClientFactory {
  constructor(private readonly repository: MedplumRepository) { }

  private readonly clientCache = new Map<number, Promise<MedplumClient>>();
  private readonly proxyCache = new Map<string, Promise<MedplumClient>>();
  private readonly logger = new Logger(MedplumClientFactory.name);

  async initMedplum(
    userId?: number,
    tenantId?: string,
  ): Promise<MedplumClient> {
    if (userId) {
      return this.getClientByUserId(userId);
    }
    if (tenantId) {
      return this.getClientByTenantId(tenantId);
    }

    throw new BadRequestException('Either userId or tenantId must be provided');
  }

  deleteFromCache(params: { userId?: number; tenantId?: string }): void {
    const { userId, tenantId } = params;

    if (!userId && !tenantId) {
      this.logger.warn(
        "Can't clear cache - either userId or tenantId must be provided",
      );

      return;
    }

    if (userId) {
      this.deleteUserCache(userId);
    }
    if (tenantId) {
      this.deleteProxyCache(tenantId);
    }
  }

  private async getClientByUserId(userId: number): Promise<MedplumClient> {
    if (this.clientCache.has(userId)) {
      return this.clientCache.get(userId)!;
    }

    const medplum = await this.repository.findByUserId(userId);
    if (!medplum) {
      throw new InternalServerErrorException({
        statusCode: 500,
        error: 'MedplumConnectionNotFound',
        message: 'Medplum connection not found for this user.',
      });
    }

    const { client_id, client_secret } = medplum;
    if (!client_id || !client_secret) {
      throw new InternalServerErrorException({
        statusCode: 500,
        error: 'MedplumConfigMissing',
        message: 'Missing Medplum client credentials in database.',
      });
    }

    const client = new MedplumClient({
      baseUrl: process.env.MEDPLUM_URL ?? 'http://host.docker.internal:8103',
    });

    const loginPromise = client
      .startClientLogin(client_id, client_secret)
      .then(() => client)
      .catch((err) => {
        this.clientCache.delete(userId);

        throw new ServiceUnavailableException({
          statusCode: 503,
          error: 'MedplumAuthFailed',
          message: 'Failed to authenticate with Medplum',
          reason:
            process.env.NODE_ENV !== 'production'
              ? err instanceof Error
                ? err.message
                : String(err)
              : undefined,
        });
      });

    this.clientCache.set(userId, loginPromise);
    return loginPromise;
  }

  private async getClientByTenantId(tenantId: string): Promise<MedplumClient> {
    if (this.proxyCache.has(tenantId)) {
      return this.proxyCache.get(tenantId)!;
    }

    const medplum = await this.repository.findByTenantId(tenantId);
    if (!medplum) {
      throw new InternalServerErrorException({
        statusCode: 500,
        error: 'MedplumConnectionNotFound',
        message: 'Medplum connection not found for this project.',
      });
    }

    const { client_id, client_secret } = medplum;
    if (!client_id || !client_secret) {
      throw new InternalServerErrorException({
        statusCode: 500,
        error: 'MedplumConfigMissing',
        message: 'Missing Medplum client credentials in database.',
      });
    }

    const client = new MedplumClient({
      baseUrl: process.env.MEDPLUM_URL ?? 'http://host.docker.internal:8103',
    });

    const loginPromise = client
      .startClientLogin(client_id, client_secret)
      .then(() => client)
      .catch((err) => {
        this.proxyCache.delete(tenantId);

        throw new ServiceUnavailableException({
          statusCode: 503,
          error: 'MedplumAuthFailed',
          message: 'Failed to authenticate with Medplum',
          reason:
            process.env.NODE_ENV !== 'production'
              ? err instanceof Error
                ? err.message
                : String(err)
              : undefined,
        });
      });

    this.proxyCache.set(tenantId, loginPromise);
    return loginPromise;
  }

  async initMedplumWithClientIdClientSecret(
    clientId: string,
    clientSecret: string,
  ): Promise<MedplumClient> {
    const medplumUrl =
      process.env.MEDPLUM_URL ?? 'http://host.docker.internal:8103';

    if (!clientId || !clientSecret) {
      this.logger.error(
        `Missing credentials for Medplum login! URL: ${medplumUrl}`,
      );
      throw new BadRequestException(
        'Medplum clientId and clientSecret are required',
      );
    }

    this.logger.log(
      `Initializing Medplum with URL: ${medplumUrl} (Client ID ends with: ...${clientId.slice(-4)})`,
    );

    const client = new MedplumClient({
      baseUrl: medplumUrl,
    });
    const loginPromise = client
      .startClientLogin(clientId, clientSecret)
      .then(() => client)
      .catch((err) => {
        this.logger.error(
          `Medplum login failed for client ...${clientId.slice(-4)}: ${err.message}`,
        );
        throw err;
      });
    return loginPromise;
  }

  private deleteUserCache(userId: number): void {
    this.clientCache.delete(userId);
  }

  private deleteProxyCache(tenantId: string): void {
    this.proxyCache.delete(tenantId);
  }
}
