import { Skeleton } from "@/components/ui/skeleton";

interface LoadingCardProps {
  count?: number;
  showActions?: boolean;
}

export const LoadingCard = ({
  count = 5,
  showActions = true,
}: LoadingCardProps) => {
  return (
    <div className="space-y-3">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div
            key={`loading-card-${Date.now()}-${i}`}
            className="p-4 border rounded-lg"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              {showActions && (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              )}
            </div>
          </div>
        ))}
    </div>
  );
};
