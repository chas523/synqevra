import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default function HomePage() {
  const cookieStore = cookies();
  const hasSession = cookieStore.get("session")?.value;

  if (hasSession) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}