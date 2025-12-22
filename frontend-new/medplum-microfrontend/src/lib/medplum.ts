import { MedplumClient } from "@medplum/core";

export const medplum = new MedplumClient({
  baseUrl: process.env.MODERN_MEDPLUM_BASE_URL || '',
  clientId: process.env.MODERN_MEDPLUM_CLIENT_ID || '',
});
// medplum.refreshIfExpired();
