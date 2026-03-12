import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorMessageAtom as ErrorMessage } from "@/components/atoms/ErrorMessage";

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry: () => void;
  icon?: React.ReactNode;
}

export const ErrorState = ({
  title,
  message,
  onRetry,
  icon,
}: ErrorStateProps) => {
  return (
    <Card className="w-full border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-600 flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>
          <ErrorMessage message={message} variant="inline" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
};
