const MAP: Record<string, string> = {
  black: "#111111",
  silver: "#c0c0c0",
  grey: "#8a8a8a",
  gray: "#8a8a8a",
  gold: "#c5a572",
  navy: "#1b2a4a",
  sage: "#8b9a7d",
  white: "#f5f5f5",
  blue: "#2c4a6e",
  green: "#3d5c45",
  red: "#8b2e2e",
  bronze: "#8c6a4a",
  titanium: "#a8a9ad",
};

export function defaultColorHex(colorKey: string): string {
  return MAP[colorKey.trim().toLowerCase()] ?? "#888888";
}
