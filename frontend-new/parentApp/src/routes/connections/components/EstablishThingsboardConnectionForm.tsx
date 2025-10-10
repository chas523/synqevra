import { zodResolver } from '@hookform/resolvers/zod';
import { useId } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { extractErrorMessage } from '@/lib/errorUtils';
import { tenantFields, userFields } from '../config/formFields';
import { useEstablishThingsboardConnection } from '../hooks/useConnections';
import {
  type ThingsboardFormData,
  thingsboardSchema,
} from '../schemas/thingsboardSchema';
import type {
  TenantFormFields,
  ThingsboardApiData,
  UserFormFields,
} from '../types';
import { SubmitActions } from './forms/SubmitActions';
import { TenantFormSection } from './forms/TenantFormSection';
import { UserFormSection } from './forms/UserFormSection';

// Transform flat form data to nested structure
const transformFormData = (
  flatData: ThingsboardFormData,
): ThingsboardApiData => {
  const tenantFieldNames = tenantFields.map(field => field.name);
  const userFieldNames = userFields.map(field => field.name);

  const tenantData: Record<string, string | undefined> = {};
  const userData: Record<string, string | undefined> = {};

  // Separate fields into tenant and user objects
  Object.entries(flatData).forEach(([key, value]) => {
    if (tenantFieldNames.includes(key)) {
      tenantData[key] = value;
    } else if (userFieldNames.includes(key)) {
      userData[key] = value;
    }
  });

  return {
    tenantFields: tenantData as unknown as TenantFormFields,
    userFields: userData as unknown as UserFormFields,
  };
};

interface EstablishThingsboardConnectionFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const EstablishThingsboardConnectionForm = ({
  onClose,
  onSuccess,
}: EstablishThingsboardConnectionFormProps) => {
  const { establishThingsboardConnection, isLoading, error, success } =
    useEstablishThingsboardConnection();
  const formId = useId();

  const form = useForm<ThingsboardFormData>({
    mode: 'onChange',
    defaultValues: {
      userEmail: 'defaultEmail@email.com',
      firstName: 'defaultFirstName',
      lastName: 'defaultLastName',
    },
    resolver: zodResolver(thingsboardSchema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = form;

  // Debug form state

  // biome-ignore lint/suspicious/noExplicitAny: testing without strict typing
  const onSubmit: SubmitHandler<ThingsboardFormData> = async (data: any) => {
    // Transform flat data to nested structure for API
    const transformedData = transformFormData(data);

    await establishThingsboardConnection(transformedData);

    onSuccess?.();
    onClose();
  };

  return (
    <Card
      className="h-5/6 overflow-y-auto w-full max-w-6xl"
      onClick={e => e.stopPropagation()}
    >
      <CardHeader>
        <CardTitle>Configure ThingsBoard Tenant & User</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Section - Tenant Data */}
            <TenantFormSection
              register={register}
              errors={errors}
              formId={formId}
            />

            {/* Right Section - User Data */}
            <UserFormSection
              register={register}
              errors={errors}
              formId={formId}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                <span className="font-medium">Error:</span> {error}
              </p>
            </div>
          )}

          {/* Success Display */}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">
                <span className="font-medium">Success:</span> ThingsBoard tenant
                and user created successfully!
              </p>
            </div>
          )}

          {/* Actions */}
          <SubmitActions
            isLoading={isLoading || isSubmitting}
            onCancel={onClose}
            isValid={isValid && Object.keys(errors).length === 0}
          />
        </form>
      </CardContent>
    </Card>
  );
};

export default EstablishThingsboardConnectionForm;
