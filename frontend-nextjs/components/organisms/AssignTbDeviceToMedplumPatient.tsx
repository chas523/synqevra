import { useState } from "react";
import { extractErrorMessage } from "@/lib/utils";
import Label from "../atoms/Label";
import LoadingButton from "../atoms/LoadingButton";
import ErrorMessage from "../molecules/ErrorMessage";
import type { DeviceDetailMedplumProps } from "../templates/DeviceDetailTemplate";
import Select, { type SelectOption } from "../ui/select";

const AssignTbDeviceToMedplumPatient = (
  medplumPatientDeviceHook: DeviceDetailMedplumProps,
) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");

  const {
    patientList,
    isLoadingPatients,
    patientsError,
    onAssignPatient,
    isAssigning,
    assignError,
  } = medplumPatientDeviceHook;

  const patientOptions: SelectOption[] = patientList
    ? patientList.map((patient) => ({
        value: patient.id,
        label: `${(patient.given ?? []).join(" ")} ${patient.family}`,
        description: `ID: ${patient.id}`,
      }))
    : [];

  const handleAssignClick = async () => {
    if (selectedPatientId && onAssignPatient) {
      try {
        await onAssignPatient(selectedPatientId);
        setSelectedPatientId("");
      } catch (error) {
        console.error("Assignment failed:", error);
      }
    }
  };

  const isFormDisabled = isLoadingPatients || isAssigning;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 max-w-md">
        <Label htmlFor="patient-select" required className="whitespace-nowrap">
          Select Patient
        </Label>
        <Select
          options={patientOptions}
          value={selectedPatientId}
          placeholder={
            isLoadingPatients ? "Loading patients..." : "Choose a patient"
          }
          onValueChange={setSelectedPatientId}
          disabled={isFormDisabled}
          className="flex-1 min-w-0"
        />
      </div>

      {patientsError && (
        <ErrorMessage
          message={`Error loading patients: ${extractErrorMessage(patientsError)}`}
          align="left"
        />
      )}

      {assignError && (
        <ErrorMessage
          message={`Error assigning patient: ${extractErrorMessage(assignError)}`}
          align="left"
        />
      )}

      <LoadingButton
        onClick={handleAssignClick}
        isLoading={isAssigning}
        textBeforeClick="Assign Patient"
        textAfterClick="Assigning..."
        disabled={!selectedPatientId || isFormDisabled}
        className="w-40"
      />
    </div>
  );
};

export default AssignTbDeviceToMedplumPatient;
