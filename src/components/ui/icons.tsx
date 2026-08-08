type IconProps = { className?: string };

/** Minimal original glyphs — not brand logo files — kept to the site's thin hairline style. */

function Glyph({
  className = "h-[18px] w-[18px]",
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="0.9" fill="currentColor" stroke="none" />
    </Glyph>
  );
}

export function WhatsAppIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M12 3a9 9 0 0 0-7.75 13.6L3 21l4.6-1.2A9 9 0 1 0 12 3Z" />
      <path
        d="M8.6 9.6c-.3 1 .1 2.2 1.6 3.7 1.5 1.5 2.8 1.9 3.8 1.6.6-.2 1-.6 1.1-1.1l.1-.5-1.6-.8c-.2-.1-.4 0-.5.2l-.4.5c-.6-.2-1.1-.6-1.6-1.1-.5-.5-.9-1-1.1-1.6l.5-.4c.2-.1.3-.3.2-.5l-.8-1.6-.5.1c-.5.1-1 .5-1.2 1.1Z"
        fill="currentColor"
        stroke="none"
      />
    </Glyph>
  );
}

export function CartIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </Glyph>
  );
}

export function CardIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" />
      <path d="M2.5 10h19" />
      <path d="M6 14.5h3.5" />
    </Glyph>
  );
}

export function TruckIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M2.5 7.5h11v9h-11z" />
      <path d="M13.5 11h4l3 3v2.5h-7z" />
      <circle cx="7" cy="18" r="1.8" />
      <circle cx="17" cy="18" r="1.8" />
    </Glyph>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M12 3 4.5 6v6c0 4.2 3 7.4 7.5 9 4.5-1.6 7.5-4.8 7.5-9V6L12 3Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </Glyph>
  );
}

export function ChatIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M20.5 12c0 4-3.8 7-8.5 7a10 10 0 0 1-2.6-.34L4.5 20l1.1-3.2A6.7 6.7 0 0 1 3.5 12c0-4 3.8-7 8.5-7s8.5 3 8.5 7Z" />
    </Glyph>
  );
}

export function RulerIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <rect x="2.5" y="8.5" width="19" height="7" rx="1.5" />
      <path d="M7 8.5v3M11 8.5v4M15 8.5v3M19 8.5v4" />
    </Glyph>
  );
}

export function ArrowIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </Glyph>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </Glyph>
  );
}
