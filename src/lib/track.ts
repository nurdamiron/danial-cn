"use client";

import {
  MAX_SOURCE_LENGTH,
  VISIT_ID_KEY,
  type Device,
  type EventType,
} from "@/lib/events";

/**
 * Reports what the visitor did, without ever getting in their way.
 *
 * Every path out of here is silent. Analytics is the shop's convenience, not
 * the customer's, so a browser with storage switched off, a blocked request or
 * a failed send all end the same way: nothing recorded, nothing shown, the
 * shop still works.
 */

const PHONE_MAX = 640;
const TABLET_MAX = 1024;

function device(): Device {
  const width = window.innerWidth;
  if (width <= PHONE_MAX) return "phone";
  if (width <= TABLET_MAX) return "tablet";
  return "desktop";
}

/**
 * A random id kept for one visit.
 *
 * sessionStorage rather than a cookie on purpose: it dies with the tab, is
 * never sent to the server on its own, and cannot be used to recognise the
 * same person on their next visit — so the shop learns how a visit went
 * without keeping anything to identify who made it.
 */
function visitId(): string | null {
  try {
    const existing = sessionStorage.getItem(VISIT_ID_KEY);
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    sessionStorage.setItem(VISIT_ID_KEY, fresh);
    return fresh;
  } catch {
    // Private windows and locked-down browsers refuse storage outright.
    return null;
  }
}

/**
 * Where the visit came from — the host only.
 *
 * A full referrer carries the search query that led here and whatever else the
 * previous site put in its URL. The host answers the question the shop
 * actually has ("Instagram or search?") and carries none of that.
 */
function source(): string {
  try {
    if (!document.referrer) return "";
    const url = new URL(document.referrer);
    if (url.host === window.location.host) return "";
    return url.host.slice(0, MAX_SOURCE_LENGTH);
  } catch {
    return "";
  }
}

export function track(type: EventType, options: { slug?: string } = {}): void {
  if (typeof window === "undefined") return;

  // The panel is the shop looking at itself; counting it would put the
  // owner's own day into the customer funnel.
  if (window.location.pathname.startsWith("/admin")) return;

  const id = visitId();
  if (!id) return;

  const body = JSON.stringify({
    type,
    visitId: id,
    locale: document.documentElement.lang === "kk" ? "kk" : "ru",
    slug: options.slug,
    source: source(),
    device: device(),
  });

  try {
    // sendBeacon survives the page being closed or handed to WhatsApp, which
    // is exactly when the last and most valuable event fires.
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/events",
        new Blob([body], { type: "application/json" }),
      );
      return;
    }
    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Nothing to do and nothing worth telling the customer about.
  }
}
