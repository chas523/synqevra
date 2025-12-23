import { Injectable, Logger, Inject } from '@nestjs/common';
import { Practitioner } from '@medplum/fhirtypes';
import { MedplumClientFactory } from '../medplum-client.factory';
import { ConnectionRepository } from 'src/connection/domain/repositories/connection.repository';

@Injectable()
export class GetPractitionerListUseCase {
  private readonly logger = new Logger(GetPractitionerListUseCase.name);

  constructor(
    private readonly medplumClientFactory: MedplumClientFactory,
    @Inject(ConnectionRepository)
    private readonly connectionRepository: ConnectionRepository,
  ) {}

  async execute(userId: number): Promise<Practitioner[]> {
    try {
      this.logger.log('Fetching practitioner list for user:', userId);

      // Initialize Medplum client
      const client = await this.medplumClientFactory.initMedplum(userId);

      // Search for practitioners
      const practitioners = await client.searchResources('Practitioner');

      this.logger.log('Found practitioners count:', practitioners.length);

      return practitioners as Practitioner[];
    } catch (error) {
      this.logger.error('Error fetching practitioners:', error);
      throw error;
    }
  }
}
