import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "../atoms";

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
          <SelectValue />
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
