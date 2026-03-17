"use client";

import type { Patient, Resource } from "@medplum/fhirtypes";
import { ResourceForm } from "@medplum/react";
import { useEffect, useState } from "react";
import ErrorOverlayInformation from "@/components/molecules/ErrorOverlayInformation";
import LoadingOverlayInformation from "@/components/molecules/LoadingOverlayInformation";
import OverlayRelativeToParent from "@/components/molecules/OverlayRelativeToParent";
import { useConnectionStatus } from "@/hooks/connection/useConnectionStatus";
import { useCreateMedplumPatient } from "@/hooks/medplum/useMedplumPatients";
import { extractErrorMessage } from "@/lib/utils";
import { useRouter } from "next/navigation";

function AddPatientForm() {
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

export default function Page() {
  const { hasMedplum, isLoading } = useConnectionStatus();

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <LoadingOverlayInformation text="Checking Medplum connection..." />
      </div>
    );
  }

  if (!hasMedplum) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <ErrorOverlayInformation text="Medplum is not connected for this tenant." />
      </div>
    );
  }

  return <AddPatientForm />;
}
