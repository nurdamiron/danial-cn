"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  NewProductPhotos,
  type PendingPhoto,
} from "@/components/admin/NewProductPhotos";
import { uploadPhotos } from "@/lib/upload-photos";

type ProductInput = {
  id?: string;
  /** Absent on create — the server derives it from brand and name. */
  slug?: string;
  brand: string;
  nameRu: string;
  nameKk: string;
  descriptionRu: string;
  descriptionKk: string;
  materialRu: string;
  materialKk: string;
  category: string;
  basePriceKzt: number;
  heightCm?: number | null;
  widthCm?: number | null;
  depthCm?: number | null;
  volumeL?: number | null;
  weightKg?: number | null;
  wheels?: string | null;
  lockType?: string | null;
  status: string;
  featured: boolean;
};

const empty: ProductInput = {
  brand: "",
  nameRu: "",
  nameKk: "",
  descriptionRu: "",
  descriptionKk: "",
  materialRu: "",
  materialKk: "",
  category: "cabin",
  basePriceKzt: 0,
  status: "draft",
  featured: false,
};

/** A titled group, so nineteen inputs stop reading as one list. */
function Section({
  title,
  hint,
  children,
  cols = 2,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  cols?: 1 | 2 | 3;
}) {
  return (
    <section className="border-t border-line pt-5 first:border-0 first:pt-0">
      <h3 className="t-label text-muted">{title}</h3>
      {hint ? <p className="t-micro mt-1 text-muted">{hint}</p> : null}
      <div
        className={`mt-3 grid gap-4 ${
          cols === 1
            ? ""
            : cols === 3
              ? "sm:grid-cols-2 lg:grid-cols-3"
              : "sm:grid-cols-2"
        }`}
      >
        {children}
      </div>
    </section>
  );
}

