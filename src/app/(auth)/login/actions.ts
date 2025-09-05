"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface LoginResponse {
  token: string;
}

interface ErrorResponse {
  message?: string;
}

export async function loginAction(formData: FormData): Promise<void> {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString().trim();
  const next = formData.get("next")?.toString() || "/dashboard";

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error("BASE_URL environment variable is not set");
  }

  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: email,
      password: password
    }),
  });

  if (!response.ok) {
    let errorData: ErrorResponse;
    try {
      errorData = await response.json() as ErrorResponse;
    } catch {
      throw new Error(`Authentication failed with status: ${response.status}`);
    }
    throw new Error(errorData.message || "Authentication failed");
  }

  let data: LoginResponse;
  try {
    data = await response.json() as LoginResponse;
  } catch {
    throw new Error("Invalid response from server");
  }

  const { token } = data;

  const cookieStore = await cookies();

  cookieStore.set('session', token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect(next);
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("session", "", { path: "/", maxAge: 0 });
  redirect("/login");
}