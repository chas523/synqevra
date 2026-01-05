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
import Image from "next/image";
import Link from "next/link";

import backgroundImage from "@/public/landingPageImage.jpg";

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
    "flex-1",
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
      <div className="flex-1 relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 w-full h-full z-0">
          <Image
            src={backgroundImage}
            alt="Healthcare background"
            fill
            className="object-cover"
          />
          {/* Dark overlay for better form readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="container mx-auto px-4 py-8 flex-1 flex flex-col justify-center relative z-10">
          {/* Hero Section */}
          <HeroSection
            title={heroTitle}
            description={heroDescription}
            color="white"
          />

          {/* Registration Card */}
          <div className="max-w-sm mx-auto mb-6">
            <Card className="py-4 bg-white dark:bg-slate-800 shadow-2xl border-slate-200 dark:border-slate-700">
              <CardHeader className="relative text-center pb-3">
                <CardTitle className="text-xl text-slate-900 dark:text-white">
                  Get Started Today
                </CardTitle>
                <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
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
                {/* Login Redirect */}
                <div className="text-center text-sm mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold hover:underline"
                  >
                    Log in here
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingTemplate;
