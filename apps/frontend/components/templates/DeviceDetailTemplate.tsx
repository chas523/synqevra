import type { UseMedplumDeviceResult } from "@/hooks/medplum/useMedplumDevice";
import type { UseMedplumPatientDeviceResult } from "@/hooks/medplum/useMedplumPatientDevice";
import type {
  DeviceParameterConfig,
  DeviceParameterLimits,
  MedicalParameter,
  ThresholdOption,
} from "@/types/deviceParameterTypes";
import type { DeviceDetails } from "@/types/thingsboardDeviceTypes";
import { Button } from "../ui/button";
import { PatientAssignmentCompact } from "../organisms/PatientAssignmentCompact";
import { Activity, ArrowLeft, RefreshCw, Save } from "lucide-react";
import { ParameterThresholdCard } from "../organisms/ParameterThresholdCard";
import { TelemetrySidebar } from "../organisms/TelemetrySidebar";
import { StatusBadge } from "../atoms";

export interface DeviceDetailMedplumProps
  extends UseMedplumPatientDeviceResult {
  onAssignPatient: (selectedPatientId: string) => Promise<void>;
}

export interface DeviceDetailTemplateProps {
  medplumPatientDeviceHook: DeviceDetailMedplumProps;
  medplumDeviceHook: UseMedplumDeviceResult;

  device: DeviceDetails | null;
  isLoading: boolean;
  error: Error | null;
  limits: DeviceParameterConfig;
  medicalParameters: MedicalParameter[];
  thresholdOptions: ThresholdOption[];
  onBackToList: () => void;
  onRefresh: () => void;
  onSaveChanges: () => Promise<void>;
  onRemoveLimit: (key: string) => void;
  onRemoveSpecificThreshold: (
    parameterKey: string,
    thresholdType: string,
  ) => void;
  onAddParameter: (
    parameterKey: string,
    thresholdType: string,
    value: string,
  ) => void;
  onAddTelemetry: (key: string) => void;
  updating: boolean;
  hasMedplum: boolean;
  className?: string;
}

const DeviceDetailTemplate = ({
  medplumPatientDeviceHook,
  medplumDeviceHook,
  device,
  isLoading,
  error,
  limits,
  medicalParameters,
  thresholdOptions,
  onBackToList,
  onRefresh,
  onSaveChanges,
  onRemoveLimit,
  onRemoveSpecificThreshold,
  onAddParameter,
  onAddTelemetry,
  updating,
  hasMedplum,
  className = "",
}: DeviceDetailTemplateProps) => {
  if (isLoading || (hasMedplum && medplumDeviceHook.isLoadingDevice)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="text-muted-foreground">Loading device details...</p>
        </div>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 mb-4">
            {error?.message || "Device not found"}
          </p>
          <button
            onClick={onBackToList}
            className="rounded-lg border border-border bg-muted/40 px-4 py-2 text-foreground transition-colors hover:bg-muted"
          >
            Back to Device List
          </button>
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className={`container mx-auto p-6 ${className}`}>
        <div className="py-8 text-center text-muted-foreground">
          Device not found
        </div>
        <div className="text-center">
          <Button onClick={onBackToList} variant="outline">
            Back to Device List
          </Button>
        </div>
      </div>
    );
  }

  const configuredParameters = medicalParameters.filter((param) =>
    limits.telemetry_keys.includes(param.key),
  );

  return (
    <div className="h-full mr-[5%] relative overflow-hidden">
      <TelemetrySidebar
        availableTelemetry={medicalParameters}
        configuredKeys={limits.telemetry_keys}
        onAddTelemetry={onAddTelemetry}
      />

      <div className="relative w-full  px-6 py-8 space-y-6">
        <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToList}
              className="rounded-lg border border-border bg-background p-2 text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">
                  {device.name}
                </h1>
                <StatusBadge active={device.active}>
                  {device.active ? "Active" : "Inactive"}
                </StatusBadge>
              </div>
              {device.label && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {device.label}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="rounded-lg border border-border bg-background p-2 text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <RefreshCw
                className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>

            <button
              onClick={onSaveChanges}
              disabled={updating}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Configuration
                </>
              )}
            </button>
          </div>
        </div>

        {hasMedplum && (
          <PatientAssignmentCompact
            patientList={medplumPatientDeviceHook.patientList}
            currentPatient={
              medplumDeviceHook.medplumDevice?.patient || undefined
            }
            isLoadingPatients={medplumPatientDeviceHook.isLoadingPatients}
            isAssigning={medplumPatientDeviceHook.isAssigning}
            onAssign={medplumPatientDeviceHook.onAssignPatient}
          />
        )}

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-lg border border-border bg-accent/60 p-2">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Medical Parameters
              </h2>
              <p className="text-sm text-muted-foreground">
                Configure threshold values for monitoring and alerts
              </p>
            </div>
          </div>

          {configuredParameters.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-border py-12 text-center">
              <Activity className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-muted-foreground">
                No telemetry configured yet
              </p>
              <p className="text-sm text-muted-foreground">
                Hover over the left edge to add telemetry parameters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {configuredParameters.map((param) => (
                <ParameterThresholdCard
                  key={param.key}
                  parameter={param}
                  currentValues={limits.limits[param.key]}
                  thresholdOptions={thresholdOptions}
                  onAddAction={(type, value) =>
                    onAddParameter(param.key, type, value)
                  }
                  onRemoveAction={(type) =>
                    onRemoveSpecificThreshold(param.key, type)
                  }
                  onRemoveAllAction={() => onRemoveLimit(param.key)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceDetailTemplate;