export function ProductForm({ product }: { product?: ProductInput }) {
  // A saved product keeps every field: its URL is public and its Kazakh copy
  // is worth writing properly. Creating one asks for the short version.
  const isEdit = Boolean(product?.id);
  const router = useRouter();
  const [form, setForm] = useState<ProductInput>(product ?? empty);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  /** Chosen before the product exists; uploaded the moment it does. */
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [uploaded, setUploaded] = useState<{
    done: number;
    total: number;
  } | null>(null);

  function set<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(
        isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            basePriceKzt: Number(form.basePriceKzt),
            heightCm: form.heightCm ? Number(form.heightCm) : null,
            widthCm: form.widthCm ? Number(form.widthCm) : null,
            depthCm: form.depthCm ? Number(form.depthCm) : null,
            volumeL: form.volumeL ? Number(form.volumeL) : null,
            weightKg: form.weightKg ? Number(form.weightKg) : null,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Ошибка сохранения (для публикации нужны фото)",
        );
        return;
      }
      if (!isEdit) {
        const id = data.product.id as string;
        // The product is saved by now, so a failed upload must not read as a
        // failed save: it hands over to the edit screen, where the photos can
        // be retried against a product that already exists.
        const failure = photos.length ? await sendPhotos(id) : null;
        if (failure) {
          router.push(
            `/admin/products/${id}?photos=${encodeURIComponent(failure)}`,
          );
          return;
        }
        router.push(`/admin/products/${id}`);
      } else {
        setError("");
        setForm((f) => ({ ...f, ...data.product }));
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  /** Returns null when every photo landed, or what went wrong. */
  async function sendPhotos(productId: string): Promise<string | null> {
    const outcome = await uploadPhotos({
      productId,
      files: photos.map((p) => p.file),
      onProgress: (done, total) => setUploaded({ done, total }),
    });
    if (outcome.status === "done") return null;
    // Partial success is worth saying plainly: the rest are already filed.
    return outcome.status === "partial"
      ? `Загружено фото: ${outcome.added}. ${outcome.error}`
      : outcome.error;
  }

  const field = (
    label: string,
    key: keyof ProductInput,
    opts?: { type?: string; textarea?: boolean },
  ) => (
    <label className="block">
      {label}
      {opts?.textarea ? (
        <textarea
          className="field"
          rows={3}
          value={String(form[key] ?? "")}
          onChange={(e) => set(key, e.target.value as never)}
        />
      ) : (
        <input
          type={opts?.type ?? "text"}
          className="field"
          value={String(form[key] ?? "")}
          onChange={(e) =>
            set(
              key,
              (opts?.type === "number"
                ? Number(e.target.value)
                : e.target.value) as never,
            )
          }
        />
      )}
    </label>
  );

  return (
    <form onSubmit={onSubmit} className="card grid gap-6 p-5 sm:p-7">
      <Section title="Товар">
        {field("Бренд / линия", "brand")}
        {field("Название", "nameRu")}
        <div className="sm:col-span-2">
          {field("Описание", "descriptionRu", { textarea: true })}
        </div>
        {field("Материал", "materialRu")}
        <label className="block">
          Категория
          <select
            className="field"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          >
            <option value="cabin">Ручная кладь</option>
            <option value="checkin">Багаж</option>
            <option value="set">Комплект</option>
            <option value="bag">Сумка</option>
          </select>
        </label>
        {field("Цена ₸", "basePriceKzt", { type: "number" })}
      </Section>

      <Section
        title="Характеристики"
        hint="Показываются на странице товара. Можно оставить пустыми."
        cols={3}
      >
        {field("Высота см", "heightCm", { type: "number" })}
        {field("Ширина см", "widthCm", { type: "number" })}
        {field("Глубина см", "depthCm", { type: "number" })}
        {field("Объём л", "volumeL", { type: "number" })}
        {field("Вес кг", "weightKg", { type: "number" })}
        {field("Колёса", "wheels")}
        {field("Замок", "lockType")}
      </Section>

      <Section title="Публикация">
        <label className="block">
          Статус
          <select
            className="field"
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
          >
            <option value="draft">Черновик — не виден покупателям</option>
            <option value="active">На сайте</option>
          </select>
        </label>
        <label className="flex items-end gap-2 pb-2.5 text-[0.8125rem]">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => set("featured", e.target.checked)}
          />
          Показывать на главной
        </label>
      </Section>

      {!isEdit ? (
        <Section title="Фото" cols={1}>
          <NewProductPhotos
            photos={photos}
            onChange={setPhotos}
            disabled={saving}
          />
        </Section>
      ) : null}

      {/*
        The URL and the Kazakh copy. Both are filled in without being asked
        for — the slug from the name, the translation from the Russian where
        nobody wrote one — so this stays shut unless something needs saying.
      */}
      {isEdit ? (
        <details className="border-t border-line pt-5">
          <summary className="t-label cursor-pointer text-muted">
            Адрес и казахский текст
          </summary>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              Адрес страницы
              <input
                className="field"
                value={form.slug ?? ""}
                onChange={(e) => set("slug", e.target.value)}
                required
              />
              <span className="t-micro mt-1 block text-muted">
                Ссылка уже опубликована —менять стоит только при опечатке.
              </span>
            </label>
            {field("Название KK", "nameKk")}
            {field("Материал KK", "materialKk")}
            <div className="sm:col-span-2">
              {field("Описание KK", "descriptionKk", { textarea: true })}
            </div>
            <p className="t-micro text-muted sm:col-span-2">
              Пусто — покажем русский. Уже переведённый текст сам не меняется,
              когда правите русский.
            </p>
          </div>
        </details>
      ) : (
        <p className="t-micro text-muted">
          Адрес страницы и казахский текст заполнятся сами.
        </p>
      )}

      {error ? <p className="alert-error">{error}</p> : null}

      <div className="border-t border-line pt-5">
        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary h-12 w-full px-8 text-sm sm:w-auto"
        >
          {saving
            ? uploaded && uploaded.total > 0
              ? `Загружаем фото ${uploaded.done + 1} из ${uploaded.total}…`
              : photos.length
                ? "Сохраняем…"
                : "Сохранение…"
            : "Сохранить"}
        </button>
      </div>
    </form>
  );
}
