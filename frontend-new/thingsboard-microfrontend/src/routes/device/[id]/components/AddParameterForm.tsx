import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface THRESHOLD_OPTIONS_Interface {
  value: 'minimum' | 'maximum' | 'equal' | 'not_equal';
  label: string;
}

interface AddParameterFormProps {
  availableParameters: Array<{ key: string; label: string; unit?: string }>;
  newParameterKey: string;
  newParameterValue: string;
  selectedThreshold: THRESHOLD_OPTIONS_Interface | undefined;
  thresholdOptions: THRESHOLD_OPTIONS_Interface[];
  onParameterKeyChange: (key: string) => void;
  onParameterValueChange: (value: string) => void;
  onThresholdSelect: (threshold: THRESHOLD_OPTIONS_Interface) => void;
  onAddParameter: () => void;
}

export const AddParameterForm = ({
  availableParameters,
  newParameterKey,
  newParameterValue,
  selectedThreshold,
  thresholdOptions,
  onParameterKeyChange,
  onParameterValueChange,
  onThresholdSelect,
  onAddParameter,
}: AddParameterFormProps) => {
  const renderThresholdInput = (thresholdType: string) => {
    const baseProps = {
      value: newParameterValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => onParameterValueChange(e.target.value),
      className: "w-32",
    };

    switch (thresholdType) {
      case 'minimum':
      case 'maximum':
        return (
          <Input
            type="number"
            step="0.1"
            placeholder="Enter numeric value..."
            {...baseProps}
          />
        );
      case 'equal':
      case 'not_equal':
        return (
          <Input
            type="text"
            placeholder="Enter text value..."
            {...baseProps}
          />
        );
      default:
        return null;
    }
  };

  if (availableParameters.length === 0) return null;

  return (
    <div className="space-y-4 pt-4 border-t">
      <Label className="text-lg font-medium">Add New Parameter</Label>
      <p className="text-sm text-gray-600">
        Select a medical parameter and set its threshold value for monitoring.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-1 gap-2">
          <Select value={newParameterKey} onValueChange={onParameterKeyChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select medical parameter" />
            </SelectTrigger>
            <SelectContent>
              {availableParameters.map(param => (
                <SelectItem key={param.key} value={param.key}>
                  <div className="flex flex-col">
                    <span>{param.label}</span>
                    {param.unit ? (
                      <span className="text-xs text-gray-500">
                        Unit: {param.unit}
                      </span>
                    ) : null}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {newParameterKey && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={buttonVariants({ variant: 'default' })}>
                    Select thresholds
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {thresholdOptions.map(opt => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => onThresholdSelect(opt)}
                    >
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {selectedThreshold && (
                <>
                  {renderThresholdInput(selectedThreshold.value)}
                  <Button onClick={onAddParameter}>+</Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};