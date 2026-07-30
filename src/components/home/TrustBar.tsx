import { Container } from "@/components/ui/Container";

const items = [
  { title: "Kaspi", desc: "Оплата после подтверждения" },
  { title: "WhatsApp", desc: "Заказ в один клик" },
  { title: "KZ delivery", desc: "Карго · Авиа · Экспресс" },
  { title: "Premium build", desc: "Материалы и сборка" },
];

const itemsKk = [
  { title: "Kaspi", desc: "Растаудан кейін төлем" },
  { title: "WhatsApp", desc: "Бір кликпен тапсырыс" },
  { title: "KZ жеткізу", desc: "Карго · Әуе · Экспресс" },
  { title: "Premium", desc: "Материал және құрастыру" },
];

export function TrustBar({ locale }: { locale: string }) {
  const list = locale === "kk" ? itemsKk : items;
  return (
    <section className="border-b border-line bg-paper">
      <Container className="grid grid-cols-2 gap-px bg-line md:grid-cols-4">
        {list.map((item) => (
          <div
            key={item.title}
            className="bg-paper px-4 py-7 text-center sm:py-8"
          >
            <p className="text-[11px] tracking-[0.22em] text-ink uppercase">
              {item.title}
            </p>
            <p className="mt-2 text-xs text-muted">{item.desc}</p>
          </div>
        ))}
      </Container>
    </section>
  );
}
