import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { medplum } from "@/lib/medplum";
import type { Device } from "@/lib/utils";

export const sendDeviceTemperatureData = async (device: Device) => {
  try {
    const tempAlarm = device.profileData?.alarms?.find(
      (alarm) =>
        alarm.alarmType?.toLowerCase().includes("temperature") ||
        alarm.alarmType?.toLowerCase().includes("compressor"),
    );

    if (!tempAlarm) {
      return { success: false, message: "No temperature alarm found" };
    }

    let calculatedTemperature: number;

    const criticalRule = tempAlarm.createRules?.CRITICAL;
    if (criticalRule?.condition?.condition) {
      const tempCondition = criticalRule.condition.condition.find(
        (cond) =>
          cond.key?.key === "temperature" ||
          cond.key?.key === "compressorTemperature" ||
          cond.key?.key === "temp",
      );

      if (tempCondition?.predicate) {
        const findTemperatureValue = (predicate: any): number | undefined => {
          if (
            predicate.type === "NUMERIC" &&
            predicate.value?.defaultValue !== undefined
          ) {
            return predicate.value.defaultValue;
          }

          if (predicate.type === "COMPLEX" && predicate.predicates) {
            for (const subPredicate of predicate.predicates) {
              const value = findTemperatureValue(subPredicate);
              if (value !== undefined) return value;
            }
          }

          return undefined;
        };

        calculatedTemperature = findTemperatureValue(tempCondition.predicate);
      }
    }

    if (calculatedTemperature === undefined) {
      const warningRule = tempAlarm.createRules?.WARNING;
      if (warningRule?.condition?.condition) {
        const tempCondition = warningRule.condition.condition.find(
          (cond) =>
            cond.key?.key === "temperature" ||
            cond.key?.key === "compressorTemperature" ||
            cond.key?.key === "temp",
        );

        if (tempCondition?.predicate) {
          const findTemperatureValue = (predicate: any): number | undefined => {
            if (
              predicate.type === "NUMERIC" &&
              predicate.value?.defaultValue !== undefined
            ) {
              return predicate.value.defaultValue;
            }

            if (predicate.type === "COMPLEX" && predicate.predicates) {
              for (const subPredicate of predicate.predicates) {
                const value = findTemperatureValue(subPredicate);
                if (value !== undefined) return value;
              }
            }

            return undefined;
          };

          calculatedTemperature = findTemperatureValue(tempCondition.predicate);
        }
      }
    }

    const observationData = {
      resourceType: "Observation",
      status: "final",
      category: [
        {
          coding: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "vital-signs",
              display: "Vital Signs",
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: "http://loinc.org",
            code: "8310-5",
            display: "Body temperature",
          },
        ],
        text: "Body Temperature",
      },
      subject: {
        reference: `Device/${device.id?.id}`,
        display: device.name,
      },
      effectiveDateTime: new Date().toISOString(),
      valueQuantity: {
        value: calculatedTemperature,
        unit: "°C",
        system: "http://unitsofmeasure.org",
        code: "Cel",
      },
      note: [
        {
          text: `Device: ${device.name}, Alarm Type: ${tempAlarm.alarmType}`,
        },
      ],
    };

    const result = await medplum.createResource(observationData);
    return {
      success: true,
      message: `Temperature data (${calculatedTemperature}°C) sent to Medplum for ${device.name}`,
    };
  } catch (error) {
    console.error("error:", error);
    return {
      success: false,
      message: `Sending error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
};

export const DeviceTemperatureSendButton = ({ device }: { device: Device }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    setIsLoading(true);
    const response = await sendDeviceTemperatureData(device);

    if (response.success) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
    setIsLoading(false);
  };

  const hasTempAlarm = device.profileData?.alarms?.some(
    (alarm) =>
      alarm.alarmType?.toLowerCase().includes("temperature") ||
      alarm.alarmType?.toLowerCase().includes("compressor"),
  );

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSend}
      disabled={isLoading || !hasTempAlarm}
      className="text-xs"
    >
      {isLoading ? "Sending..." : "Send to Medplum"}
    </Button>
  );
};
