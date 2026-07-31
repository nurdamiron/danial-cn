import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { KaspiBadge } from "@/components/ui/KaspiBadge";

export async function TrustBar() {
  const t = await getTranslations("home");
  const list = [
    { key: "kaspi", title: t("trustKaspi"), desc: t("trustKaspiDesc") },
    { key: "chat", title: t("trustChat"), desc: t("trustChatDesc") },
    { key: "delivery", title: t("trustDelivery"), desc: t("trustDeliveryDesc") },
    { key: "quality", title: t("trustQuality"), desc: t("trustQualityDesc") },
  ];

  return (
    <section className="border-b border-line bg-paper">
      <Container className="grid grid-cols-2 gap-px bg-line md:grid-cols-4">
        {list.map((item) => (
          <div
            key={item.key}
            className="bg-paper px-4 py-7 text-center sm:py-8"
          >
            {item.key === "kaspi" ? (
              <KaspiBadge className="mx-auto" />
            ) : (
              <p className="text-[11px] tracking-[0.18em] text-ink">
                {item.title}
              </p>
            )}
            <p className="mt-2 text-xs text-muted">{item.desc}</p>
          </div>
        ))}
      </Container>
    </section>
  );
}
