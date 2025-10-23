import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
  {
    variants: {
      variant: {
        active:
          "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
        inactive:
          "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
        default:
          "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
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
