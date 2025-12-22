import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LoadingButton } from "./LoadingButton";

interface ActionButtonsProps {
  variant?: "requested" | "active";
  isLoading?: boolean;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  primaryLabel?: string;
  secondaryLabel?: string;
  className?: string;
}

export const ActionButtons = ({
  variant = "requested",
  isLoading = false,
  onPrimaryAction,
  onSecondaryAction,
  primaryLabel,
  secondaryLabel,
  className,
}: ActionButtonsProps) => {
  if (variant === "active") {
    return (
      <div className={cn("flex gap-1", className)}>
        <Button size="sm" variant="outline" onClick={onPrimaryAction}>
          {primaryLabel || "See details"}
        </Button>
      </div>
    );
  }

  // requested variant
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row gap-1 w-full sm:w-auto",
        className,
      )}
    >
      <Button size="sm" variant="outline" onClick={onSecondaryAction}>
        {secondaryLabel || "Cancel"}
      </Button>
      <LoadingButton
        size="sm"
        variant="primary"
        onClick={onPrimaryAction}
        loading={isLoading}
        loadingText="Sending..."
      >
        {primaryLabel || "Send Registration Email"}
      </LoadingButton>
    </div>
  );
};
