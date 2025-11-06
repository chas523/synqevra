import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection } from '../entities/connection.entity';
import { Repository } from 'typeorm';
import { MedplumClient } from '@medplum/core';
import process from 'node:process';

@Injectable()
export class MedplumConnectionService {
  constructor(
    @InjectRepository(Connection)
    private readonly connectionRepository: Repository<Connection>,
  ) {}

  private readonly clientCache = new Map<number, Promise<MedplumClient>>();

  async initMedplum(userId: number): Promise<MedplumClient> {
    if (this.clientCache.has(userId)) {
      return this.clientCache.get(userId)!;
    }
    // tenant id
    const connection = await this.connectionRepository
      .createQueryBuilder('cm')
      .leftJoinAndSelect('cm.medplum', 'medplum')
      .where('cm.user.id = :userId', { userId })
      .select(['cm.id', 'medplum'])
      .getOne();

    console.log(connection);

    if (!connection || !connection.medplum) {
      throw new InternalServerErrorException({
        statusCode: 500,
        error: 'ConnectionNotFound',
        message: 'Connection or Medplum config not found for this user.',
      });
    }

    const { client_id, client_secret } = connection.medplum;
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
          message: `Failed to authenticate with Medplum for connection ${connection.id}`,
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
}
