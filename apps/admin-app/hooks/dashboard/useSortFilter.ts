interface UseSortFilterProps<T> {
  onOptionsChange: (options: T) => void;
}

export const useSortFilter = <T extends Record<string, unknown>>({
  onOptionsChange,
}: UseSortFilterProps<T>) => {
  const handleSortChange = (options: T, value: string) => {
    const [sortBy, sortOrder] = value.split("-");
    onOptionsChange({
      ...options,
      sortBy,
      sortOrder: sortOrder as "asc" | "desc",
      afterRef: undefined,
      beforeRef: undefined,
    });
  };

  return {
    handleSortChange,
  };
};
