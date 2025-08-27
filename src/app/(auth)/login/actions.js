"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData) {
  const email = formData.get("email")?.trim();
  const password = formData.get("password")?.trim();
  const next = formData.get("next") || "/dashboard";

  const response = await fetch(`https://demo.thingsboard.io/api/auth/login`, {
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
    const errorData = await response.json();
    throw new Error(errorData.message || "Authentication failed");
  }

  const { token } = await response.json();

  console.log('token', token);

  const cookieStore = await cookies();

  cookieStore.set('session', token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect(next);
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set("session", "", { path: "/", maxAge: 0 });
  redirect("/login");
}
