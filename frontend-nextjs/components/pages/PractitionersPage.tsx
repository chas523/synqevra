import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { UseMedplumPractitionerResult } from "@/hooks/medplum/useMedplumPractitioners";
import { extractErrorMessage } from "@/lib/utils";
import { EmptyState } from "../atoms";
import { ErrorMessage } from "../molecules";
import HeaderWithTextAndButton from "../molecules/HeaderWithTextAndButton";
import LoadingOverlayInformation from "../molecules/LoadingOverlayInformation";
import InvitePractitionerModal from "../organisms/InvitePractitionerModal";

const PractitionersPage = (
  medplumPractitioners: UseMedplumPractitionerResult
) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { practitionerList, isLoadingPractitioners, practitionersError } =
    medplumPractitioners;

  if (practitionersError) {
    return <ErrorMessage message={extractErrorMessage(practitionersError)} />;
  }
  if (isLoadingPractitioners) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <LoadingOverlayInformation text="Loading practitioners..." />
      </div>
    );
  }

  if (!practitionerList || practitionerList.length === 0) {
    return (
      <>
        <HeaderWithTextAndButton
          mainText="Practitioner List"
          miniText="Manage and view all practitioner records"
          buttonText="Add new practitioner"
          onButtonClick={() => setIsModalOpen(true)}
        />
        <InvitePractitionerModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSuccess={() => {
            // Refresh the list after successful invitation
            medplumPractitioners.refreshPractitioners();
          }}
        />
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="No practitioners found"
          description="Start by adding some practitioners using the form above."
          hint="Add new practitioner using form"
          className="flex-1 mb-6"
        />
      </>
    );
  }

  return (
    <>
      <HeaderWithTextAndButton
        mainText="Practitioner List"
        miniText="Manage and view all practitioner records"
        buttonText="Add new practitioner"
        onButtonClick={() => setIsModalOpen(true)}
      />
      <InvitePractitionerModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={() => {
          // Refresh the list after successful invitation
          medplumPractitioners.refreshPractitioners();
        }}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {practitionerList.map((practitioner) => (
          // biome-ignore lint/a11y/noStaticElementInteractions: <ss>
          // biome-ignore lint/a11y/useKeyWithClickEvents: <explanatiossn>
          <div
            key={practitioner.id}
            className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(`/practitioners/${practitioner.id}`)}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {practitioner.name?.[0]?.given?.join(" ")}{" "}
                  {practitioner.name?.[0]?.family}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {practitioner.qualification?.[0]?.code?.coding?.[0]
                    ?.display || "Practitioner"}
                </p>
                {practitioner.telecom?.[0]?.value && (
                  <p className="text-sm text-gray-500 mt-2">
                    {practitioner.telecom[0].value}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* <PractitionersGrid practitioners={practitionerList} /> */}
    </>
  );
};

export default PractitionersPage;
