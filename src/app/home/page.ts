import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function HomePage() {
  const cookieStore = await cookies();
  const hasSession = cookieStore.get("session")?.value;

  if (hasSession) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
