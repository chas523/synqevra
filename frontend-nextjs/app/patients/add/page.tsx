"use client";

import { LoadingOverlay } from "@mantine/core";
import { MedplumClient } from "@medplum/core";
import type { Patient, Resource } from "@medplum/fhirtypes";
import { MedplumProvider, ResourceForm } from "@medplum/react";
import { useEffect, useState } from "react";
import { ErrorMessage } from "@/components/molecules";
import LoadingOverlayInformation from "@/components/molecules/LoadingOverlayInformation";
import LoadingOverlayRelativeToParent from "@/components/molecules/OverlayRelativeToParent";
import OverlayRelativeToParent from "@/components/molecules/OverlayRelativeToParent";
import { useCreateMedplumPatient } from "@/hooks/medplum/useMedplumPatients";
import { extractErrorMessage } from "@/lib/utils";

export const HomerSimpson = {
  resourceType: "Patient",
  id: "123",
  gender: "male",
  meta: {
    versionId: "2",
    lastUpdated: "2020-01-02T00:00:00.000Z",
    author: {
      reference: "Practitioner/123",
    },
  },
  identifier: [
    { system: "abc", value: "123" },
    { system: "def", value: "456" },
  ],
  active: true,
  birthDate: "1956-05-12",
  name: [
    {
      given: ["Homer"],
      family: "Simpson",
    },
  ],
  photo: [
    {
      contentType: "image/png",
      url: "https://www.medplum.com/img/homer-simpson.png",
    },
  ],
  telecom: [
    {
      system: "phone",
      use: "home",
      value: "555-7334",
    },
    {
      system: "email",
      use: "home",
      value: "chunkylover53@aol.com",
    },
  ],
  address: [
    {
      use: "home",
      line: ["742 Evergreen Terrace"],
      city: "Springfield",
      state: "IL",
      postalCode: "12345",
    },
  ],
};

export default function Page() {
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

  const handleSubmit = (resource: Resource) => {
    if (resource.resourceType === "Patient") {
      createPatient(resource as Patient);
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
