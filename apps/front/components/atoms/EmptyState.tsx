import { BarChart3Icon } from "lucide-react";
import Heading from "./Heading";
import { Text } from ".";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  hint?: string;
  icon?: React.ReactNode;
  className?: string;
}

const EmptyState = ({
  title = "No Data Available",
  description = "There are no items to display at this time.",
  hint,
  icon,
  className = "",
}: EmptyStateProps) => {
  const defaultIcon = (
    <BarChart3Icon className="mx-auto h-12 w-12 text-slate-500" />
  );

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 bg-slate-50 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl ${className}`}
    >
      <div className="text-slate-400 mb-4">{icon || defaultIcon}</div>
      <Heading
        level={3}
        className="text-lg font-medium text-slate-900 dark:text-white mb-2"
      >
        {title}
      </Heading>
      <Text className="text-slate-500 dark:text-slate-400 mb-4">
        {description}
      </Text>
      {hint && (
        <Text size="sm" className="text-slate-400 dark:text-slate-500">
          {hint}
        </Text>
      )}
    </div>
  );
};

export default EmptyState;
