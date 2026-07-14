import Link from "next/link";
import ProgressContent from "../organisms/ProgressContent";
import Modal from "../templates/Modal";

interface ProgressModalProps {
  isOpen: boolean;
  error?: string | null;
  success?: boolean;
  onClose?: () => void;
  messages?: string[];
}

const PROGRESS_MESSAGES = [
  "Setup starting",
  "Create new User",
  "Create Connections",
  "Create Medplum Project Instance",
  "Create Medplum User",
  "Create Medplum Project",
  "Medplum Configuration Completed successfully",
  "Starting ThingsBoard tenant registration process",
  "Create thingsboard entity inside our database",
  "Authenticating sysadmin",
  "Creating tenant",
  "Creating tenant admin",
  "Get new user activation link",
  "Setting tenant admin password",
  "Configuration Completed successfully, last checks...",
];

const ProgressModal = ({
  isOpen,
  error,
  success,
  onClose,
  messages,
}: ProgressModalProps) => {
  const getStatus = () => {
    if (error) return "error" as const;
    if (success) return "success" as const;
    return "loading" as const;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ProgressContent
        status={getStatus()}
        title="Configuring Your Account"
        messages={messages || PROGRESS_MESSAGES}
        successMessage="Your account has been set up successfully! You can now proceed to login."
        errorMessage={error || "Configuration failed"}
        actionElement={
          getStatus() === "success" ? (
            <Link
              className="ml-2 text-slate-500 hover:underline"
              href="/auth/login"
            >
              Go to Login
            </Link>
          ) : null
        }
      />
    </Modal>
  );
};

export default ProgressModal;
