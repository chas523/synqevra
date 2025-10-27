import { Loader2Icon } from "lucide-react";
import { Button } from "../ui/button";

export interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  textBeforeClick: string;
  textAfterClick: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const LoadingButton = ({
  isLoading,
  textBeforeClick,
  textAfterClick,
  variant = "default",
  size = "default",
  className = "",
  disabled,
  ...props
}: LoadingButtonProps) => {
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center">
          <Loader2Icon
            aria-label="Loading"
            className="size-4 animate-spin mr-2"
          />
          {textAfterClick}
        </div>
      ) : (
        textBeforeClick
      )}
    </Button>
  );
};

export default LoadingButton;
