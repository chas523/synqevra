import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const cookieStore = await cookies();
  const hasSession = cookieStore.get("session")?.value;

  if (hasSession) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
