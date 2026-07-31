import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Danial CN — премиум-багаж",
    short_name: "Danial CN",
    description:
      "Danial CN — премиум-багаж. Доставка по Казахстану. Заказ в чате. Оплата через Каспи.",
    start_url: "/ru",
    display: "standalone",
    background_color: "#f5f4f1",
    theme_color: "#0b0b0b",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
