import type { Patient } from "@medplum/fhirtypes";
import { Activity, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PatientHeaderProps {
  patient: Patient;
}

const PatientHeader = ({ patient }: PatientHeaderProps) => {
  const lastUpdated = patient.meta?.lastUpdated
    ? new Date(patient.meta.lastUpdated).toLocaleDateString("pl-PL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : null;

  return (
    <div className="mb-3 gap-2 flex items-center justify-between flex-shrink-0 overflow-x-auto">
      <div className="flex gap-2">
        {!patient.deceasedBoolean ? (
          <Badge
            variant={patient.active ? "default" : "secondary"}
            className={`text-xs transition-all ${
              patient.active
                ? "bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100"
                : "bg-slate-100 text-slate-600 border border-slate-300"
            }`}
          >
            <Activity className="mr-1 h-3 w-3" />
            {patient.active ? "Active" : "Inactive"}
          </Badge>
        ) : (
          <Badge
            variant="destructive"
            className="bg-red-50 text-red-700 border border-red-300 text-xs"
          >
            Deceased
          </Badge>
        )}
      </div>

      {lastUpdated && (
        <div className="flex items-center gap-1 text-[10px] text-slate-500">
          <Clock className="h-3 w-3" />
          {lastUpdated}
        </div>
      )}
    </div>
  );
};

export default PatientHeader;
