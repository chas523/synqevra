import type { Patient } from "@medplum/fhirtypes";
import { Users, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

type PatientHealthcareProvidersVariant = "compact" | "default" | "detailed";

interface PatientHealthcareProvidersProps {
  patient: Patient;
  variant?: PatientHealthcareProvidersVariant;
}

const variantStyles = {
  compact: {
    container: "space-y-1",
    item: "flex items-center gap-2 rounded-md bg-slate-50 p-2 border border-slate-200",
    icon: "h-6 w-6 flex-shrink-0 items-center justify-center rounded-full",
    iconSize: "h-3 w-3",
    labelText: "text-[10px] text-slate-600 font-medium",
    valueText: "text-[10px] font-semibold text-slate-900",
  },
  default: {
    container: "space-y-1.5",
    item: "flex items-center gap-2 rounded-lg bg-slate-50 p-2.5 border border-slate-200",
    icon: "h-7 w-7 flex-shrink-0 items-center justify-center rounded-full",
    iconSize: "h-3.5 w-3.5",
    labelText: "text-xs text-slate-600 font-medium",
    valueText: "text-xs font-semibold text-slate-900",
  },
  detailed: {
    container: "space-y-2",
    item: "flex items-center gap-3 rounded-lg bg-slate-50 p-3 border border-slate-200",
    icon: "h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
    iconSize: "h-4 w-4",
    labelText: "text-sm text-slate-600 font-medium",
    valueText: "text-sm font-semibold text-slate-900",
  },
} as const;

const PatientHealthcareProviders = ({
  patient,
  variant = "compact",
}: PatientHealthcareProvidersProps) => {
  const styles = variantStyles[variant];

  const hasHealthcareProviders =
    (patient.generalPractitioner && patient.generalPractitioner.length > 0) ||
    patient.managingOrganization;

  if (!hasHealthcareProviders) {
    return (
      <p className="text-center text-xs text-slate-500 py-2">
        No healthcare provider information available
      </p>
    );
  }

  return (
    <div className={styles.container}>
      {patient.generalPractitioner?.map((gp) => (
        <div
          key={gp.reference || gp.display || Math.random()}
          className={styles.item}
        >
          <div className={cn("flex", styles.icon, "bg-cyan-100")}>
            <Users className={cn(styles.iconSize, "text-cyan-600")} />
          </div>
          <div className="flex-1 min-w-0">
            <div className={styles.labelText}>General Practitioner</div>
            <div className={styles.valueText}>
              {gp.display || gp.reference || "Unknown"}
            </div>
          </div>
        </div>
      ))}

      {patient.managingOrganization && (
        <div className={styles.item}>
          <div className={cn("flex", styles.icon, "bg-indigo-100")}>
            <Building2 className={cn(styles.iconSize, "text-indigo-600")} />
          </div>
          <div className="flex-1 min-w-0">
            <div className={styles.labelText}>Managing Organization</div>
            <div className={styles.valueText}>
              {patient.managingOrganization.display ||
                patient.managingOrganization.reference ||
                "Unknown"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientHealthcareProviders;
