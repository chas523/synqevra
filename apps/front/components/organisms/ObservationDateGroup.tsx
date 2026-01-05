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
    <div className="max-w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-500">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-red-500 dark:text-white">
              {formatDate(date)}
            </h3>
            <Badge
              variant="secondary"
              className="bg-slate-700/50 text-slate-200 hover:bg-slate-700/70 border border-slate-600/50"
            >
              {observations.length}{" "}
              {observations.length === 1 ? "observation" : "observations"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-slate-400 transition-transform" />
          ) : (
            <ChevronRight className="h-5 w-5 text-slate-400 transition-transform" />
          )}
        </div>
      </button>

      <div
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 py-4 space-y-1 border-t border-white/10">
          <PatientObservationList observations={observations} />
        </div>
      </div>
    </div>
  );
};

export default ObservationDateGroup;
