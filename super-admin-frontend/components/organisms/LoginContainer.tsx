import { AuthHeader, LoginForm } from "../molecules";

interface LoginContainerProps {
  title: string;
  subtitle: string;
  description: string;
  formData: {
    email: string;
    password: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error?: string;
}

export const LoginContainer = ({
  title,
  subtitle,
  description,
  formData,
  onInputChange,
  onSubmit,
  isLoading,
  error,
}: LoginContainerProps) => {
  return (
    <div className="max-w-md w-full space-y-4 bg-white p-8 rounded-lg shadow-md">
      <AuthHeader title={title} subtitle={subtitle} description={description} />

      <LoginForm
        formData={formData}
        onInputChange={onInputChange}
        onSubmit={onSubmit}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};
