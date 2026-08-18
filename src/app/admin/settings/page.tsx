import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getCurrentUser } from "@/lib/auth";
import { hasDatabase } from "@/lib/db-config";

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "ADMIN") redirect("/admin/account");
  if (!hasDatabase()) redirect("/admin");

  const { prisma } = await import("@/lib/prisma");
  const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-light">Настройки сайта</h1>
        <p className="mt-1 text-sm text-muted">
          WhatsApp, тексты доставки, Kaspi, дисклеймер (RU/KK)
        </p>
      </div>
      <SettingsForm
        initial={{
          whatsappE164: settings.whatsappE164,
          deliveryCargoRu: settings.deliveryCargoRu,
          deliveryCargoKk: settings.deliveryCargoKk,
          deliveryAviaRu: settings.deliveryAviaRu,
          deliveryAviaKk: settings.deliveryAviaKk,
          deliveryExpressRu: settings.deliveryExpressRu,
          deliveryExpressKk: settings.deliveryExpressKk,
          kaspiNoteRu: settings.kaspiNoteRu,
          kaspiNoteKk: settings.kaspiNoteKk,
          disclaimerRu: settings.disclaimerRu,
          disclaimerKk: settings.disclaimerKk,
        }}
      />
    </div>
  );
}
