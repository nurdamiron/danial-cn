import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/admin/ProfileForm";
import { getCurrentUser } from "@/lib/auth";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  // Store customers use the storefront personal cabinet
  if (user.role !== "ADMIN") {
    redirect("/ru/profile");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-light">Профиль</h1>
        <p className="mt-1 text-sm text-muted">
          Личные данные и смена пароля. Личный кабинет покупателя:{" "}
          <a href="/ru/profile" className="underline">
            /ru/profile
          </a>
        </p>
      </div>
      <ProfileForm user={user} />
    </div>
  );
}
