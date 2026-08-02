import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";

const settingsSchema = z.object({
  whatsappE164: z.string().min(10).max(20),
  deliveryCargoRu: z.string().min(1),
  deliveryCargoKk: z.string().min(1),
  deliveryAviaRu: z.string().min(1),
  deliveryAviaKk: z.string().min(1),
  deliveryExpressRu: z.string().min(1),
  deliveryExpressKk: z.string().min(1),
  kaspiNoteRu: z.string().min(1),
  kaspiNoteKk: z.string().min(1),
  disclaimerRu: z.string().min(1),
  disclaimerKk: z.string().min(1),
});

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  return NextResponse.json({ settings });
}

export async function PUT(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Неверный JSON" }, { status: 400 });
  }

  const parsed = settingsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ошибка валидации" },
      { status: 400 },
    );
  }

  const data = {
    ...parsed.data,
    whatsappE164: parsed.data.whatsappE164.replace(/\D/g, ""),
  };

  const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });

  return NextResponse.json({ settings });
}
