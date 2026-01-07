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
            className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-4 shadow-sm hover:border-cyan-500/50 transition-all cursor-pointer hover:shadow-md"
            onClick={() => router.push(`/practitioners/${practitioner.id}`)}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-cyan-100 dark:bg-cyan-500/20 rounded-lg">
                <Users className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {practitioner.name?.[0]?.given?.join(" ")}{" "}
                  {practitioner.name?.[0]?.family}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {practitioner.qualification?.[0]?.code?.coding?.[0]
                    ?.display || "Practitioner"}
                </p>
                {practitioner.telecom?.[0]?.value && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
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
