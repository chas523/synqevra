import type { Patient } from "@medplum/fhirtypes";
import { MessageSquare } from "lucide-react";
import { PatientInfoItem } from "./PatientInfoItem";

type PatientCommunicationPreferencesVariant =
  | "compact"
  | "default"
  | "detailed";

interface PatientCommunicationPreferencesProps {
  patient: Patient;
  variant?: PatientCommunicationPreferencesVariant;
}

const PatientCommunicationPreferences = ({
  patient,
  variant = "compact",
}: PatientCommunicationPreferencesProps) => {
  const hasCommunicationPreferences =
    patient.communication && patient.communication.length > 0;

  if (!hasCommunicationPreferences) {
    return (
      <p className="text-center text-xs text-slate-500 dark:text-slate-400 py-2">
        No communication preferences available
      </p>
    );
  }

  return (
    <div className="space-y-0.5">
      {patient.communication?.map((comm) => (
        <PatientInfoItem
          key={
            comm.language.text ||
            comm.language.coding?.[0]?.code ||
            Math.random()
          }
          label={comm.preferred ? "Preferred Language" : "Language"}
          value={
            comm.language.text ||
            comm.language.coding?.[0]?.display ||
            "Unknown"
          }
          icon={MessageSquare}
          variant={variant}
        />
      ))}
    </div>
  );
};

export default PatientCommunicationPreferences;
