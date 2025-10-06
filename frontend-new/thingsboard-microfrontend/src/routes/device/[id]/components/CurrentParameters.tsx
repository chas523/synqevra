import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { getThresholdColor, getThresholdLabel } from '../../lib';

interface CurrentParametersProps {
  limits: Record<string, any>;
  medicalParameters: Array<{ key: string; label: string; unit?: string }>;
  onRemoveLimit: (key: string) => void;
  onRemoveSpecificThreshold: (parameterKey: string, thresholdType: string) => void;
}

export const CurrentParameters = ({
  limits,
  medicalParameters,
  onRemoveLimit,
  onRemoveSpecificThreshold,
}: CurrentParametersProps) => {
  if (Object.keys(limits).length === 0) return null;

  const formatValue = (value: any) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return String(value);
  };


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-medium">
          Current Threshold Values
        </Label>
        <span className="text-sm text-gray-500">
          {Object.keys(limits).length} parameter
          {Object.keys(limits).length !== 1 ? 's' : ''} configured
        </span>
      </div>

      <div className="space-y-4">
        {Object.entries(limits).map(([parameterKey, parameterValue]) => {
          const paramInfo = medicalParameters.find(
            p => p.key === parameterKey,
          );
          
          return (
            <div
              key={parameterKey}
              className="p-4 border rounded-lg bg-gray-50"
            >
              {/* Parameter header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Label className="font-semibold text-gray-800 text-base">
                    {paramInfo?.label || parameterKey}
                  </Label>
                  {paramInfo?.unit && (
                    <span className="text-sm text-gray-500 ml-2">({paramInfo.unit})</span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRemoveLimit(parameterKey)}
                  className="text-red-600 hover:text-red-700 h-7 px-2"
                >
                  Remove All
                </Button>
              </div>

              {/* List of thresholds */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(parameterValue as Record<string, any>).map(([thresholdType, thresholdValue]) => (
                  <div
                    key={thresholdType}
                    className={`relative flex items-center justify-between p-3 rounded-md border ${
                      getThresholdColor(thresholdType)
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs uppercase tracking-wide">
                          {getThresholdLabel(thresholdType)}
                        </span>
                      </div>
                      <div className="font-semibold truncate">
                        {formatValue(thresholdValue)}
                      </div>
                    </div>
                    
                    {/* X button in the top right corner */}
                    <button
                      onClick={() => onRemoveSpecificThreshold(parameterKey, thresholdType)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors shadow-sm"
                      title="Remove this threshold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};