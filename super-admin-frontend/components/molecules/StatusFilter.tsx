import { Checkbox } from "@/components/ui/checkbox";
import { Text } from "../atoms";

interface StatusFilterOption {
  id: string;
  label: string;
  value: boolean | undefined;
  checked: boolean;
}

interface StatusFilterProps {
  currentValue: boolean | undefined;
  onValueChange: (value: boolean | "indeterminate") => void;
  label?: string;
}

export const StatusFilter = ({
  currentValue,
  onValueChange,
  label = "Form Status:",
}: StatusFilterProps) => {
  const options: StatusFilterOption[] = [
    {
      id: "show-all",
      label: "All",
      value: undefined,
      checked: currentValue === undefined,
    },
    {
      id: "form-completed",
      label: "Completed",
      value: true,
      checked: currentValue === true,
    },
    {
      id: "form-pending",
      label: "Pending",
      value: false,
      checked: currentValue === false,
    },
  ];

  const handleChange = (option: StatusFilterOption) => {
    if (option.value === undefined) {
      onValueChange("indeterminate");
    } else {
      onValueChange(option.value);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <Text variant="label">{label}</Text>
      <div className="flex items-center space-x-4">
        {options.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <Checkbox
              id={option.id}
              checked={option.checked}
              onCheckedChange={() => handleChange(option)}
            />
            <label htmlFor={option.id} className="text-sm">
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};
