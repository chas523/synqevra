import type { Patient } from '@medplum/fhirtypes';
import { Hl7Message } from '@medplum/core';
import { OrganizationConfig } from './organization-config.command';

export interface CreatePatientFromPidCommand {
  message: Hl7Message;
  tenantId: string;
  organizationConfig: OrganizationConfig;
}

export interface CreateOrMergePatientResult {
  patient: Partial<Patient>;
  mergeFromIdentifier?: string;
}
