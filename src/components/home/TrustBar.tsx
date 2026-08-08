import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { BrandMark } from "@/components/ui/BrandMark";
import { CardIcon, ChatIcon, ShieldIcon, TruckIcon } from "@/components/ui/icons";

export async function TrustBar() {
  const t = await getTranslations("home");
  const list = [
    { key: "kaspi", Icon: CardIcon, title: t("trustKaspi"), desc: t("trustKaspiDesc") },
    { key: "chat", Icon: ChatIcon, title: t("trustChat"), desc: t("trustChatDesc") },
    { key: "delivery", Icon: TruckIcon, title: t("trustDelivery"), desc: t("trustDeliveryDesc") },
    { key: "quality", Icon: ShieldIcon, title: t("trustQuality"), desc: t("trustQualityDesc") },
  ];

  return (
    <section className="border-b border-line bg-paper">
      <Container className="grid grid-cols-2 gap-px bg-line md:grid-cols-4">
        {list.map(({ key, Icon, title, desc }) => (
          <div
            key={key}
            className="flex flex-col items-center gap-2 bg-paper px-4 py-7 text-center sm:py-8"
          >
            <Icon className="h-5 w-5 text-ink" />
            {key === "kaspi" ? (
              <BrandMark name="pay-kaspi" height={18} label={title} colored />
            ) : (
              <p className="text-[11px] tracking-[0.18em] text-ink">{title}</p>
            )}
            <p className="text-xs leading-snug text-muted">{desc}</p>
          </div>
        ))}
      </Container>
    </section>
  );
}
