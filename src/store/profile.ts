export const PROFILE_STORAGE_KEY = "danial_cn_profile_v1";

export type LocalProfile = {
  name: string;
  phone: string;
  city: string;
};

const empty: LocalProfile = { name: "", phone: "", city: "" };

export function loadProfile(): LocalProfile {
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as LocalProfile;
    return {
      name: parsed.name ?? "",
      phone: parsed.phone ?? "",
      city: parsed.city ?? "",
    };
  } catch {
    return empty;
  }
}

export function saveProfile(profile: LocalProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event("danial-profile-updated"));
}

export function profileInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "DC";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
