import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/context";

export default async function RootPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/login");
  }
  redirect("/dashboard");
}
