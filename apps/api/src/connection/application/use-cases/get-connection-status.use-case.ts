import { Injectable, Inject } from '@nestjs/common';
import { ConnectionRepository } from '../../../connection/domain/repositories/connection.repository';

export interface ConnectionStatusResult {
  medplum: boolean | null;
}

@Injectable()
export class GetConnectionStatusUseCase {
  constructor(
    @Inject(ConnectionRepository)
    private readonly connectionRepository: ConnectionRepository,
  ) {}

  async execute(tenantId: string): Promise<ConnectionStatusResult> {
    // getConnectionByTenantId already filters WHERE medplum_id IS NOT NULL
    // returns null if no connection exists OR medplum is not linked
    const connection =
      await this.connectionRepository.getConnectionByTenantId(tenantId);

    if (connection && connection.medplumId) {
      return { medplum: true };
    }

    return { medplum: null };
  }
}
