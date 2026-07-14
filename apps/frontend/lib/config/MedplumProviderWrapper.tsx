"use client";

import { MedplumClient } from "@medplum/core";
import { MedplumProvider } from "@medplum/react";

let medplumInstance: MedplumClient | null = null;

function getMedplumClient(): MedplumClient {
  if (!medplumInstance) {
    const baseUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/fhir`
        : "http://localhost:3003/fhir";
    medplumInstance = new MedplumClient({
      baseUrl,
    });
  }
  return medplumInstance;
}

export default function MedplumProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const medplum = getMedplumClient();

  return <MedplumProvider medplum={medplum}>{children}</MedplumProvider>;
}
