import { extractErrorMessage } from "@/lib/utils";
import { ErrorMessage, Input } from "../atoms";
import { LoadingButton } from "./LoadingButton";

interface LoginFormProps {
  formData: {
    email: string;
    password: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error?: string;
}

export const LoginForm = ({
  formData,
  onInputChange,
  onSubmit,
  isLoading,
  error,
}: LoginFormProps) => {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Input
        name="email"
        type="email"
        required
        value={formData.email}
        onChange={onInputChange}
        placeholder="email@domain.com"
        disabled={isLoading}
        variant={error ? "error" : "default"}
      />
      <Input
        name="password"
        type="password"
        required
        value={formData.password}
        onChange={onInputChange}
        placeholder="Password"
        disabled={isLoading}
        variant={error ? "error" : "default"}
      />

      {error && <ErrorMessage message={extractErrorMessage(error)} />}

      <div className="pt-2">
        <LoadingButton
          type="submit"
          loading={isLoading}
          loadingText="Logging in..."
          fullWidth
        >
          Log in
        </LoadingButton>
      </div>
    </form>
  );
};
