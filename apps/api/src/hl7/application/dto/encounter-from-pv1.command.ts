import type { Encounter, Patient, Practitioner } from '@medplum/fhirtypes';
import { Hl7Message } from '@medplum/core';
import { OrganizationConfig } from './organization-config.command';

export interface EncounterFromPv1Command {
  message: Hl7Message;
  messageType: string;
  tenantId: string;
  patient: Partial<Patient>;
  organizationConfig: OrganizationConfig;
}

export interface EncounterCreationResult {
  encounter?: Partial<Encounter>;
  practitionersToCreate?: Array<Partial<Practitioner>>;
}
