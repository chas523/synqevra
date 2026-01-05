import type { Observation } from "@medplum/fhirtypes";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Activity, Calendar, Gauge, Cpu } from "lucide-react";
import { formatDate } from "@/lib/utils";

type PatientObservationListProps = {
  observations: Observation[];
  patientId?: string;
};

const PatientObservationList = ({
  observations,
}: PatientObservationListProps) => {
  const router = useRouter();

  const getObservationIcon = (code?: string) => {
    const lowerCode = code?.toLowerCase() || "";
    if (lowerCode.includes("temperature") || lowerCode.includes("temp")) {
      return <Gauge className="h-4 w-4 text-orange-400" />;
    }
    return <Activity className="h-4 w-4 text-blue-400" />;
  };

  return (
    <div className="space-y-2">
      {observations.map((obs) => (
        <div
          key={obs.id ?? `${obs.code?.text}-${obs.effectiveDateTime}`}
          className="bg-white/5 border border-white/10 hover:border-cyan-500/30 rounded-xl p-3 transition-colors"
        >
          <div className="flex items-center justify-between overflow-x-auto gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center gap-2">
                {getObservationIcon(obs.code?.text)}
                <Badge
                  variant="secondary"
                  className="bg-slate-700/50 text-slate-200 hover:bg-slate-700/70 border border-slate-600/50"
                >
                  {obs.code?.text || "Unknown"}
                </Badge>
              </div>

              <div className="w-px h-6 bg-white/10" />

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-400">
                  Value:
                </span>
                {obs.valueQuantity ? (
                  <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/30">
                    {obs.valueQuantity.value ?? "—"}{" "}
                    {obs.valueQuantity.unit || ""}
                  </Badge>
                ) : obs.valueString ? (
                  <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/30">
                    {obs.valueString}
                  </Badge>
                ) : (
                  <Badge className="bg-slate-700/50 text-slate-400 hover:bg-slate-700/70">
                    —
                  </Badge>
                )}
              </div>

              <div className="w-px h-6 bg-white/10" />

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-400 text-nowrap">
                  {formatDate(obs.effectiveDateTime)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {obs.device?.reference ? (
                <button
                  className="h-8 px-3 text-xs cursor-pointer flex items-center gap-1 bg-white/5 border border-white/10 hover:border-cyan-500/30 rounded-lg text-slate-300 hover:text-cyan-400 transition-colors"
                  onClick={() =>
                    router.push(`/devices/${obs.device?.identifier?.value}`)
                  }
                >
                  <Cpu className="h-3 w-3" />
                  View device
                </button>
              ) : (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Cpu className="h-3 w-3" />
                  No device
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PatientObservationList;
