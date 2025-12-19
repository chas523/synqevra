"use client";
import { useMedplumObservationsByPatientId } from "@/hooks/medplum/useMedplumObservations";
import { useParams } from "next/navigation";
import ErrorOverlayInformation from "@/components/molecules/ErrorOverlayInformation";
import LoadingOverlayInformation from "@/components/molecules/LoadingOverlayInformation";
import { extractErrorMessage } from "@/lib/utils";
import ObservationPage from "@/components/pages/ObservationPage";
import { EmptyState } from "@/components/atoms";
import { EqualApproximately } from "lucide-react";

const OBSERVATIONS_COUNT_ON_OBSERVATION_PAGE = 20;
const Page = () => {
  const { id } = useParams();
  const patientId = typeof id === "string" ? id : undefined;

  const { observations, isLoadingObservations, observationsError } =
    useMedplumObservationsByPatientId(
      patientId,
      OBSERVATIONS_COUNT_ON_OBSERVATION_PAGE,
    );

  if (!patientId) {
    return <ErrorOverlayInformation text="Patient ID is required" />;
  }

  if (isLoadingObservations) {
    return <LoadingOverlayInformation text="Loading observations..." />;
  }

  if (observationsError) {
    return (
      <ErrorOverlayInformation text={extractErrorMessage(observationsError)} />
    );
  }
  if (!observations) {
    return (
      <EmptyState
        title="No observations found."
        description="Observations will appear after you connect to a device."
        icon={<EqualApproximately />}
      />
    );
  }

  return <ObservationPage observations={observations} patientId={patientId} />;
};

export default Page;
