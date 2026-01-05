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
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                : "bg-slate-700/50 text-slate-400 border border-slate-600/50"
            }`}
          >
            <Activity className="mr-1 h-3 w-3" />
            {patient.active ? "Active" : "Inactive"}
          </Badge>
        ) : (
          <Badge
            variant="destructive"
            className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs"
          >
            Deceased
          </Badge>
        )}
      </div>

      {lastUpdated && (
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <Clock className="h-3 w-3" />
          {lastUpdated}
        </div>
      )}
    </div>
  );
};

export default PatientHeader;
