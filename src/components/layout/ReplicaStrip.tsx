import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";

export async function ReplicaStrip() {
  const t = await getTranslations("replica");
  return (
    <div className="border-b border-line bg-white">
      <Container className="py-2">
        <p className="text-center text-[11px] tracking-wide text-muted sm:text-xs">
          {t("disclaimer")}
        </p>
      </Container>
    </div>
  );
}
