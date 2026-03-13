import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
  {
    variants: {
      variant: {
        active:
          "bg-transparent text-green-800 dark:bg-green-900/20 dark:text-green-300 border-2 border-green-600/30",
        inactive:
          "bg-transparent text-red-800 dark:bg-red-900/20 dark:text-red-300 border-2 border-red-600/30",
        default:
          "bg-transparent text-gray-800 dark:bg-gray-900/20 dark:text-gray-300 border-2 border-gray-600/30",
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
