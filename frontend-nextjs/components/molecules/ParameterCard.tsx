import {
  formatParameterValue,
  getThresholdColor,
  getThresholdLabel,
} from "@/lib/utils";
import type { MedicalParameter } from "@/types/deviceParameterTypes";
import { Label, Text } from "../atoms";
import { Button } from "../ui/button";

export interface ParameterCardProps {
  parameterKey: string;
  parameterValue: Record<string, unknown>;
  paramInfo?: MedicalParameter;
  onRemoveAll: (key: string) => void;
  onRemoveThreshold: (parameterKey: string, thresholdType: string) => void;
  className?: string;
}

const ParameterCard = ({
  parameterKey,
  parameterValue,
  paramInfo,
  onRemoveAll,
  onRemoveThreshold,
  className = "",
}: ParameterCardProps) => {
  return (
    <div className={`p-4 border rounded-lg bg-gray-50 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <Label className="font-semibold text-gray-800 text-base">
            {paramInfo?.label || parameterKey}
          </Label>
          {paramInfo?.unit && (
            <Text size="sm" className="text-gray-500 ml-2">
              ({paramInfo.unit})
            </Text>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRemoveAll(parameterKey)}
          className="text-red-600 hover:text-red-700 h-7 px-2"
        >
          Remove All
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {Object.entries(parameterValue).map(
          ([thresholdType, thresholdValue]) => (
            <div
              key={thresholdType}
              className={`relative flex items-center justify-between p-3 rounded-md border ${getThresholdColor(
                thresholdType,
              )}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Text
                    size="xs"
                    className="font-medium uppercase tracking-wide"
                  >
                    {getThresholdLabel(thresholdType)}
                  </Text>
                </div>
                <div className="font-semibold truncate">
                  {formatParameterValue(thresholdValue)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onRemoveThreshold(parameterKey, thresholdType)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors shadow-sm"
                title="Remove this threshold"
              >
                ×
              </button>
            </div>
          ),
        )}
      </div>
    </div>
  );
};

export default ParameterCard;
