import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export interface EntityId {
  id?: string;
  entityType?: string;
}

export interface Device {
  id?: { id?: string; resourceType?: string };
  name?: string;
  type?: string;
  transportType?: string;
  profileData?: {
    alarms?: Array<{
      alarmType?: string;
      createRules?: {
        CRITICAL?: any;
        WARNING?: any;
      };
    }>;
  };
}

export interface Customer {
  id?: EntityId;
  name?: string;
  email?: string;
  country?: string;
  city?: string;
  address?: string;
}

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getPowerConsumptionInfo = (device: Device) => {
  if (!device.profileData?.alarms) return "N/A";

  const powerAlarm = device.profileData.alarms.find(
      alarm => alarm.alarmType?.toLowerCase().includes("power") ||
          alarm.alarmType?.toLowerCase().includes("consumption") ||
          alarm.alarmType?.toLowerCase().includes("energy")
  );

  if (!powerAlarm) return "N/A";

  const extractPowerThresholds = (rule) => {
    if (!rule?.condition?.condition) return null;

    const powerCondition = rule.condition.condition.find(
        cond => cond.key?.key === "powerConsumption" ||
            cond.key?.key === "energyConsumption" ||
            cond.key?.key === "power"
    );

    if (!powerCondition?.predicate) return null;

    if (powerCondition.predicate.type === "COMPLEX") {
      let minThreshold = null;
      let maxThreshold = null;

      const processPredicate = (predicate) => {
        if (predicate.type === "NUMERIC") {
          if (predicate.operation === "GREATER_OR_EQUAL" ||
              predicate.operation === "GREATER") {
            minThreshold = predicate.value?.defaultValue;
          } else if (predicate.operation === "LESS_OR_EQUAL" ||
              predicate.operation === "LESS") {
            maxThreshold = predicate.value?.defaultValue;
          }
        }
        else if (predicate.type === "COMPLEX" && predicate.predicates) {
          predicate.predicates.forEach(processPredicate);
        }
      };

      processPredicate(powerCondition.predicate);
      return { min: minThreshold, max: maxThreshold };
    }
    else if (powerCondition.predicate.type === "NUMERIC") {
      if (powerCondition.predicate.operation === "GREATER_OR_EQUAL" ||
          powerCondition.predicate.operation === "GREATER") {
        return { min: powerCondition.predicate.value?.defaultValue, max: null };
      } else if (powerCondition.predicate.operation === "LESS_OR_EQUAL" ||
          powerCondition.predicate.operation === "LESS") {
        return { min: null, max: powerCondition.predicate.value?.defaultValue };
      }
    }

    return null;
  };

  const criticalRule = powerAlarm.createRules?.CRITICAL;
  if (criticalRule) {
    const thresholds = extractPowerThresholds(criticalRule);
    if (thresholds) {
      if (thresholds.min !== null && thresholds.max !== null) {
        return `${thresholds.min}-${thresholds.max}W (Critical)`;
      } else if (thresholds.min !== null) {
        return `>${thresholds.min}W (Critical)`;
      } else if (thresholds.max !== null) {
        return `<${thresholds.max}W (Critical)`;
      }
    }
  }

  const warningRule = powerAlarm.createRules?.WARNING;
  if (warningRule) {
    const thresholds = extractPowerThresholds(warningRule);
    if (thresholds) {
      if (thresholds.min !== null && thresholds.max !== null) {
        return `${thresholds.min}-${thresholds.max}W (Warning)`;
      } else if (thresholds.min !== null) {
        return `>${thresholds.min}W (Warning)`;
      } else if (thresholds.max !== null) {
        return `<${thresholds.max}W (Warning)`;
      }
    }
  }

  return "N/A";
};

