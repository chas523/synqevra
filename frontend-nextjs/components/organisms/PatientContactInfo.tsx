import type { Patient } from "@medplum/fhirtypes";
import { Mail, MapPin, Phone } from "lucide-react";
import { PatientContactItem } from "../molecules/PatientContactItem";

interface PatientContactInfoProps {
  patient: Patient;
}

const PatientContactInfo = ({ patient }: PatientContactInfoProps) => {
  const phoneContact = patient.telecom?.find((t) => t.system === "phone");
  const emailContact = patient.telecom?.find((t) => t.system === "email");

  const address = patient.address?.[0];
  const addressText = address
    ? [address.line?.[0], address.city, address.state, address.postalCode]
        .filter(Boolean)
        .join(", ")
    : null;

  const hasContactInfo =
    phoneContact?.value || emailContact?.value || addressText;

  return hasContactInfo ? (
    <div className="space-y-1.5">
      {phoneContact?.value && (
        <PatientContactItem
          icon={Phone}
          label="Phone"
          value={phoneContact.value}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
      )}

      {emailContact?.value && (
        <PatientContactItem
          icon={Mail}
          label="Email"
          value={emailContact.value}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
      )}

      {addressText && (
        <PatientContactItem
          icon={MapPin}
          label="Address"
          value={addressText}
          iconBgColor="bg-orange-100"
          iconColor="text-orange-600"
        />
      )}
    </div>
  ) : (
    <p className="text-center text-xs text-slate-500 py-2">
      No contact information available
    </p>
  );
};

export default PatientContactInfo;
