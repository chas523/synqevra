import { Loader2Icon } from "lucide-react";
import { Button } from "../ui/button";
import { text } from "stream/consumers";

export interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  textBeforeClick: string;
  textAfterClick: string;
  iconBeforeClick?: React.ReactNode;
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
  iconBeforeClick,
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
        <div className="flex items-center">
          {iconBeforeClick && <span className="mr-2">{iconBeforeClick}</span>}
          {textBeforeClick}
        </div>
      )}
    </Button>
  );
};

export default LoadingButton;
