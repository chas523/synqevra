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
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">
            Loading device details...
          </p>
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
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-lg transition-colors"
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
        <div className="text-center py-8 text-gray-500">Device not found</div>
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
              className="p-2 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-lg hover:border-cyan-500/50 text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition-all shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {device.name}
                </h1>
                <StatusBadge active={device.active}>
                  {device.active ? "Active" : "Inactive"}
                </StatusBadge>
              </div>
              {device.label && (
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  {device.label}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-lg hover:border-cyan-500/50 text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition-all disabled:opacity-50 shadow-sm"
            >
              <RefreshCw
                className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>

            <button
              onClick={onSaveChanges}
              disabled={updating}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-slate-700 disabled:to-slate-700 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed"
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

        <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-500/20 dark:to-blue-500/20 rounded-lg border border-cyan-200 dark:border-cyan-500/30">
              <Activity className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Medical Parameters
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Configure threshold values for monitoring and alerts
              </p>
            </div>
          </div>

          {configuredParameters.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700/50 rounded-xl">
              <Activity className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 mb-2">
                No telemetry configured yet
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-sm">
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
                  onAdd={(type, value) =>
                    onAddParameter(param.key, type, value)
                  }
                  onRemove={(type) =>
                    onRemoveSpecificThreshold(param.key, type)
                  }
                  onRemoveAll={() => onRemoveLimit(param.key)}
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
