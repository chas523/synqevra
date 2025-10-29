"use client";

import { MedplumClient } from "@medplum/core";
import { MedplumProvider } from "@medplum/react";

const medplum = new MedplumClient({
  baseUrl: "http://localhost:3003/fhir",
});

export default function MedplumProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MedplumProvider medplum={medplum}>{children}</MedplumProvider>;
}
