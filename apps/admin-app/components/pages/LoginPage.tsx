"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLogin } from "@/hooks/auth/useAuth";
import type { LoginFormData } from "@/lib/types/loginTypes";
import { LoginContainer } from "../organisms";

export const LoginPage = () => {
  const router = useRouter();
  const { login, isLoading, error, success } = useLogin();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (success) {
      router.push("/dashboard/requestedUsers");
    }
  }, [success, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.password) {
      return;
    }

    if (!formData.email.includes("@")) {
      return;
    }

    await login(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <LoginContainer
        title="Super Admin App"
        subtitle="Log in to super admin dashboard"
        description="Enter your credentials to log in to this app"
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error || undefined}
      />
    </div>
  );
};
