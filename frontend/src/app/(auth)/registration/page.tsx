"use client";

import { useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { registrationAction } from "@/app/(auth)/registration/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RegistrationPage() {
    const searchParams = useSearchParams();
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const next = searchParams?.get("next") || "/login";

    async function register(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(event.currentTarget);

        try {
            const result = await registrationAction(formData);
            if (result?.error) setError(result.error);
        } catch (error) {
            setError("Registration error. Please try again.");
            console.error("Registration error:", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen grid place-items-center p-6">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-center">Sign up</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

                    <form onSubmit={register} className="grid gap-4">
                        <input type="hidden" name="next" value='/login' />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id='firstName'
                                    name="firstName"
                                    type='text'
                                    required
                                    placeholder='First Name'
                                    disabled={isLoading}
                                />
                            </div>
                            <div className='grid gap-2'>
                                <Label htmlFor='lastName'>Last Name</Label>
                                <Input
                                    id='lastName'
                                    name="lastName"
                                    type='text'
                                    required
                                    placeholder='Last Name'
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="email@example.com"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Password"
                                required
                                minLength={6}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="Confirm your password"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full cursor-pointer"
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </Button>
                    </form>

                    <div className="mt-4 text-center text-sm">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-primary underline hover:text-primary/80"
                        >
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}