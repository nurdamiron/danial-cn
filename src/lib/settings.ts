import {
  getStaticSettings,
  isStaticCatalog,
} from "@/lib/static-catalog";

export type SiteConfig = {
  whatsappE164: string;
  whatsappDisplay: string;
  instagram: string;
  deliveryCargoRu: string;
  deliveryCargoKk: string;
  deliveryAviaRu: string;
  deliveryAviaKk: string;
  deliveryExpressRu: string;
  deliveryExpressKk: string;
  kaspiNoteRu: string;
  kaspiNoteKk: string;
  disclaimerRu: string;
  disclaimerKk: string;
};

function formatWaDisplay(e164: string): string {
  const d = e164.replace(/\D/g, "");
  // 77066316449 → +7 706 631 6449
  if (d.length === 11 && d.startsWith("7")) {
    return `+${d[0]} ${d.slice(1, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  }
  return d ? `+${d}` : "+7";
}

function fromEnv(): SiteConfig {
  const wa =
    process.env.NEXT_PUBLIC_WHATSAPP_E164?.replace(/\D/g, "") || "77066316449";
  return {
    whatsappE164: wa,
    whatsappDisplay: formatWaDisplay(wa),
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM || "danial_cn",
    deliveryCargoRu: "Карго — экономичная доставка по Казахстану",
    deliveryCargoKk: "Карго — Қазақстан бойынша үнемді жеткізу",
    deliveryAviaRu: "Авиа — быстрее карго",
    deliveryAviaKk: "Әуе — каргодан жылдамырақ",
    deliveryExpressRu: "Экспресс — самый быстрый вариант",
    deliveryExpressKk: "Экспресс — ең жылдам нұсқа",
    kaspiNoteRu: "Оплата после подтверждения заказа",
    kaspiNoteKk: "Тапсырыс расталғаннан кейін төлем",
    disclaimerRu:
      "Премиум-багаж. Уточняйте наличие и сроки у менеджера.",
    disclaimerKk:
      "Премиум багаж. Қолжетімділік пен мерзімді менеджерден сұраңыз.",
  };
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const env = fromEnv();

  if (isStaticCatalog()) {
    const s = getStaticSettings();
    if (!s) return env;
    const wa = (s.whatsappE164 || env.whatsappE164).replace(/\D/g, "");
    return {
      ...env,
      ...s,
      whatsappE164: wa,
      whatsappDisplay: formatWaDisplay(wa),
      instagram: env.instagram,
    };
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const row = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    if (!row) return env;
    const wa = (row.whatsappE164 || env.whatsappE164).replace(/\D/g, "");
    return {
      whatsappE164: wa,
      whatsappDisplay: formatWaDisplay(wa),
      instagram: env.instagram,
      deliveryCargoRu: row.deliveryCargoRu,
      deliveryCargoKk: row.deliveryCargoKk,
      deliveryAviaRu: row.deliveryAviaRu,
      deliveryAviaKk: row.deliveryAviaKk,
      deliveryExpressRu: row.deliveryExpressRu,
      deliveryExpressKk: row.deliveryExpressKk,
      kaspiNoteRu: row.kaspiNoteRu,
      kaspiNoteKk: row.kaspiNoteKk,
      disclaimerRu: row.disclaimerRu,
      disclaimerKk: row.disclaimerKk,
    };
  } catch {
    return env;
  }
}

export function siteUrls(config: SiteConfig) {
  return {
    whatsappUrl: `https://wa.me/${config.whatsappE164}`,
    instagramUrl: `https://instagram.com/${config.instagram}`,
  };
}
