import type { Observation } from "@medplum/fhirtypes";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
      return <Gauge className="h-4 w-4 text-orange-500" />;
    }
    return <Activity className="h-4 w-4 text-blue-500" />;
  };

  return (
    <div className="space-y-3">
      {observations.map((obs) => (
        <Card
          key={obs.id ?? `${obs.code?.text}-${obs.effectiveDateTime}`}
          className="py-0 mb-1 border border-slate-200 hover:border-slate-300 transition-colors"
        >
          <CardContent className="p-2 overflow-hidden">
            <div className="flex items-center justify-between overflow-x-auto">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2">
                  {getObservationIcon(obs.code?.text)}
                  <Badge
                    variant="secondary"
                    className="bg-slate-100 text-slate-700 hover:bg-slate-100"
                  >
                    {obs.code?.text || "Unknown"}
                  </Badge>
                </div>

                <Separator orientation="vertical" className="h-6" />

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600">
                    Value:
                  </span>
                  {obs.valueQuantity ? (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                      {obs.valueQuantity.value ?? "—"}{" "}
                      {obs.valueQuantity.unit || ""}
                    </Badge>
                  ) : obs.valueString ? (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                      {obs.valueString}
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                      —
                    </Badge>
                  )}
                </div>

                <Separator orientation="vertical" className="h-6" />

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600 text-nowrap">
                    {formatDate(obs.effectiveDateTime)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {obs.device?.reference ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs cursor-pointer"
                    onClick={() =>
                      router.push(`/devices/${obs.device?.identifier?.value}`)
                    }
                  >
                    <Cpu className="h-3 w-3 mr-1" />
                    View device
                  </Button>
                ) : (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Cpu className="h-3 w-3" />
                    No device
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PatientObservationList;
