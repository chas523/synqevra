"use client";

import { MedplumClient } from "@medplum/core";
import { MedplumProvider } from "@medplum/react";
import {useEffect, useState} from "react";

export default function MedplumProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [medplum, setMedplum] = useState<MedplumClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const baseUrl =
        typeof window !== 'undefined'
            ? `${window.location.origin}/fhir`
            : 'http://localhost:3003/fhir';
    const client = new MedplumClient({
      baseUrl,
    });
    setMedplum(client);
    setIsLoading(false);
  }, []);

  if (isLoading || !medplum) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return <MedplumProvider medplum={medplum}>{children}</MedplumProvider>;
}
