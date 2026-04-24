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
    <div className="flex flex-wrap gap-4 rounded-lg border border-border bg-muted/40 p-4">
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
