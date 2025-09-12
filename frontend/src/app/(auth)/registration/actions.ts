"use server";

import { redirect } from "next/navigation";

export async function registrationAction(formData: FormData) {
    try {
        const firstName = formData.get("firstName").toString().trim();
        const lastName = formData.get("lastName").toString().trim();
        const email = formData.get("email")?.toString().trim();
        const password = formData.get("password")?.toString().trim();
        const confirmPassword = formData.get("confirmPassword").toString().trim();
        const next = formData.get("next")?.toString() || "/login";

        if (!firstName || !lastName || !email || !password || !confirmPassword) return { error: "All fields are required" };

        if (!email.includes("@")) return { error: "Please enter a valid email address" };

        if (password.length < 6) return { error: "Password must be at least 6 characters long" };

        if (password !== confirmPassword) return { error: "Passwords do not match" };

        const baseUrl = process.env.BASE_URL;
        if (!baseUrl) {
            return { error: "Server configuration error. Please try again later." };
        }

        const response = await fetch(`${baseUrl}/api/noauth/oauth2Clients?platform=WEB`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                error: errorData.message || `Registration failed: ${response.status} ${response.statusText}`
            };
        }
        redirect(next);
    } catch (err) {
        console.error({error: err});
    }
}
