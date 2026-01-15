interface UsePaginationProps<T> {
  onOptionsChange: (options: T) => void;
}

export const usePagination = <T extends Record<string, unknown>>({
  onOptionsChange,
}: UsePaginationProps<T>) => {
  const handleNextPage = (
    options: T,
    hasNext: boolean,
    nextCursor?: string,
  ) => {
    if (hasNext && nextCursor) {
      onOptionsChange({
        ...options,
        afterRef: nextCursor,
        beforeRef: undefined,
      });
    }
  };

  const handlePrevPage = (
    options: T,
    hasPrev: boolean,
    prevCursor?: string,
  ) => {
    if (hasPrev && prevCursor) {
      onOptionsChange({
        ...options,
        beforeRef: prevCursor,
        afterRef: undefined,
      });
    }
  };

  return {
    handleNextPage,
    handlePrevPage,
  };
};
