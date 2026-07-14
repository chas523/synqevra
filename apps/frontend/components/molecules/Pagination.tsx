import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Text } from "../atoms";

interface PaginationProps {
  hasNext: boolean;
  hasPrev: boolean;
  currentCount: number;
  total: number;
  isLoading: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export const Pagination = ({
  hasNext,
  hasPrev,
  currentCount,
  total,
  isLoading,
  onNext,
  onPrev,
}: PaginationProps) => {
  if (currentCount === 0) return null;

  return (
    <div className="flex items-center justify-between pt-4 border-t">
      <Button
        variant="outline"
        onClick={onPrev}
        disabled={!hasPrev || isLoading}
        className="gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      <Text color="muted">
        Showing {currentCount} of {total}
      </Text>

      <Button
        variant="outline"
        onClick={onNext}
        disabled={!hasNext || isLoading}
        className="gap-2"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
