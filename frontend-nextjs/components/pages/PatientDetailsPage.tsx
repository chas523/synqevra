"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  ArrowLeft,
  Edit,
  Activity,
  User,
  Phone,
  Building2,
  MessageSquare,
  Clock,
  HashIcon,
  HeartPulse,
  ArrowRight,
} from "lucide-react";
import type { Patient } from "@medplum/fhirtypes";
import { PatientAvatarCarousel } from "../molecules/AvatarCarousel";
import {
  PatientHealthcareProviders,
  PatientCommunicationPreferences,
  ErrorMessage,
} from "../molecules";
import { PatientDetailSection } from "../templates/PatientDetailSectionTemplate";
import { PatientContactInfo, PatientPersonalInfo } from "../organisms";
import { useRouter } from "next/navigation";
import { useMedplumObservationsByPatientId } from "@/hooks/medplum/useMedplumObservations";
import { extractErrorMessage, formatDate } from "@/lib/utils";
import LoadingOverlayInformation from "../molecules/LoadingOverlayInformation";
import PatientObservationList from "../organisms/PatientObservationList";
import { EmptyState } from "../atoms";

interface PatientCardProps {
  patient: Patient;
}
const OBSERVATIONS_COUNT_ON_USER_DETAILS_PAGE = 3;
const PatientDetailsPage = ({ patient }: PatientCardProps) => {
  const router = useRouter();

  const { observations, isLoadingObservations, observationsError } =
    useMedplumObservationsByPatientId(
      patient.id,
      OBSERVATIONS_COUNT_ON_USER_DETAILS_PAGE,
    );

  const getFullName = () => {
    const name = patient.name?.[0];
    if (!name) return "Unknown Patient";
    const given = name.given?.join(" ") || "";
    const family = name.family || "";
    const prefix = name.prefix?.join(" ") || "";
    return [prefix, given, family].filter(Boolean).join(" ");
  };

  const getInitials = () => {
    const name = patient.name?.[0];
    if (!name) return "?";
    const givenInitial = name.given?.[0]?.[0] || "";
    const familyInitial = name.family?.[0] || "";
    return (givenInitial + familyInitial).toUpperCase();
  };

  const phones = patient.telecom?.filter((t) => t.system === "phone") || [];
  const emails = patient.telecom?.filter((t) => t.system === "email") || [];
  const hasContactInfo = phones.length > 0 || emails.length > 0;
  const hasPersonalInfo =
    patient.birthDate || patient.gender || patient.maritalStatus;
  const hasHealthcareProviders =
    patient.generalPractitioner || patient.managingOrganization;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl">
        <Button
          variant="ghost"
          onClick={() => router.push("/patients")}
          className="mb-4 gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Patients
        </Button>

        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <PatientAvatarCarousel
                  photos={patient.photo || []}
                  fullName={getFullName()}
                  initials={getInitials()}
                  isHovered={false}
                />
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {getFullName()}
                  </h1>
                  <Badge
                    variant={patient.active ? "default" : "secondary"}
                    className={
                      patient.active
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                        : "bg-slate-200 text-slate-600 hover:bg-slate-200"
                    }
                  >
                    <Activity className="mr-1 h-3 w-3" />
                    {patient.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-slate-600">
                  {patient.id && (
                    <div className="flex items-center gap-2">
                      <HashIcon className="h-3.5 w-3.5" />
                      <span>Patient ID: {patient.id}</span>
                    </div>
                  )}
                  {patient.meta?.lastUpdated && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        Last updated: {formatDate(patient.meta.lastUpdated)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={() => router.push(`/patients/${patient.id}/edit`)}
              size="lg"
              className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg"
            >
              <Edit className="h-4 w-4" />
              Edit Patient
            </Button>
          </div>
        </div>

        <PatientDetailSection
          title="Latest Observations"
          icon={<HeartPulse className="h-5 w-5" />}
          isEmpty={!observations || observations.length === 0}
          emptyMessage="No observations available"
          className="mb-6"
        >
          {isLoadingObservations ? (
            <LoadingOverlayInformation text="Loading observations..." />
          ) : observationsError ? (
            <ErrorMessage message={extractErrorMessage(observationsError)} />
          ) : !observations || observations.length === 0 ? (
            <EmptyState
              icon={<HeartPulse className="h-5 w-5" />}
              title="No observations available"
              description="There are no observations to display."
            />
          ) : (
            <>
              <PatientObservationList
                observations={observations}
                patientId={patient.id}
              />
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs cursor-pointer text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 px-2 py-1 h-7"
                  onClick={() =>
                    router.push(`/patients/${patient.id}/observations`)
                  }
                >
                  View all observations
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </>
          )}
        </PatientDetailSection>

        <div className="grid gap-6 md:grid-cols-2">
          {/* personal info */}
          <PatientDetailSection
            title="Personal Information"
            icon={<User className="h-5 w-5" />}
            isEmpty={!hasPersonalInfo}
            emptyMessage="No personal information available"
          >
            <PatientPersonalInfo patient={patient} variant="detailed" />
          </PatientDetailSection>

          {/* contact info */}
          <PatientDetailSection
            title="Contact Information"
            icon={<Phone className="h-5 w-5" />}
            isEmpty={!hasContactInfo}
            emptyMessage="No contact information available"
          >
            <PatientContactInfo patient={patient} variant="detailed" />
          </PatientDetailSection>

          {/* hospital and practitioner name */}
          <PatientDetailSection
            title="Healthcare Providers"
            icon={<Building2 className="h-5 w-5" />}
            isEmpty={!hasHealthcareProviders}
            emptyMessage="No healthcare provider information available"
          >
            <PatientHealthcareProviders patient={patient} variant="detailed" />
          </PatientDetailSection>

          {/* Communication Preferences */}
          {patient.communication && patient.communication.length > 0 && (
            <PatientDetailSection
              title="Communication Preferences"
              icon={<MessageSquare className="h-5 w-5" />}
            >
              <PatientCommunicationPreferences
                patient={patient}
                variant="detailed"
              />
            </PatientDetailSection>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsPage;
