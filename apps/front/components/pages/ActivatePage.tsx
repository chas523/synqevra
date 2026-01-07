import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId, useState } from "react";
import { type SubmitHandler, useForm, UseFormRegister } from "react-hook-form";
import { useEstablishConnection } from "@/hooks/auth/useConnections";
import { tenantFields, userFields } from "@/lib/config/activateFormFields";
import {
  type ConnectionFormData,
  connectionSchema,
} from "@/lib/schemas/activationZodSchema";
import type {
  ApiData,
  ConnectionFormProps,
  TenantFormFields,
  UserFormFields,
} from "@/types/connectionTypes";
import { Heading, LoadingButton } from "../atoms";
import { HeroSection, ProgressModal } from "../organisms";
import { TenantFormSection } from "../organisms/TenantFormSection";
import { UserFormSection } from "../organisms/UserFormSection";
import { Card, CardContent, CardHeader } from "../ui/card";
import { ConfigurePractitionerFormData } from "@/lib/schemas/configurePractitionerZodSchema";

// Transform flat form data to nested structure
const transformFormData = (flatData: ConnectionFormData): ApiData => {
  const tenantFieldNames = tenantFields.map(
    (field) => field.name
  ) as (keyof ConnectionFormData)[];
  const userFieldNames = userFields.map(
    (field) => field.name
  ) as (keyof ConnectionFormData)[];

  const tenantData: Record<string, string | undefined> = {};
  const userData: Record<string, string | undefined> = {};

  // Separate fields into tenant and user objects
  (Object.entries(flatData) as [keyof ConnectionFormData, string][]).forEach(
    ([key, value]) => {
      if (tenantFieldNames.includes(key)) {
        tenantData[key] = value;
      } else if (userFieldNames.includes(key)) {
        userData[key] = value;
      }
    }
  );

  return {
    tenantFields: tenantData as unknown as TenantFormFields,
    userFields: userData as unknown as UserFormFields,
  };
};

const ActivatePage = ({ token }: ConnectionFormProps) => {
  const { establishConnection, isLoading, error, success } =
    useEstablishConnection(token);

  const formId = useId();

  // Modal visibility state
  const [modalOpen, setModalOpen] = useState(false);

  // Open modal when loading, success, or error changes
  useEffect(() => {
    if (isLoading || success || !!error) {
      setModalOpen(true);
    }
  }, [isLoading, success, error]);

  const form = useForm<ConnectionFormData>({
    mode: "onChange",
    resolver: zodResolver(connectionSchema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = form;

  // biome-ignore lint/suspicious/noExplicitAny: testing without strict typing
  const onSubmit: SubmitHandler<ConnectionFormData> = async (data: any) => {
    // Transform flat data to nested structure for API
    const transformedData = transformFormData(data);

    await establishConnection(transformedData);
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
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 transition-colors">
        <div className="max-w-6xl mx-auto space-y-6">
          <HeroSection
            title="Configure Your Account"
            description="Set up your company and user details to get started"
          />
          <Card className="shadow-lg bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30">
              <Heading level={2}>Account Setup</Heading>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <TenantFormSection
                    register={register}
                    errors={errors}
                    formId={formId}
                  />

                  <UserFormSection
                    register={
                      register as unknown as UseFormRegister<ConfigurePractitionerFormData>
                    }
                    errors={errors}
                    formId={formId}
                  />
                </div>

                <LoadingButton
                  type="submit"
                  className="w-full h-9"
                  isLoading={isLoading || isSubmitting}
                  textBeforeClick="Log in"
                  textAfterClick="Logging in..."
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

export default ActivatePage;
