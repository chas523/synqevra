import { Inject, Injectable, Logger } from '@nestjs/common';
import { Practitioner } from '@medplum/fhirtypes';
import { AttendingDoctorField } from '../../infrastructure/types/hl7-mapper.types';
import type { Cache } from 'cache-manager';
import { CACHE_CONFIG } from '../../infrastructure/constants/cache.constants';
import { MedplumClientPort } from '../../../medplum/application/ports/medplum-client.port';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

export interface PractitionerLookupResult {
  reference?: string;
  practitionerToCreate?: Partial<Practitioner>;
}
@Injectable()
export class PractitionerLookupService {
  private readonly logger = new Logger(PractitionerLookupService.name);

  constructor(
    private readonly medplumClient: MedplumClientPort,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async handle(
    attendingDoctorField: AttendingDoctorField | undefined,
    tenantId: string,
    organizationSystem: string,
  ): Promise<PractitionerLookupResult> {
    if (!attendingDoctorField) return {};

    try {
      const doctorId = attendingDoctorField.getComponent(1);
      const doctorLastName = attendingDoctorField.getComponent(2);
      const doctorFirstName = attendingDoctorField.getComponent(3);

      if (!doctorId && !doctorLastName) return {};

      const cacheKey = `${CACHE_CONFIG.KEYS.PRACTITIONER_PREFIX}${
        doctorId
          ? `id:${doctorId}`
          : `name:${doctorLastName}^${doctorFirstName}`
      }`;

      const cachedEntry = await this.cacheManager.get<{
        practitioner: Practitioner;
      }>(cacheKey);

      if (cachedEntry?.practitioner?.id) {
        this.logger.log(
          `Found cached practitioner: ${cachedEntry.practitioner.id}`,
        );
        return { reference: `Practitioner/${cachedEntry.practitioner.id}` };
      }

      let practitioner: Practitioner | null = null;

      if (doctorId) {
        practitioner = await this.medplumClient.findPractitionerById(
          doctorId,
          undefined,
          tenantId,
        );
      }

      if (!practitioner && doctorLastName) {
        practitioner = await this.medplumClient.findPractitionerBySurname(
          doctorLastName || '',
          undefined,
          tenantId,
        );
      }

      if (practitioner) {
        await this.cacheManager.set(
          cacheKey,
          { practitioner },
          CACHE_CONFIG.TTL.PRACTITIONER_CACHE,
        );

        this.logger.log(`Found existing practitioner: ${practitioner.id}`);

        return { reference: `Practitioner/${practitioner.id}` };
      }

      this.logger.log(
        'Practitioner not found - creating new practitioner object',
      );

      const newPractitioner: Partial<Practitioner> = {
        resourceType: 'Practitioner',
        identifier: doctorId
          ? [
              {
                system: organizationSystem,
                value: doctorId,
              },
            ]
          : undefined,
        name: [
          {
            use: 'official',
            family: doctorLastName,
            given: [doctorFirstName].filter(Boolean) as string[],
          },
        ],
      };

      return { practitionerToCreate: newPractitioner };
    } catch (error) {
      this.logger.warn('Error creating/finding practitioner:', error);

      return {};
    }
  }
}
