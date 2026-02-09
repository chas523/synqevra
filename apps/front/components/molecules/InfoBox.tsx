import { Text } from "../atoms";

export interface InfoBoxProps {
  title: string;
  description: string;
  variant?: "blue" | "green" | "yellow" | "gray";
  className?: string;
}

const InfoBox = ({
  title,
  description,
  variant = "blue",
  className = "",
}: InfoBoxProps) => {
  const baseStyles = ["mt-4", "p-3", "rounded-lg"];

  const variantStyles = {
    blue: ["bg-blue-50", "dark:bg-blue-900/20"],
    green: ["bg-green-50", "dark:bg-green-900/20"],
    yellow: ["bg-yellow-50", "dark:bg-yellow-900/20"],
    gray: ["bg-gray-50", "dark:bg-gray-800"],
  };

  const textColors = {
    blue: {
      title: "text-blue-800 dark:text-blue-200",
      description: "text-blue-700 dark:text-blue-300",
    },
    green: {
      title: "text-green-800 dark:text-green-200",
      description: "text-green-700 dark:text-green-300",
    },
    yellow: {
      title: "text-yellow-800 dark:text-yellow-200",
      description: "text-yellow-700 dark:text-yellow-300",
    },
    gray: {
      title: "text-gray-800 dark:text-gray-200",
      description: "text-gray-700 dark:text-gray-300",
    },
  };

  const allStyles = [...baseStyles, ...variantStyles[variant], className];

  return (
    <div className={allStyles.join(" ")}>
      <div className="flex items-start">
        <div>
          <Text size="xs" weight="medium" className={textColors[variant].title}>
            {title}
          </Text>
          <Text
            size="xs"
            className={`mt-0.5 ${textColors[variant].description}`}
          >
            {description}
          </Text>
        </div>
      </div>
    </div>
  );
};

export default InfoBox;
