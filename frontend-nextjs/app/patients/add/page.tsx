"use client";

import type { Patient, Resource } from "@medplum/fhirtypes";
import { ResourceForm } from "@medplum/react";
import { useEffect, useState } from "react";
import OverlayRelativeToParent from "@/components/molecules/OverlayRelativeToParent";
import { useCreateMedplumPatient } from "@/hooks/medplum/useMedplumPatients";
import { extractErrorMessage } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const { createPatient, loading, error } = useCreateMedplumPatient();
  const [errorVisible, setErrorVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setErrorVisible(true);
    }
  }, [error]);

  const handleCloseError = () => {
    setErrorVisible(false);
  };

  const handleSubmit = async (resource: Resource) => {
    if (resource.resourceType === "Patient") {
      const result = await createPatient(resource as Patient);
      if (result && !error) {
        router.push(`/patients/${result.id}`);
      }
    }
  };

  return (
    <OverlayRelativeToParent
      visible={loading || errorVisible}
      text={error ? extractErrorMessage(error) : "Creating patient..."}
      isError={errorVisible}
      onClose={handleCloseError}
    >
      <ResourceForm
        defaultValue={{ resourceType: "Patient", active: true }}
        profileUrl="http://hl7.org/fhir/StructureDefinition/Patient"
        onSubmit={handleSubmit}
      />
    </OverlayRelativeToParent>
  );
}
