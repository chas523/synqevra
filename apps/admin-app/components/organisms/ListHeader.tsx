import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ListHeaderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  count: number;
  isLoading: boolean;
  onRefresh: () => void;
}

export const ListHeader = ({
  icon,
  title,
  description,
  count,
  isLoading,
  onRefresh,
}: ListHeaderProps) => {
  return (
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl">
            {icon}
            {title}
            <Badge variant="secondary" className="ml-2">
              {count}
            </Badge>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
    </CardHeader>
  );
};
