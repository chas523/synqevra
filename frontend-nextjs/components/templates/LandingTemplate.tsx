import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import InfoTooltip from "../molecules/InfoTooltip";
import ActivationInfo from "../organisms/ActivationInfo";
import HeroSection from "../organisms/HeroSection";
import type { FormData } from "../organisms/RegistrationForm";
import RegistrationForm from "../organisms/RegistrationForm";
import SuccessMessage from "../organisms/SuccessMessage";

export interface LandingTemplateProps {
  // Hero props
  heroTitle: string;
  heroDescription: string;

  // Form props
  onFormSubmit: (formData: FormData) => void;
  isFormLoading?: boolean;
  formError?: string | null;

  // Success state
  isSubmitted: boolean;
  successTitle?: string;
  successDescription?: string;

  // Info tooltip
  tooltipContent?: React.ReactNode;

  // Activation info
  activationTitle?: string;
  activationDescription?: string;

  className?: string;
}

const LandingTemplate = ({
  heroTitle,
  heroDescription,
  onFormSubmit,
  isFormLoading = false,
  formError,
  isSubmitted,
  successTitle,
  successDescription,
  tooltipContent,
  activationTitle,
  activationDescription,
  className = "",
}: LandingTemplateProps) => {
  const baseStyles = [
    "min-h-screen",
    "bg-gradient-to-br",
    "from-blue-50",
    "to-indigo-100",
    "dark:from-gray-900",
    "dark:to-gray-800",
    "flex",
    "flex-col",
  ];

  const allStyles = [...baseStyles, className];

  const defaultTooltipContent = (
    <>
      If you wanna purchase self-hosted platform, contact us with the{" "}
      <a href="/contact" className="text-blue-600 underline">
        form
      </a>
      .
    </>
  );

  return (
    <div className={allStyles.join(" ")}>
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
        {/* Hero Section */}
        <HeroSection title={heroTitle} description={heroDescription} />

        {/* Registration Card */}
        <div className="max-w-sm mx-auto mb-6">
          <Card className="py-4">
            <CardHeader className="relative text-center pb-3">
              <CardTitle className="text-xl">Get Started Today</CardTitle>
              <CardDescription className="text-sm">
                Create your account and start exploring our platform
              </CardDescription>

              {/* Info Tooltip */}
              <div className="absolute right-2 top-1">
                <InfoTooltip
                  content={tooltipContent || defaultTooltipContent}
                />
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Show form or success message */}
              {!isSubmitted || formError ? (
                <RegistrationForm
                  onSubmit={onFormSubmit}
                  isLoading={isFormLoading}
                  error={formError}
                />
              ) : (
                <SuccessMessage
                  title={successTitle}
                  description={successDescription}
                />
              )}

              {/* Activation Info */}
              <ActivationInfo
                title={activationTitle}
                description={activationDescription}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LandingTemplate;
