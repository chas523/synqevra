import Heading from "../atoms/Heading";
import Text from "../atoms/Text";

export interface HeroSectionProps {
  title: string;
  description: string;
  className?: string;
}

const HeroSection = ({
  title,
  description,
  className = "",
}: HeroSectionProps) => {
  const baseStyles = ["text-center", "mb-8"];

  const allStyles = [...baseStyles, className];

  return (
    <div className={allStyles.join(" ")}>
      <Heading level={1} size="lg" className="mb-4">
        {title}
      </Heading>
      <Text
        size="md"
        color="muted"
        align="center"
        className="mb-6 max-w-2xl mx-auto"
      >
        {description}
      </Text>
    </div>
  );
};

export default HeroSection;
