"use client";
import { useSearchParams } from "next/navigation";
import { ErrorMessage } from "@/components/molecules";
import LoadingOverlayInformation from "@/components/molecules/LoadingOverlayInformation";
import ActivatePage from "@/components/pages/ActivatePage";
import ConfigurePractitionerPage from "@/components/pages/ConfigurePractitionerPage";
import { useTokenValidation } from "@/hooks/auth/useConnections";

const ActivateAccount = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || undefined;
  const { data, isLoading = true, error, isValid } = useTokenValidation(token);

  console.log("Token from search params:", token);
  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Unauthorized
          </h2>
          <ErrorMessage message="You don't have permission to access this website" />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingOverlayInformation text="Checking token validity..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Token Validation Error
          </h2>
          <ErrorMessage message={error} />
        </div>
      </div>
    );
  }

  if (isValid === false) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Invalid Token
          </h2>
          <p className="text-red-600">
            The provided token is invalid or has expired. Please check your
            activation link and try again.
          </p>
        </div>
      </div>
    );
  }

  if (data?.tokenType === "pendingUser") {
    return <ActivatePage token={token} />;
  }

  if (data?.tokenType === "user") {
    return <ConfigurePractitionerPage token={token} />;
  }

  if (data?.tokenType === "session") {
    // TODO: Implement session view
    return null;
  }

  return null;
};
export default ActivateAccount;
