import { Users } from "lucide-react";
import React from "react";
import { UseMedplumPatientResult } from "@/hooks/medplum/useMedplumPatients";
import { extractErrorMessage } from "@/lib/utils";
import { EmptyState } from "../atoms";
import { ErrorMessage } from "../molecules";
import LoadingOverlayInformation from "../molecules/LoadingOverlayInformation";
import PatientsGrid from "../organisms/PatientsGrid";
import HeaderWithTextAndButton from "../molecules/HeaderWithTextAndButton";
import { useRouter } from "next/navigation";

const PatientsTemplate = (medplumPatients: UseMedplumPatientResult) => {
  const router = useRouter();

  const { patientList, isLoadingPatients, patientsError } = medplumPatients;

  if (patientsError) {
    <ErrorMessage message={extractErrorMessage(patientsError)} />;
  }
  if (isLoadingPatients) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <LoadingOverlayInformation text="Loading patients..." />
      </div>
    );
  }

  if (!patientList || patientList.length === 0) {
    return (
      <>
        <HeaderWithTextAndButton
          mainText="Patient List"
          miniText="Manage and view all patient records"
          buttonText="Add new patient"
          onButtonClick={() => router.push("patients/add")}
        />
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="No patients found"
          description="Start by adding some patients using the form above."
          hint="Add new patient using form"
        />
      </>
    );
  }
  return <PatientsGrid patients={patientList} />;
};
export default PatientsTemplate;
