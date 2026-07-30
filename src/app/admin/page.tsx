import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { formatKzt } from "@/lib/money";

export default async function AdminHomePage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const products = await prisma.product.findMany({
    include: {
      images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] },
      _count: { select: { images: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-light">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-[#111] px-4 py-2 text-xs text-white"
        >
          + New product
        </Link>
      </div>
      <div className="overflow-x-auto border border-[#e5e5e5] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#e5e5e5] text-xs tracking-wide text-[#666]">
            <tr>
              <th className="p-3">Photo</th>
              <th className="p-3">Name</th>
              <th className="p-3">Status</th>
              <th className="p-3">Images</th>
              <th className="p-3">Price</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-[#e5e5e5]">
                <td className="p-3">
                  {p.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.images[0].url}
                      alt=""
                      className="h-12 w-10 object-contain"
                    />
                  ) : (
                    <span className="text-xs text-[#666]">no photo</span>
                  )}
                </td>
                <td className="p-3">
                  <div className="text-xs text-[#666]">{p.brand}</div>
                  {p.nameRu}
                </td>
                <td className="p-3 text-xs uppercase">{p.status}</td>
                <td className="p-3">{p._count.images}</td>
                <td className="p-3">{formatKzt(p.basePriceKzt)}</td>
                <td className="p-3 text-right">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="text-xs underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 ? (
          <p className="p-8 text-center text-sm text-[#666]">No products yet</p>
        ) : null}
      </div>
    </div>
  );
}
