import {Text} from "@/components/atoms/Text";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const EmptyState = ({ icon, title, description }: EmptyStateProps) => {
  return (
    <div className="text-center py-12 text-gray-500 flex flex-col gap-2">
      <div className="h-12 w-12 mx-auto mb-4 text-gray-300">{icon}</div>
      <Text variant="heading" color="muted" className="mb-2">
        {title}
      </Text>
      <Text variant="caption" color="muted">
        {description}
      </Text>
    </div>
  );
};
