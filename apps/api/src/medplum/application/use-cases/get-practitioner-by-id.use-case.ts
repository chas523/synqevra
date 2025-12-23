import { Injectable, Logger, Inject } from '@nestjs/common';
import { Practitioner } from '@medplum/fhirtypes';
import { MedplumClientFactory } from '../medplum-client.factory';
import { ConnectionRepository } from 'src/connection/domain/repositories/connection.repository';

@Injectable()
export class GetPractitionerByIdUseCase {
  private readonly logger = new Logger(GetPractitionerByIdUseCase.name);

  constructor(
    private readonly medplumClientFactory: MedplumClientFactory,
    @Inject(ConnectionRepository)
    private readonly connectionRepository: ConnectionRepository,
  ) {}

  async execute(userId: number, practitionerId: string): Promise<Practitioner> {
    try {
      this.logger.log(
        'Fetching practitioner:',
        practitionerId,
        'for user:',
        userId,
      );

      // Initialize Medplum client
      const client = await this.medplumClientFactory.initMedplum(userId);

      // Read practitioner
      const practitioner = await client.readResource(
        'Practitioner',
        practitionerId,
      );

      this.logger.log('Fetched practitioner:', practitionerId);

      return practitioner as Practitioner;
    } catch (error) {
      this.logger.error('Error fetching practitioner:', error);
      throw error;
    }
  }
}
