import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
  return (
    <div>
      <h1 className="mb-6 text-xl font-light">New product</h1>
      <ProductForm />
    </div>
  );
}
