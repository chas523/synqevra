"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const DEMO_EMAIL = "admin@example.com";
const DEMO_PASSWORD = "admin123";

export async function login(formData) {
  const email = formData.get("email")?.trim();
  const password = formData.get("password")?.trim();
  const next = formData.get("next") || "/dashboard";

  const valid = email === DEMO_EMAIL && password === DEMO_PASSWORD;

  if (!valid) {
    redirect(
      `/login?error=${encodeURIComponent(
        "Invalid email or password"
      )}&next=${encodeURIComponent(next)}`
    );
  }

  cookies().set("session", email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect(next);
}

export async function logout() {
  cookies().set("session", "", { path: "/", maxAge: 0 });
  redirect("/login");
}
