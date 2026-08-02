import { describe, it, expect } from "vitest";
import ru from "../../../messages/ru.json";
import kk from "../../../messages/kk.json";

const required = [
  "nav.catalog",
  "nav.cart",
  "nav.delivery",
  "nav.profile",
  "tab.home",
  "tab.profile",
  "profile.title",
  "auth.loginTitle",
  "auth.registerTitle",
  "orders.title",
  "favorites.title",
  "cta.addToCart",
  "cta.sendWhatsApp",
  "delivery.cargo",
  "delivery.avia",
  "delivery.express",
  "payment.kaspiNote",
];

function get(obj: unknown, key: string) {
  const path = key.split(".");
  let cur: unknown = obj;
  for (const p of path) {
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

describe("i18n catalogs", () => {
  it("ru and kk contain required keys", () => {
    for (const key of required) {
      expect(get(ru, key), `ru missing ${key}`).toEqual(expect.any(String));
      expect(get(kk, key), `kk missing ${key}`).toEqual(expect.any(String));
    }
  });
});
