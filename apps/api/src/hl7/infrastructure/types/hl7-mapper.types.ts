import { FhirMappedResourcesDto } from '../../application/dto/fhir-mapped-resources.dto';

export interface Hl7JobData {
  rawMessage: string;
  tenantId: string;
}

export interface FhirResourcesJobData {
  mappedResources: FhirMappedResourcesDto;
}

export interface AttendingDoctorField {
  getComponent: (index: number) => string | undefined;
}
