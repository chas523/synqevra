interface UseFormFilterProps<T> {
  onOptionsChange: (options: T) => void;
}

export const useFormFilter = <T extends Record<string, unknown>>({
  onOptionsChange,
}: UseFormFilterProps<T>) => {
  const handleFormStatusChange = (
    options: T,
    status: "new" | "pending" | undefined,
  ) => {
    onOptionsChange({
      ...options,
      status,
      afterRef: undefined,
      beforeRef: undefined,
    });
  };

  return {
    handleFormStatusChange,
  };
};
