import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { exportCatalogToStatic } from "@/lib/export-catalog";

/** Export DB → static JSON for Vercel deploy */
export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await exportCatalogToStatic();
    return NextResponse.json({
      ok: true,
      ...result,
      message:
        "Экспорт в static-products.json + static-settings.json. Закоммитьте и задеплойте на Vercel.",
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Export failed" },
      { status: 500 },
    );
  }
}
