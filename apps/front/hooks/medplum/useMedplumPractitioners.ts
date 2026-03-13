import type { Practitioner } from "@medplum/fhirtypes";
import { useCallback, useState } from "react";
import useSWR from "swr";
import { PractitionerService } from "@/lib/services/medplumService/practitionerService";
import type { FuturePractitionerData } from "@/types/practitionerTypes";

export interface UseMedplumPractitionerResult {
  practitionerList: Practitioner[] | null;
  isLoadingPractitioners: boolean;
  practitionersError: Error | null;
  refreshPractitioners: () => void;
}

export const useMedplumPractitioners = (): UseMedplumPractitionerResult => {
  const {
    data: practitionerList,
    error: practitionersError,
    isLoading: isLoadingPractitioners,
    mutate: refreshPractitioners,
  } = useSWR("medplum-practitioners", () =>
    PractitionerService.fetchPractitioners(),
  );
  console.log(practitionerList);
  return {
    practitionerList: practitionerList || null,
    isLoadingPractitioners,
    practitionersError,
    refreshPractitioners,
  };
};

export const useInviteMedplumPractitioner = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const invitePractitioner = async (
    practitionerData: FuturePractitionerData,
  ) => {
    setLoading(true);
    setError(null);
    try {
      await PractitionerService.invite(practitionerData);
      console.log("success");
    } catch (err) {
      console.log("Error in hook:", err);
      setError(err as Error);
      //throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetError = useCallback(() => setError(null), []);

  return { invitePractitioner, loading, error, resetError };
};

// export const useUpdateMedplumPractitioner = (id: string | undefined | null) => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<Error | null>(null);

//   const updatePractitioner = async (practitionerData: Practitioner) => {
//     if (!id) {
//       const err = new Error("Practitioner ID is required");
//       setError(err);
//       throw err;
//     }
//     setLoading(true);
//     setError(null);
//     try {
//       const practitioner = await PractitionerService.updatePractitionerById(
//         practitionerData,
//         id,
//       );
//       return practitioner;
//     } catch (err) {
//       setError(err as Error);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   };

//   return { updatePractitioner, loading, error };
// };

// export const useMedplumPractitionerById = (id: string | undefined | null) => {
//   const {
//     data: practitioner,
//     error,
//     isLoading,
//     mutate,
//   } = useSWR(id ? `medplum-practitioner-${id}` : null, () => {
//     return id ? PractitionerService.fetchPractitionerById(id) : null;
//   });

//   return {
//     practitioner: practitioner,
//     isLoading,
//     error,
//     refreshPractitioner: mutate,
//   };
// };
