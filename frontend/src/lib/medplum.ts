import { MedplumClient } from "@medplum/core";

export const medplum = new MedplumClient({
    clientId: process.env.NEXT_PUBLIC_MEDPLUM_CLIENT_ID,
    clientSecret: process.env.NEXT_PUBLIC_MEDPLUM_CLIENT_SECRET,
    baseUrl: process.env.NEXT_PUBLIC_MEDPLUM_BASE_URL,
});
