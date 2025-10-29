import type { Patient } from "@medplum/fhirtypes";
import { Calendar, Heart } from "lucide-react";
import { PatientInfoItem } from "../molecules/PatientInfoItem";

interface PatientPersonalInfoProps {
  patient: Patient;
}

const PatientPersonalInfo = ({ patient }: PatientPersonalInfoProps) => {
  const age = patient.birthDate
    ? new Date().getFullYear() - new Date(patient.birthDate).getFullYear()
    : null;

  const genderDisplay = patient.gender
    ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)
    : null;

  const maritalStatus =
    patient.maritalStatus?.text || patient.maritalStatus?.coding?.[0]?.display;

  const hasPersonalInfo =
    age !== null || genderDisplay || patient.birthDate || maritalStatus;

  return hasPersonalInfo ? (
    <div className="space-y-0.1">
      {age !== null && (
        <PatientInfoItem label="Age" value={`${age} years old`} />
      )}
      {genderDisplay && (
        <PatientInfoItem label="Gender" value={genderDisplay} />
      )}
      {patient.birthDate && (
        <PatientInfoItem
          label="Birth Date"
          value={new Date(patient.birthDate).toLocaleDateString("pl-PL", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          icon={Calendar}
        />
      )}
      {maritalStatus && (
        <PatientInfoItem
          label="Marital Status"
          value={maritalStatus}
          icon={Heart}
        />
      )}
    </div>
  ) : (
    <p className="text-center text-xs text-slate-500 py-2">
      No personal information available
    </p>
  );
};

export default PatientPersonalInfo;
