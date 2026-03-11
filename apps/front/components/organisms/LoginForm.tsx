import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
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
import { GoogleSignInButton } from "../molecules/GoogleSignInButton";
import { toast } from "sonner";
import { OAuth2Service } from "@/lib/services/thingsboardServices/oauth2Service";

const LoginForm = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { login, isLoading, error } = useLogin();
  const [isGoogleAvailable, setIsGoogleAvailable] = useState(false);

  const role = pathname.endsWith('/admin') ? 'ADMIN' : 'USER';

  useEffect(() => {
    if (role === 'USER') {
      OAuth2Service.checkGoogleAuthAvailable()
        .then(res => setIsGoogleAvailable(res.available))
        .catch(console.error);
    }
  }, [role]);
  useEffect(() => {
    const authStatus = searchParams?.get("status");
    if (authStatus) {
      setTimeout(() => {
        if (authStatus === "new_pending") {
          toast.success("Konto zostało pomyślnie zgłoszone! Poczekaj na weryfikację przez administratora.");
        } else if (authStatus === "existing_activation") {
          toast.info("Już otrzymałeś email aktywacyjny. Sprawdź swoją skrzynkę.");
        } else if (authStatus === "existing_pending") {
          toast.info("Twoje zgłoszenie nadal oczekuje na weryfikację przez administratora.");
        }
      }, 0);

      // Usunięcie argumentu z linku url przeglądarki natychmiastowo poprzez interfejs DOM, omijając router reacta
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [searchParams]);

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

    try {
      await login(formData, role);
      if (role === 'ADMIN') {
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
          <CardHeader className={`relative text-center ${role === 'USER' ? 'pb-4 space-y-4' : 'pb-3'}`}>
            <div className={role === 'USER' ? 'space-y-1.5' : ''}>
              <CardTitle className="text-xl text-slate-900 dark:text-white">
                Log in to account
              </CardTitle>
              <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                {role === 'USER' ? 'Choose your preferred login method' : 'Enter your credentials to log in to this app'}
              </CardDescription>
            </div>

            {role === 'USER' ? (
              isGoogleAvailable ? (
                <>
                  <GoogleSignInButton />

                  <div className="relative pt-2">
                    <div className="absolute inset-0 flex items-center pt-2">
                      <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase pt-2">
                      <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400 font-medium">
                        Or log in with email
                      </span>
                    </div>
                  </div>
                </>
              ) : null
            ) : null}
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
