/**
 * Sync env defaults. Prefer `getSiteConfig()` from `@/lib/settings`
 * in server components so admin SiteSettings apply.
 */
export const SITE = {
  whatsappE164:
    process.env.NEXT_PUBLIC_WHATSAPP_E164?.replace(/\D/g, "") || "77066316449",
  whatsappDisplay: "+7 706 631 6449",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM || "danial_cn",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  ),
  get whatsappUrl() {
    return `https://wa.me/${this.whatsappE164}`;
  },
  get instagramUrl() {
    return `https://instagram.com/${this.instagram}`;
  },
} as const;
