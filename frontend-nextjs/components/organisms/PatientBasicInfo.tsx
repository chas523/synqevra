import type { Patient } from "@medplum/fhirtypes";
import { FileText } from "lucide-react";

interface PatientBasicInfoProps {
  patient: Patient;
}

const PatientBasicInfo = ({ patient }: PatientBasicInfoProps) => {
  const name = patient.name?.[0];
  const fullName = name
    ? `${name.given?.join(" ") || ""} ${name.family || ""}`.trim()
    : "Unknown Patient";

  const primaryIdentifier =
    patient.identifier?.find((i) => i.use === "official") ||
    patient.identifier?.[0];

  return (
    <div className="h-12 text-center flex-shrink-0">
      <h3 className="text-lg font-bold text-slate-900 mb-0.5 leading-tight">
        {fullName}
      </h3>
      {primaryIdentifier?.value && (
        <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
          <FileText className="h-3 w-3" />
          <span className="font-mono">{primaryIdentifier.value}</span>
        </div>
      )}
    </div>
  );
};

export default PatientBasicInfo;
