import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";
import { ADMIN_ORDER_INCLUDE } from "@/lib/admin-orders";
import { ORDER_STATUSES } from "@/lib/orders";

export async function GET(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = new URL(req.url).searchParams;
  const q = params.get("q")?.trim() ?? "";
  const status = params.get("status")?.trim() ?? "";

  const orders = await prisma.order.findMany({
    where: {
      ...(ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])
        ? { status }
        : {}),
      ...(q
        ? {
            OR: [
              { number: { contains: q } },
              { customerName: { contains: q } },
              { customerPhone: { contains: q } },
              { city: { contains: q } },
            ],
          }
        : {}),
    },
    ...ADMIN_ORDER_INCLUDE,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(
    { orders },
    { headers: { "Cache-Control": "no-store" } },
  );
}
