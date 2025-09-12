import { MedplumClient } from "@medplum/core";

export const medplum = new MedplumClient({
  baseUrl: process.env.MEDPLUM_BASE_URL || "http://localhost:8103",
  //clientId: "", // Optional: Add Medplum client ID here if needed
});

const authenticateMedplum = async () => {
  try {
    await medplum.signInWithRedirect({
      clientId: process.env.MEDPLUM_CLIENT_ID,
    });
  } catch (error) {
    console.error("Error:", error);
  }
};

export default authenticateMedplum;
