"use client";
import { useState } from "react";
import { useEmailSend } from "@/hooks/auth/useEmailSend";
import type { FormData } from "../organisms";
import { LandingTemplate } from "../templates";

const LandingPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { sendEmail, isLoading, error } = useEmailSend();

  const handleFormSubmit = async (formData: FormData) => {
    await sendEmail(formData);
    setIsSubmitted(true);
  };

  const tooltipContent = (
    <>
      If you wanna purchase self-hosted platform, contact us with the{" "}
      <a href="/contact" className="text-blue-600 underline">
        form
      </a>
      .
    </>
  );

  return (
    <LandingTemplate
      heroTitle="Try Out Our Amazing Platform"
      heroDescription="Join thousands of users who have transformed their workflow with our innovative solution. Start your journey today and experience the difference."
      onFormSubmit={handleFormSubmit}
      isFormLoading={isLoading}
      formError={error}
      isSubmitted={isSubmitted}
      tooltipContent={tooltipContent}
      activationTitle="Activation Information: "
      activationDescription="We'll send an activation link to configure your account to the provided email. The process usually takes a few hours."
    />
  );
};

export default LandingPage;
