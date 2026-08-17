/**
 * Dates for the admin panel.
 *
 * The locale and the zone are pinned rather than left to the runtime: these
 * strings are rendered on the server and again in the browser, and a server in
 * UTC formatting against a browser in Almaty is a hydration mismatch.
 */
const FORMATTER = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Almaty",
});

export function formatMoment(
  value: string | Date | null | undefined,
): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return FORMATTER.format(date);
}
