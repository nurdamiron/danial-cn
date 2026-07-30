import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { ProductForm } from "@/components/admin/ProductForm";
import { useStaticCatalog } from "@/lib/static-catalog";

export default async function NewProductPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
  if (useStaticCatalog()) {
    redirect("/admin");
  }
  return (
    <div>
      <h1 className="mb-6 text-xl font-light">New product</h1>
      <ProductForm />
      <p className="mt-4 text-xs text-[#666]">
        <Link href="/admin">← Back</Link>
      </p>
    </div>
  );
}
