import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";

export async function ReplicaStrip() {
  const t = await getTranslations("replica");
  return (
    <div className="border-b border-line/80 bg-[#0a0a0a] text-white">
      <Container className="py-2.5">
        <p className="text-center text-[10px] tracking-[0.12em] text-white/80 sm:text-[11px]">
          {t("disclaimer")}
        </p>
      </Container>
    </div>
  );
}
