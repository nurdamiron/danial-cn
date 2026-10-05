import type { z } from "zod";

/**
 * One readable sentence for the first thing wrong with a request.
 *
 * Schemas that spell out their own Russian message keep it. The rest used to
 * reach the screen as zod's English defaults, or — for products — as a whole
 * error object the form could not print, which it replaced with "для
 * публикации нужны фото" whatever the real problem was: a zero price, an empty
 * name. This names the field and says what is wrong with it.
 */
const FIELD_LABELS: Record<string, string> = {
  slug: "Адрес страницы",
  brand: "Бренд",
  nameRu: "Название",
  nameKk: "Название (каз.)",
  descriptionRu: "Описание",
  materialRu: "Материал",
  category: "Категория",
  subcategory: "Подкатегория",
  basePriceKzt: "Цена",
  priceKzt: "Цена",
  stock: "Остаток",
  heightCm: "Высота",
  widthCm: "Ширина",
  depthCm: "Глубина",
  volumeL: "Объём",
  weightKg: "Вес",
  wheels: "Колёса",
  lockType: "Замок",
  status: "Статус",
  sortOrder: "Порядок",
  colorKey: "Цвет",
  colorLabelRu: "Название цвета",
  colorLabelKk: "Название цвета (каз.)",
  sizeLabelRu: "Название размера",
  sizeLabelKk: "Название размера (каз.)",
  sizeKey: "Размер",
  sku: "Артикул",
  email: "Email",
  password: "Пароль",
  name: "Имя",
  phone: "Телефон",
  city: "Город",
  comment: "Комментарий",
  whatsappE164: "Номер WhatsApp",
  rows: "Строки",
};

const CYRILLIC = /[а-яё]/i;

export function firstIssueMessage(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Ошибка валидации";
  if (CYRILLIC.test(issue.message)) return issue.message;

  const key = [...issue.path].reverse().find((p) => typeof p === "string");
  const label =
    (typeof key === "string" && FIELD_LABELS[key]) ||
    (typeof key === "string" ? key : "Поле");

  switch (issue.code) {
    case "too_small":
      return issue.origin === "string" && issue.minimum === 1
        ? `${label}: заполните поле`
        : issue.origin === "number"
          ? `${label}: должно быть больше ${issue.inclusive ? "или равно " : ""}${issue.minimum}`
          : `${label}: слишком короткое значение`;
    case "too_big":
      return `${label}: слишком большое значение`;
    case "invalid_type":
      return `${label}: ${issue.input === undefined ? "заполните поле" : "неверное значение"}`;
    case "invalid_value":
      return `${label}: недопустимое значение`;
    case "invalid_format":
      return `${label}: неверный формат`;
    default:
      return `${label}: проверьте значение`;
  }
}
