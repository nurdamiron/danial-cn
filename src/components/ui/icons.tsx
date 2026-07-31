type IconProps = { className?: string };

/** Minimal original glyphs — not brand logo files — kept to the site's thin hairline style. */

export function InstagramIcon({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WhatsAppIcon({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3a9 9 0 0 0-7.75 13.6L3 21l4.6-1.2A9 9 0 1 0 12 3Z" />
      <path
        d="M8.6 9.6c-.3 1 .1 2.2 1.6 3.7 1.5 1.5 2.8 1.9 3.8 1.6.6-.2 1-.6 1.1-1.1l.1-.5-1.6-.8c-.2-.1-.4 0-.5.2l-.4.5c-.6-.2-1.1-.6-1.6-1.1-.5-.5-.9-1-1.1-1.6l.5-.4c.2-.1.3-.3.2-.5l-.8-1.6-.5.1c-.5.1-1 .5-1.2 1.1Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export function CartIcon({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
      aria-hidden="true"
    >
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
