"use client";
import PractitionersPage from "@/components/pages/PractitionersPage";
import { useMedplumPractitioners } from "@/hooks/medplum/useMedplumPractitioners";

const Page = () => {
  const medplumPractitioners = useMedplumPractitioners();

  return <PractitionersPage {...medplumPractitioners} />;
};
export default Page;
