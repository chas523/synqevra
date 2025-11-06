import type { Observation } from "@medplum/fhirtypes";
import { Calendar, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { cn, formatDate } from "@/lib/utils";
import PatientObservationList from "./PatientObservationList";

interface ObservationDateGroupProps {
  date: string;
  observations: Observation[];
}

const ObservationDateGroup = ({
  date,
  observations,
}: ObservationDateGroupProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="max-w-full rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-500">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-slate-900">
              {formatDate(date)}
            </h3>
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-700 hover:bg-slate-100"
            >
              {observations.length}{" "}
              {observations.length === 1 ? "observation" : "observations"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-slate-600 transition-transform" />
          ) : (
            <ChevronRight className="h-5 w-5 text-slate-600 transition-transform" />
          )}
        </div>
      </button>

      <div
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="px-4 pb-4 space-y-1 border-t border-slate-100">
          <PatientObservationList observations={observations} />
        </div>
      </div>
    </div>
  );
};

export default ObservationDateGroup;
