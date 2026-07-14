import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
  {
    variants: {
      variant: {
        active:
          "bg-transparent text-green-700 dark:bg-green-900/20 dark:text-green-300 border-2 border-green-600/50",
        inactive:
          "bg-transparent text-red-700 dark:bg-red-900/20 dark:text-red-300 border-2 border-red-600/50",
        default:
          "bg-transparent text-muted-foreground dark:bg-gray-900/20 dark:text-gray-300 border-2 border-muted/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  active?: boolean;
}

const StatusBadge = ({
  className = "",
  variant,
  active,
  children,
  ...props
}: StatusBadgeProps) => {
  // Auto-determine variant based on active prop if not explicitly set
  const autoVariant = variant || (active ? "active" : "inactive");

  return (
    <span
      className={badgeVariants({ variant: autoVariant, className })}
      {...props}
    >
      {children}
    </span>
  );
};

export default StatusBadge;
