import { Text } from "../atoms";
import {
  SelectAdmin as Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/admin_select";

interface SortOption {
  value: string;
  label: string;
}

interface SortSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: readonly SortOption[];
  label?: string;
  className?: string;
}

export const SortSelect = ({
  value,
  onValueChange,
  options,
  label = "Sort:",
  className = "w-40",
}: SortSelectProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Text variant="label">{label}</Text>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={className}>
          <SelectValue placeholder="Select sort" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
