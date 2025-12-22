"use client";

import type { Patient, Resource } from "@medplum/fhirtypes";
import { ResourceForm } from "@medplum/react";
import { useEffect, useState } from "react";
import ErrorOverlayInformation from "@/components/molecules/ErrorOverlayInformation";
import OverlayRelativeToParent from "@/components/molecules/OverlayRelativeToParent";
import {
  useMedplumPatientById,
  useUpdateMedplumPatient,
} from "@/hooks/medplum/useMedplumPatients";
import { extractErrorMessage } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function Page() {
  const { id } = useParams();
  const patientId = typeof id === "string" ? id : undefined;
  const {
    patient,
    isLoading,
    error: fetchError,
  } = useMedplumPatientById(patientId);

  const {
    updatePatient,
    loading,
    error: updateError,
  } = useUpdateMedplumPatient(patientId);
  const [errorVisible, setErrorVisible] = useState(false);

  const error = fetchError || updateError;

  useEffect(() => {
    if (error) {
      setErrorVisible(true);
    }
  }, [error]);

  const handleCloseError = () => {
    setErrorVisible(false);
  };

  const router = useRouter();

  const handleSubmit = async (resource: Resource) => {
    if (resource.resourceType === "Patient") {
      const result = await updatePatient(resource as Patient);
      if (result && !updateError) {
        router.push(`/patients/${patientId}`);
      }
    }
  };

  if (!patientId) {
    return <ErrorOverlayInformation text="Patient ID is required" />;
  }

  const patientNotFound = !isLoading && !fetchError && !patient;

  return (
    <OverlayRelativeToParent
      visible={isLoading || loading || errorVisible || patientNotFound}
      text={error ? extractErrorMessage(error) : "Updating patient..."}
      isError={errorVisible || patientNotFound}
      onClose={errorVisible ? handleCloseError : undefined}
    >
      <ResourceForm
        defaultValue={patient ?? {}}
        profileUrl="http://hl7.org/fhir/StructureDefinition/Patient"
        onSubmit={handleSubmit}
      />
    </OverlayRelativeToParent>
  );
}
