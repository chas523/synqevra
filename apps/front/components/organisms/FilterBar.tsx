import { SortSelect, StatusFilter } from "../molecules";

interface FilterBarProps {
  sortValue: string;
  onSortChange: (value: string) => void;
  sortOptions: readonly { value: string; label: string }[];

  statusValue?: boolean | undefined;
  onStatusChange?: (value: boolean | "indeterminate") => void;
  showStatusFilter?: boolean;
}

export const FilterBar = ({
  sortValue,
  onSortChange,
  sortOptions,
  statusValue,
  onStatusChange,
  showStatusFilter = false,
}: FilterBarProps) => {
  return (
    <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <SortSelect
        value={sortValue}
        onValueChange={onSortChange}
        options={sortOptions}
      />

      {showStatusFilter && onStatusChange && (
        <StatusFilter
          currentValue={statusValue}
          onValueChange={onStatusChange}
        />
      )}
    </div>
  );
};
