"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInviteMedplumPractitioner } from "@/hooks/medplum/useMedplumPractitioners";
import {
  type InvitePractitionerFormData,
  invitePractitionerSchema,
} from "@/lib/schemas/practitionerZodSchema";
import { extractErrorMessage } from "@/lib/utils";
import type { FuturePractitionerData } from "@/types/practitionerTypes";
import type { FieldConfig } from "../molecules/HookFormField";
import HookFormField from "../molecules/HookFormField";
import ProgressContent from "./ProgressContent";

interface InvitePractitionerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const INVITATION_FIELDS: FieldConfig<InvitePractitionerFormData>[] = [
  {
    name: "firstName",
    label: "First Name",
    type: "text",
    placeholder: "John",
  },
  {
    name: "lastName",
    label: "Last Name",
    type: "text",
    placeholder: "Doe",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "john.doe@example.com",
  },
];

const InvitePractitionerModal = ({
  open,
  onOpenChange,
  onSuccess,
}: InvitePractitionerModalProps) => {
  const { invitePractitioner, loading, error, resetError } =
    useInviteMedplumPractitioner();
  const [success, setSuccess] = useState(false);
  const formId = useId();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: formErrors },
  } = useForm<InvitePractitionerFormData>({
    resolver: zodResolver(invitePractitionerSchema),
    mode: "onChange",
  });

  useEffect(() => {
    setSuccess(false);
    resetError();
    reset();
  }, [open, reset, resetError]);

  const onSubmit = async (data: InvitePractitionerFormData) => {
    try {
      const practitionerData: FuturePractitionerData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      };
      await invitePractitioner(practitionerData);
      setSuccess(true);
    } catch (err) {
      console.error("Failed to invite practitioner:", err);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSuccess(false);
      reset();
      onOpenChange(false);
      console.log("closed");
    }
  };

  const getStatus = () => {
    if (error) return "error" as const;
    if (success) return "success" as const;
    if (loading) return "loading" as const;
    return "idle" as const;
  };

  const status = getStatus();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        {status === "idle" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Invite New Practitioner
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-2">
                The invited practitioner will receive an email with an
                activation link to create their account and set up their
                credentials.
              </p>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              {INVITATION_FIELDS.map((field) => (
                <HookFormField
                  key={field.name}
                  field={field}
                  register={register}
                  errors={formErrors}
                  formId={formId}
                />
              ))}

              <div className="flex justify-end gap-3 pt-4  text-gray-900 dark:text-white">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit">Invite</Button>
              </div>
            </form>
          </>
        ) : (
          <div className="py-8">
            <ProgressContent
              status={
                status === "loading"
                  ? "loading"
                  : status === "success"
                  ? "success"
                  : "error"
              }
              title={
                status === "loading"
                  ? "Sending Invitation"
                  : status === "success"
                  ? "Success!"
                  : "Error"
              }
              messages={["Preparing invitation...", "Sending email..."]}
              successMessage="Invitation sent successfully!"
              errorMessage={
                extractErrorMessage(error) || "Failed to send invitation"
              }
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InvitePractitionerModal;
