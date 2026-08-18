import Link from "next/link";
import { redirect } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { getCurrentUser } from "@/lib/auth";
import { hasDatabase } from "@/lib/db-config";
import { ArrowRightIcon } from "@/components/ui/icons";

export default async function NewProductPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "ADMIN") redirect("/admin/account");
  if (!hasDatabase()) redirect("/admin");

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 text-xs text-muted underline"
        >
          <ArrowRightIcon className="h-3.5 w-3.5 rotate-180" />
          К списку
        </Link>
        <h1 className="text-xl font-light">Новый товар</h1>
      </div>
      <ProductForm />
    </div>
  );
}
