import { useMedplumPatients } from "@/hooks/medplum/useMedplumPatients";
import PatientsTemplate from "../templates/PatientsTemplate";

const PatientsPage = () => {
  const medplumPatients = useMedplumPatients();
  return <PatientsTemplate {...medplumPatients} />;
};

export default PatientsPage;
