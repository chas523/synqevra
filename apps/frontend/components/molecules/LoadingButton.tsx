import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { ButtonAtom as Button } from "@/components/atoms/ButtonAtom";

interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const LoadingButton = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  loadingText,
  children,
  disabled,
  ...props
}: LoadingButtonProps) => {
  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          {loadingText || children}
        </>
      ) : (
        children
      )}
    </Button>
  );
};
