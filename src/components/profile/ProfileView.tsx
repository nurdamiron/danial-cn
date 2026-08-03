"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import {
  loadProfile,
  profileInitials,
  saveProfile,
  type LocalProfile,
} from "@/store/profile";
import { loadOrders } from "@/store/orders";
import { loadFavorites } from "@/store/favorites";
import { KaspiBadge } from "@/components/ui/KaspiBadge";
import { buttonClass } from "@/components/ui/Button";

type SessionUser = {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
};

function RowIcon({
  children,
  tone = "stone",
}: {
  children: React.ReactNode;
  tone?: "stone" | "ink" | "line";
}) {
  const bg =
    tone === "ink"
      ? "bg-ink text-paper"
      : tone === "line"
        ? "bg-line text-ink"
        : "bg-stone text-ink";
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${bg}`}
    >
      {children}
    </span>
  );
}

export function ProfileView() {
  const t = useTranslations("profile");
  const tAuth = useTranslations("auth");
  const tLang = useTranslations("lang");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);
  const [profile, setProfile] = useState<LocalProfile>({
    name: "",
    phone: "",
    city: "",
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<LocalProfile>(profile);
  const [orderCount, setOrderCount] = useState(0);
  const [favCount, setFavCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pwd, setPwd] = useState({ current: "", next: "" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (cancelled) return;
        setUser(data.user ?? null);
        if (data.user) {
          const merged: LocalProfile = {
            name: data.user.name || loadProfile().name,
            phone: data.user.phone || loadProfile().phone,
            city: loadProfile().city,
          };
          setProfile(merged);
          setDraft(merged);
          saveProfile(merged);
        } else {
          const p = loadProfile();
          setProfile(p);
          setDraft(p);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          const p = loadProfile();
          setProfile(p);
          setDraft(p);
        }
      }
    })();
    setOrderCount(loadOrders().length);
    setFavCount(loadFavorites().length);
    const sync = () => {
      setOrderCount(loadOrders().length);
      setFavCount(loadFavorites().length);
    };
    window.addEventListener("danial-orders-updated", sync);
    window.addEventListener("danial-favorites-updated", sync);
    return () => {
      cancelled = true;
      window.removeEventListener("danial-orders-updated", sync);
      window.removeEventListener("danial-favorites-updated", sync);
    };
  }, []);

  async function saveEdit() {
    setSaving(true);
    setError("");
    try {
      // Signed in: the server decides first. Persisting locally before it
      // answers would show a rejected edit as saved until the next reload.
      if (user) {
        const body: Record<string, string> = {
          name: draft.name,
          phone: draft.phone,
        };
        if (pwd.next) {
          body.password = pwd.next;
          body.currentPassword = pwd.current;
        }
        const res = await fetch("/api/auth/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? tAuth("error"));
          return;
        }
        setUser(data.user);
        setPwd({ current: "", next: "" });
      }

      // City lives only on this device — the server has no field for it.
      saveProfile(draft);
      setProfile(draft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.refresh();
  }

  function switchLocale(next: "ru" | "kk") {
    router.replace(pathname, { locale: next });
  }

  if (user === undefined) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-52 rounded-lg" />
        <div className="skeleton h-16 rounded-lg" />
        <div className="skeleton h-16 rounded-lg" />
      </div>
    );
  }

  /** Guest cabinet gate — login card, then the rows that work without an account */
  if (!user) {
    return (
      <div className="space-y-8">
        <section className="on-dark overflow-hidden rounded-lg bg-ink text-paper">
          <div className="px-6 pt-10 pb-9 text-center">
            <span className="t-display mx-auto flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-paper text-xl text-ink">
              DC
            </span>
            <h1 className="t-display t-h3 mt-5">{t("cabinet")}</h1>
            <p className="mx-auto mt-2.5 max-w-xs text-sm leading-relaxed text-paper/60">
              {t("loginHint")}
            </p>
            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
              <Link href="/login" className={buttonClass("secondary", "md")}>
                {tAuth("loginBtn")}
              </Link>
              <Link
                href="/register"
                className={buttonClass("outlineInverse", "md")}
              >
                {tAuth("registerBtn")}
              </Link>
            </div>
          </div>
          <div className="flute-edge-dark" aria-hidden="true" />
        </section>

        <section>
          <h2 className="t-label mb-3 px-1 text-muted">{t("settings")}</h2>
          <div className="space-y-2">
            <SettingsRow
              href="/orders"
              icon={
                <RowIcon tone="ink">
                  <BagIcon />
                </RowIcon>
              }
              title={t("orders")}
              subtitle={t("ordersHint", { n: orderCount })}
            />
            <SettingsRow
              href="/favorites"
              icon={
                <RowIcon>
                  <HeartIcon />
                </RowIcon>
              }
              title={t("favorites")}
              subtitle={t("favoritesHint", { n: favCount })}
            />
            <div className="card flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <RowIcon>
                  <GlobeIcon />
                </RowIcon>
                <span className="text-sm">{tLang("label")}</span>
              </div>
              <LangToggle
                locale={locale}
                onRu={() => switchLocale("ru")}
                onKk={() => switchLocale("kk")}
                ru={tLang("ruShort")}
                kk={tLang("kkShort")}
              />
            </div>
          </div>
        </section>
      </div>
    );
  }

  const displayName = user.name.trim() || profile.name.trim() || t("guest");
  const initials = profileInitials(displayName);

  return (
    <div className="space-y-8">
      <section className="on-dark overflow-hidden rounded-lg bg-ink text-paper">
        <div className="px-6 pt-10 pb-9 text-center">
          <span className="t-display mx-auto flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-paper text-xl text-ink">
            {initials}
          </span>
          <h1 className="t-display t-h3 mt-5">{displayName}</h1>
          <p className="mt-1.5 text-sm text-paper/60">{user.email}</p>
          {user.phone || profile.phone ? (
            <p className="t-data mt-1 text-paper/50">
              {user.phone || profile.phone}
            </p>
          ) : null}
          <p className="mt-3">
            <span className="tag tag-dark">
              {user.role === "ADMIN" ? "admin" : t("member")}
            </span>
          </p>
          <button
            type="button"
            onClick={() => {
              setDraft({
                name: user.name || profile.name,
                phone: user.phone || profile.phone,
                city: profile.city,
              });
              setEditing((v) => !v);
            }}
            className={buttonClass("outlineInverse", "sm", "mt-6")}
          >
            {editing ? t("cancel") : t("edit")}
          </button>
        </div>

        {editing ? (
          <div className="space-y-4 border-t border-white/10 bg-paper p-6 text-ink">
            <Field
              label={t("name")}
              value={draft.name}
              onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
            />
            <Field
              label={t("phone")}
              value={draft.phone}
              type="tel"
              onChange={(v) => setDraft((d) => ({ ...d, phone: v }))}
            />
            <Field
              label={t("city")}
              value={draft.city}
              onChange={(v) => setDraft((d) => ({ ...d, city: v }))}
            />
            <div className="space-y-4 border-t border-line pt-4">
              <p className="t-label text-muted">{tAuth("changePassword")}</p>
              <Field
                label={tAuth("currentPassword")}
                value={pwd.current}
                type="password"
                onChange={(v) => setPwd((p) => ({ ...p, current: v }))}
              />
              <Field
                label={tAuth("newPassword")}
                value={pwd.next}
                type="password"
                onChange={(v) => setPwd((p) => ({ ...p, next: v }))}
              />
            </div>
            {error ? (
              <p
                role="alert"
                className="alert-error"
              >
                {error}
              </p>
            ) : null}
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveEdit()}
              className="btn btn-primary h-12 w-full text-sm"
            >
              {saving ? "…" : t("save")}
            </button>
          </div>
        ) : (
          <div className="flute-edge-dark" aria-hidden="true" />
        )}
      </section>

      <section>
        <h2 className="t-label mb-3 px-1 text-muted">{t("settings")}</h2>
        <div className="space-y-2">
          <div className="card flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <RowIcon>
                <GlobeIcon />
              </RowIcon>
              <span className="text-sm">{tLang("label")}</span>
            </div>
            <LangToggle
              locale={locale}
              onRu={() => switchLocale("ru")}
              onKk={() => switchLocale("kk")}
              ru={tLang("ruShort")}
              kk={tLang("kkShort")}
            />
          </div>

          <SettingsRow
            href="/orders"
            icon={
              <RowIcon tone="ink">
                <BagIcon />
              </RowIcon>
            }
            title={t("orders")}
            subtitle={t("ordersHint", { n: orderCount })}
          />
          <SettingsRow
            href="/favorites"
            icon={
              <RowIcon>
                <HeartIcon />
              </RowIcon>
            }
            title={t("favorites")}
            subtitle={t("favoritesHint", { n: favCount })}
          />
          <SettingsRow
            href="/delivery"
            icon={
              <RowIcon>
                <TruckIcon />
              </RowIcon>
            }
            title={t("delivery")}
            subtitle={t("deliveryHint")}
            extra={<KaspiBadge height={22} />}
          />
          <SettingsRow
            href="/contacts"
            icon={
              <RowIcon>
                <ChatIcon />
              </RowIcon>
            }
            title={t("support")}
            subtitle={t("supportHint")}
          />

          <button
            type="button"
            onClick={() => void logout()}
            className="card flex w-full items-center justify-between px-4 py-3.5 text-left transition hover:border-line-strong"
          >
            <div className="flex items-center gap-3">
              <RowIcon tone="line">
                <LogoutIcon />
              </RowIcon>
              <span className="text-sm">{tAuth("logout")}</span>
            </div>
          </button>

          {user.role === "ADMIN" ? (
            <a
              href="/admin"
              className="card flex items-center justify-between px-4 py-3.5 transition hover:border-line-strong"
            >
              <div className="flex items-center gap-3">
                <RowIcon tone="ink">
                  <span className="text-[10px] tracking-wide">AD</span>
                </RowIcon>
                <span className="text-sm">{t("openAdmin")}</span>
              </div>
              <span className="text-muted">→</span>
            </a>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function SettingsRow({
  href,
  icon,
  title,
  subtitle,
  extra,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  extra?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="card group flex items-center justify-between gap-3 px-4 py-3.5 transition hover:border-line-strong"
    >
      <div className="flex min-w-0 items-center gap-3">
        {icon}
        <div className="min-w-0">
          <p className="text-sm">{title}</p>
          <p className="t-micro truncate text-muted">{subtitle}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        {extra}
        <span
          aria-hidden="true"
          className="text-muted transition-transform duration-300 group-hover:translate-x-0.5"
        >
          →
        </span>
      </div>
    </Link>
  );
}

function LangToggle({
  locale,
  onRu,
  onKk,
  ru,
  kk,
}: {
  locale: string;
  onRu: () => void;
  onKk: () => void;
  ru: string;
  kk: string;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-line p-0.5">
      <button
        type="button"
        onClick={onRu}
        aria-pressed={locale === "ru"}
        className={`t-label rounded-full px-2.5 py-1.5 transition ${
          locale === "ru" ? "bg-ink text-paper" : "text-muted hover:text-ink"
        }`}
      >
        {ru}
      </button>
      <button
        type="button"
        onClick={onKk}
        aria-pressed={locale === "kk"}
        className={`t-label rounded-full px-2.5 py-1.5 transition ${
          locale === "kk" ? "bg-ink text-paper" : "text-muted hover:text-ink"
        }`}
      >
        {kk}
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input
        type={type}
        className="field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.8 4 6 4 9s-1.5 6.2-4 9c-2.5-2.8-4-6-4-9s1.5-6.2 4-9Z" />
    </svg>
  );
}
function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
    </svg>
  );
}
function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M3 7h11v10H3V7Zm11 3h4l3 3v4h-7V10Z" />
      <circle cx="7.5" cy="18" r="1.5" />
      <circle cx="17.5" cy="18" r="1.5" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M5 6h14v10H8l-3 3V6Z" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M10 7V5a1 1 0 0 1 1-1h8v16h-8a1 1 0 0 1-1-1v-2" />
      <path d="M14 12H4m0 0 3-3m-3 3 3 3" />
    </svg>
  );
}
