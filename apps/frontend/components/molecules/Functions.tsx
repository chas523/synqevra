import React from "react";
import { Check, X } from "lucide-react";

interface FunctionItem {
  name: string;
  enabled: boolean;
}

const FUNCTIONS: FunctionItem[] = [
  { name: "Resource Usage", enabled: true },
  { name: "API Usage", enabled: true },
  { name: "Device Communication", enabled: true },
  { name: "Practitioner Invitation", enabled: true },
  { name: "Observations", enabled: true },
  { name: "Rule Engine", enabled: true },
  { name: "Patient Preview", enabled: true },
  { name: "Patient Informations", enabled: true },
  { name: "Roles and Permissions", enabled: true },
  { name: "HL7 Integration", enabled: false },
  { name: "Hospital Integration", enabled: false },
  { name: "White-labeling", enabled: false },
];

export function Functions() {
  return (
    <>
      <h4 className="text-xs font-medium mb-1 shrink-0">Functions</h4>
      <div className="flex-1 min-h-0 flex flex-col flex-wrap gap-x-2 text-[10px] overflow-auto content-start">
        {FUNCTIONS.map((func) => (
          <div
            key={func.name}
            className={`flex items-center gap-1 mb-0.5 ${
              func.enabled ? "text-green-600" : "text-red-500"
            }`}
          >
            <div className={`border ${func.enabled ? "" : "bg-muted"}`}>
              {func.enabled ? (
                <Check className="h-3 w-3 shrink-0" />
              ) : (
                <X className="h-3 w-3 shrink-0" />
              )}{" "}
            </div>
            {func.name}
          </div>
        ))}
      </div>
    </>
  );
}
