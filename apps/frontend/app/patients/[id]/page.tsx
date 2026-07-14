"use client";

import PatientDetailsPage from "@/components/pages/PatientDetailsPage";
import { useMedplumPatientById } from "@/hooks/medplum/useMedplumPatients";
import { useParams } from "next/navigation";
import ErrorOverlayInformation from "@/components/molecules/ErrorOverlayInformation";
import LoadingOverlayInformation from "@/components/molecules/LoadingOverlayInformation";
import { extractErrorMessage } from "@/lib/utils";

const Page = () => {
  const { id } = useParams();
  const patientId = typeof id === "string" ? id : undefined;
  const { patient, isLoading, error } = useMedplumPatientById(patientId);

  if (!patientId) {
    return <ErrorOverlayInformation text="Patient ID is required" />;
  }

  if (isLoading) {
    return <LoadingOverlayInformation text="Loading patient..." />;
  }

  if (error) {
    return <ErrorOverlayInformation text={extractErrorMessage(error)} />;
  }

  if (patient) {
    return <PatientDetailsPage patient={patient} />;
  }
};

export default Page;
