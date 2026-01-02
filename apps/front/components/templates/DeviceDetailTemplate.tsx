import type { UseMedplumDeviceResult } from "@/hooks/medplum/useMedplumDevice";
import type { UseMedplumPatientDeviceResult } from "@/hooks/medplum/useMedplumPatientDevice";
import type {
  DeviceParameterConfig,
  DeviceParameterLimits,
  MedicalParameter,
  ThresholdOption,
} from "@/types/deviceParameterTypes";
import type { DeviceDetails } from "@/types/thingsboardDeviceTypes";
import { EmptyState, Label, LoadingButton } from "../atoms";
import { DeviceHeader } from "../molecules";
import ParameterSelector from "../molecules/ParameterSelector";
import { CurrentParameters } from "../organisms";
import AssignTbDeviceToMedplumPatient from "../organisms/AssignTbDeviceToMedplumPatient";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

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
    thresholdType: string
  ) => void;
  onAddParameter: (
    parameterKey: string,
    thresholdType: string,
    value: string
  ) => void;
  updating: boolean;
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
  updating,
  className = "",
}: DeviceDetailTemplateProps) => {
  if (isLoading || medplumDeviceHook.isLoadingDevice) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading device details...</p>
        </div>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">
            {error?.message || "Device not found"}
          </p>
          <button
            onClick={onBackToList}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
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

  const hasParameters = Object.keys(limits).length > 0;

  return (
    <div className={`container mx-auto p-6 ${className}`}>
      <div className="flex flex-col max-w-6xl mx-auto gap-4">
        <DeviceHeader
          deviceName={device.name}
          deviceActive={device.active}
          deviceLabel={device.label}
          onBackToList={onBackToList}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Assign device to patient
            </CardTitle>
            <p className="text-sm text-gray-600">
              Pick the patient from dropdown list and save.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row border-t"></div>
            {medplumDeviceHook.medplumDevice?.patient ? (
              <Label>
                Assigned patient:{" "}
                {medplumDeviceHook.medplumDevice?.patient.display}
              </Label>
            ) : (
              <AssignTbDeviceToMedplumPatient {...medplumPatientDeviceHook} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Medical Parameters Configuration
              <Button
                onClick={onRefresh}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                Refresh
              </Button>
            </CardTitle>
            <p className="text-sm text-gray-600">
              Configure threshold values for medical parameters. These values
              will be used for monitoring and alerts.
              <br />
              <strong>Note:</strong> Set appropriate threshold values based on
              medical standards and patient requirements.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <CurrentParameters
              limits={limits}
              medicalParameters={medicalParameters}
              onRemoveLimit={onRemoveLimit}
              onRemoveSpecificThreshold={onRemoveSpecificThreshold}
            />

            <ParameterSelector
              availableParameters={medicalParameters}
              thresholdOptions={thresholdOptions}
              onAddParameter={onAddParameter}
            />

            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              <LoadingButton
                onClick={onSaveChanges}
                isLoading={updating}
                textBeforeClick="Save Configuration"
                textAfterClick="Saving Changes..."
                disabled={updating || !hasParameters}
                className="flex-1 sm:flex-none"
                size="lg"
              />

              <div className="text-sm text-gray-600 flex items-center">
                <span>
                  Changes will update both threshold limits and telemetry keys
                  automatically
                </span>
              </div>
            </div>

            {!hasParameters && (
              <EmptyState
                title="No Medical Parameters Configured"
                description="Start by adding medical parameters with their threshold values for monitoring."
                hint="Available parameters: Temperature, Heart Rate, Oxygen Saturation, Respiratory Rate"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeviceDetailTemplate;
