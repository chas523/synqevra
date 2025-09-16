import { MedplumClient } from "@medplum/core";

export const medplum = new MedplumClient({
  baseUrl: process.env.NEXT_PUBLIC_MEDPLUM_BASE_URL,
});
