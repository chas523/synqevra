import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Patient, Encounter, Practitioner } from '@medplum/fhirtypes';

export class FhirMappedResourcesDto {
  @ApiProperty({
    description: 'Tenant ID associated with the HL7 message',
    type: 'string',
  })
  tenantId: string;

  @ApiProperty({
    description: 'HL7 message type (e.g., ADT, ORM, ORU)',
    type: 'string',
  })
  messageType: string;

  @ApiProperty({
    description: 'Original HL7 message for ACK generation',
    type: 'string',
  })
  rawMessage: string;

  @ApiPropertyOptional({
    description: 'Patient resource extracted from HL7 message',
  })
  patient?: Patient | Partial<Patient>;

  @ApiPropertyOptional({
    description: 'Encounter resource extracted from HL7 message',
  })
  encounter?: Encounter | Partial<Encounter>;

  @ApiPropertyOptional({
    description: 'Practitioners to be created from HL7 message',
    isArray: true,
  })
  practitionersToCreate?: Array<Partial<Practitioner>>;

  @ApiPropertyOptional({
    description: 'A40 merge operation details (if applicable)',
  })
  mergeOperation?: {
    newPatient: Patient | Partial<Patient>;
    oldPatientIdentifier: string;
  };

  @ApiProperty({
    description: 'Flag indicating if message was already processed',
    type: 'boolean',
  })
  alreadyProcessed: boolean;

  constructor(partial: Partial<FhirMappedResourcesDto>) {
    Object.assign(this, partial);
  }
}