export const getTemperatureInfo = (device: Device) => {
  if (!device.profileData?.alarms) return "N/A";

  const temperatureAlarm = device.profileData.alarms.find(
      alarm => alarm.alarmType?.toLowerCase().includes("temperature")
  );

  if (!temperatureAlarm) return "N/A";

  const extractTemperatureThresholds = (rule) => {
    if (!rule?.condition?.condition) return null;

    const tempCondition = rule.condition.condition.find(
        cond => cond.key?.key === "temperature" ||
            cond.key?.key === "compressorTemperature" ||
            cond.key?.key === "temp"
    );

    if (!tempCondition?.predicate) return null;

    if (tempCondition.predicate.type === "COMPLEX") {
      let minThreshold = null;
      let maxThreshold = null;

      const processPredicate = (predicate) => {
        if (predicate.type === "NUMERIC") {
          if (predicate.operation === "GREATER_OR_EQUAL" ||
              predicate.operation === "GREATER") {
            minThreshold = predicate.value?.defaultValue;
          } else if (predicate.operation === "LESS_OR_EQUAL" ||
              predicate.operation === "LESS") {
            maxThreshold = predicate.value?.defaultValue;
          }
        }
        else if (predicate.type === "COMPLEX" && predicate.predicates) {
          predicate.predicates.forEach(processPredicate);
        }
      };

      processPredicate(tempCondition.predicate);
      return { min: minThreshold, max: maxThreshold };
    }
    else if (tempCondition.predicate.type === "NUMERIC") {
      if (tempCondition.predicate.operation === "GREATER_OR_EQUAL" ||
          tempCondition.predicate.operation === "GREATER") {
        return { min: tempCondition.predicate.value?.defaultValue, max: null };
      } else if (tempCondition.predicate.operation === "LESS_OR_EQUAL" ||
          tempCondition.predicate.operation === "LESS") {
        return { min: null, max: tempCondition.predicate.value?.defaultValue };
      }
    }

    return null;
  };

  const criticalRule = temperatureAlarm.createRules?.CRITICAL;
  if (criticalRule) {
    const thresholds = extractTemperatureThresholds(criticalRule);
    if (thresholds) {
      if (thresholds.min !== null && thresholds.max !== null) {
        return `${thresholds.min}-${thresholds.max}°C (Critical)`;
      } else if (thresholds.min !== null) {
        return `>${thresholds.min}°C (Critical)`;
      } else if (thresholds.max !== null) {
        return `<${thresholds.max}°C (Critical)`;
      }
    }
  }

  const warningRule = temperatureAlarm.createRules?.WARNING;
  if (warningRule) {
    const thresholds = extractTemperatureThresholds(warningRule);
    if (thresholds) {
      if (thresholds.min !== null && thresholds.max !== null) {
        return `${thresholds.min}-${thresholds.max}°C (Warning)`;
      } else if (thresholds.min !== null) {
        return `>${thresholds.min}°C (Warning)`;
      } else if (thresholds.max !== null) {
        return `<${thresholds.max}°C (Warning)`;
      }
    }
  }

  return "N/A";
};

export const getPressureInfo = (device: Device) => {
  if (!device.profileData?.alarms) return "N/A";

  const pressureAlarm = device.profileData.alarms.find(
      alarm => alarm.alarmType?.toLowerCase().includes("pressure")
  );

  if (!pressureAlarm) return "N/A";

  const extractPressureThresholds = (rule) => {
    if (!rule?.condition?.condition) return null;

    const pressureCondition = rule.condition.condition.find(
        cond => cond.key?.key === "pressure" || cond.key?.key === "refrigerantPressure"
    );

    if (!pressureCondition?.predicate) return null;

    if (pressureCondition.predicate.type === "COMPLEX" &&
        pressureCondition.predicate.operation === "OR") {

      const predicates = pressureCondition.predicate.predicates || [];
      let minThreshold = null;
      let maxThreshold = null;

      predicates.forEach(predicate => {
        if (predicate.type === "COMPLEX" && predicate.operation === "AND") {
          const andPredicates = predicate.predicates || [];
          andPredicates.forEach(andPred => {
            if (andPred.type === "NUMERIC") {
              if (andPred.operation === "GREATER_OR_EQUAL") {
                minThreshold = andPred.value?.defaultValue;
              } else if (andPred.operation === "LESS") {
                maxThreshold = andPred.value?.defaultValue;
              }
            }
          });
        }
        else if (predicate.type === "NUMERIC" &&
            predicate.operation === "GREATER_OR_EQUAL") {
          minThreshold = predicate.value?.defaultValue;
        }
      });

      return { min: minThreshold, max: maxThreshold };
    }

    return null;
  };

  const criticalRule = pressureAlarm.createRules?.CRITICAL;
  if (criticalRule) {
    const thresholds = extractPressureThresholds(criticalRule);
    if (thresholds) {
      if (thresholds.min !== null && thresholds.max !== null) {
        return `${thresholds.min}-${thresholds.max} bar (Critical)`;
      } else if (thresholds.min !== null) {
        return `>${thresholds.min} bar (Critical)`;
      }
    }
  }

  const warningRule = pressureAlarm.createRules?.WARNING;
  if (warningRule) {
    const thresholds = extractPressureThresholds(warningRule);
    if (thresholds) {
      if (thresholds.min !== null && thresholds.max !== null) {
        return `${thresholds.min}-${thresholds.max} bar (Warning)`;
      } else if (thresholds.min !== null) {
        return `>${thresholds.min} bar (Warning)`;
      }
    }
  }

  return "N/A";
};
