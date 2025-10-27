import { Text } from "../atoms";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
  description: string;
}

export const AuthHeader = ({
  title,
  subtitle,
  description,
}: AuthHeaderProps) => {
  return (
    <div className="text-center">
      <Text size="xl" className="text-4xl">
        {title}
      </Text>
      <div className="flex flex-col gap-1 mt-8">
        <Text
          variant="heading"
          size="lg"
          weight="semibold"
          className="text-gray-900 text-center mb-2"
        >
          {subtitle}
        </Text>
        <Text
          variant="body"
          size="sm"
          color="muted"
          className="text-center mb-6"
        >
          {description}
        </Text>
      </div>
    </div>
  );
};
