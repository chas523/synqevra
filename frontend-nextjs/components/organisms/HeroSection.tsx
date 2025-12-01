import Heading from "../atoms/Heading";
import Text from "../atoms/Text";

export interface HeroSectionProps {
  title: string;
  description: string;
  className?: string;
  color?: "default" | "muted" | "white";
}

const HeroSection = ({
  title,
  description,
  className = "",
  color = "default",
}: HeroSectionProps) => {
  const baseStyles = ["text-center", "mb-8"];

  const allStyles = [...baseStyles, className];

  return (
    <div className={allStyles.join(" ")}>
      <Heading
        level={1}
        size="lg"
        className="mb-4 drop-shadow-lg"
        color={color}
      >
        {title}
      </Heading>
      <Text
        size="md"
        color="muted"
        align="center"
        className="mb-6 max-w-2xl mx-auto drop-shadow-md"
      >
        {description}
      </Text>
    </div>
  );
};

export default HeroSection;
