import { BarChart3Icon } from "lucide-react";
import Heading from "./Heading";
import Text from "./Text";

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
    <BarChart3Icon className="mx-auto h-12 w-12 text-gray-400" />
  );

  return (
    <div
      className={`flex flex-col items-center text-center py-12 bg-gray-50 rounded-lg ${className}`}
    >
      <div className="text-gray-500 mb-4">{icon || defaultIcon}</div>
      <Heading level={3} className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </Heading>
      <Text className="text-gray-600 mb-4">{description}</Text>
      {hint && (
        <Text size="sm" className="text-gray-500">
          {hint}
        </Text>
      )}
    </div>
  );
};

export default EmptyState;
