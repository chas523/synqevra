import { useConnectionStatus } from "@/hooks/connection/useConnectionStatus";
import { useMedplumPatients } from "@/hooks/medplum/useMedplumPatients";
import ErrorOverlayInformation from "../molecules/ErrorOverlayInformation";
import LoadingOverlayInformation from "../molecules/LoadingOverlayInformation";
import PatientsTemplate from "../templates/PatientsTemplate";

const PatientsPageContent = () => {
  const medplumPatients = useMedplumPatients();

  return <PatientsTemplate {...medplumPatients} />;
};

const PatientsPage = () => {
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

  return <PatientsPageContent />;
};

export default PatientsPage;
