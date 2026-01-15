import { useRouter } from "next/navigation";
import React from "react";
import { useState } from "react";
import {useAdminLogin} from "@/hooks/auth/useAuth";
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

const AdminLoginForm = () => {
    const router = useRouter();
    const { login, isLoading, error } = useAdminLogin();

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
            await login(formData);
            router.push("/dashboard/requestedUsers");
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
                            Enter your credentials to log in into admin dashboard
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="flex flex-col pt-0 gap-2">
                        <FormField
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="admin@domain.com"
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

export default AdminLoginForm;
