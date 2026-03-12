import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { useState } from "react";
import { useLogin } from "@/hooks/auth/useAuth";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import type { LoginFormData } from "@/types/authTypes";
import { LoadingButton } from "../atoms";
import { ErrorMessage, FormField } from "../molecules";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

const LoginForm = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { login, isLoading, error } = useLogin();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: LoginFormData) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) return;
    if (!formData.email.includes("@")) return;

    const role = pathname.endsWith("/admin") ? "ADMIN" : "USER";

    try {
      await login(formData, role);
      if (role === "ADMIN") {
        router.push("/dashboard");
      } else {
        router.push("/devices");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-sm w-full mx-auto">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Card className="py-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
          <CardHeader className="relative text-center pb-3">
            <CardTitle className="text-xl text-slate-900 dark:text-white">
              Log in to account
            </CardTitle>
            <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
              Enter your credentials to log in to this app
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col pt-0 gap-2">
            <FormField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="email@domain.com"
              required
            />
            <FormField
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="•••••"
              type="password"
              required
            />
          </CardContent>
          {error && <ErrorMessage message={error} />}

          <CardFooter>
            <LoadingButton
              type="submit"
              className="w-full h-9"
              isLoading={isLoading}
              textBeforeClick="Log in"
              textAfterClick="Logging in..."
            />
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default LoginForm;
