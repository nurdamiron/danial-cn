import { redirect } from "next/navigation";
import { AuthForm } from "@/components/admin/AuthForm";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(user.role === "ADMIN" ? "/admin" : "/admin/account");
  }
  return <AuthForm mode="login" />;
}
