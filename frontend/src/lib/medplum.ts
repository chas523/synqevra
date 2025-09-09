import { MedplumClient } from "@medplum/core";

export const medplum = new MedplumClient({
    baseUrl: process.env.MEDPLUM_BASE_URL,
});

 const authenticateMedplum = async () => {
    try {
        await medplum.signInWithRedirect({ clientId: process.env.MEDPLUM_CLIENT_ID });
    } catch (error) {
        console.error('Error:', error);
    }
};

 export default authenticateMedplum;
