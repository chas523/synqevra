import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import {
  useConfiguratePractitioner,
  useGetUserByToken,
} from "@/hooks/auth/useConnections";
import { userFields } from "@/lib/config/activateFormFields";
import {
  type ConfigurePractitionerFormData,
  configurePractitionerSchema,
} from "@/lib/schemas/configurePractitionerZodSchema";
import { Heading, LoadingButton } from "../atoms";
import { HeroSection, ProgressModal } from "../organisms";
import { UserFormSection } from "../organisms/UserFormSection";
import { Card, CardContent, CardHeader } from "../ui/card";

interface ConfigurePractitionerPageProps {
  token: string;
}

const ConfigurePractitionerPage = ({
  token,
}: ConfigurePractitionerPageProps) => {
  const { configurePractitioner, isLoading, error, success } =
    useConfiguratePractitioner(token);

  const { userData } = useGetUserByToken(token);

  const formId = useId();

  // Modal visibility state
  const [modalOpen, setModalOpen] = useState(false);

  // Open modal when loading, success, or error changes
  useEffect(() => {
    if (isLoading || success || !!error) {
      setModalOpen(true);
    }
  }, [isLoading, success, error]);

  const form = useForm<ConfigurePractitionerFormData>({
    mode: "onChange",
    resolver: zodResolver(configurePractitionerSchema),
    defaultValues: {
      firstName: userData?.firstName || "",
      lastName: userData?.lastName || "",
      userEmail: userData?.email || "",
      userPhone: "",
      userDescription: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    reset,
  } = form;

  // Update form with fetched user data
  useEffect(() => {
    if (userData) {
      reset({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        userEmail: userData.email || "",
        userPhone: "",
        userDescription: "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [userData, reset]);

  const onSubmit: SubmitHandler<ConfigurePractitionerFormData> = async (
    data
  ) => {
    await configurePractitioner(data);
  };

  // Handler to close modal
  const handleModalClose = () => {
    setModalOpen(false);
  };

  return (
    <>
      <ProgressModal
        isOpen={modalOpen}
        error={error}
        success={success}
        onClose={handleModalClose}
        messages={[
          "Setup starting",
          "Create new User",
          "Sending welcome email",
          "Setup complete, last checks...",
        ]}
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <HeroSection
            title="Set Your Password"
            description="Create a secure password to access your practitioner account"
          />
          <Card className="shadow-lg">
            <CardHeader className="border-b bg-muted/30">
              <Heading level={2}>Complete Your Profile</Heading>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <UserFormSection
                  register={register}
                  errors={errors}
                  formId={formId}
                  disabledFields={
                    userData ? ["firstName", "lastName", "userEmail"] : []
                  }
                />

                <LoadingButton
                  type="submit"
                  className="w-full h-9"
                  isLoading={isLoading || isSubmitting}
                  textBeforeClick="Configure"
                  textAfterClick="Configuring..."
                  disabled={!isValid || isLoading || isSubmitting}
                />
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ConfigurePractitionerPage;
