type IconProps = { className?: string };

/**
 * One hairline icon set — original glyphs, not brand logo files.
 * Same 24px grid, same 1.5 stroke, so nothing looks borrowed from elsewhere.
 */

const S = 1.5;

function Svg({
  className = "h-[18px] w-[18px]",
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={S}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** The house mark: a shell in section, ribs and all. */
export function ShellMark({ className = "h-5 w-5" }: IconProps) {
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
      <rect x="4" y="6.5" width="16" height="14" rx="2.5" />
      <path d="M9 6.5V4.8A1.8 1.8 0 0 1 10.8 3h2.4A1.8 1.8 0 0 1 15 4.8v1.7" />
      <path d="M9.5 10v7.5M12 10v7.5M14.5 10v7.5" opacity="0.55" />
    </svg>
  );
}

export function InstagramIcon({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="0.9" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function WhatsAppIcon({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 3a9 9 0 0 0-7.75 13.6L3 21l4.6-1.2A9 9 0 1 0 12 3Z" />
      <path
        d="M8.6 9.6c-.3 1 .1 2.2 1.6 3.7 1.5 1.5 2.8 1.9 3.8 1.6.6-.2 1-.6 1.1-1.1l.1-.5-1.6-.8c-.2-.1-.4 0-.5.2l-.4.5c-.6-.2-1.1-.6-1.6-1.1-.5-.5-.9-1-1.1-1.6l.5-.4c.2-.1.3-.3.2-.5l-.8-1.6-.5.1c-.5.1-1 .5-1.2 1.1Z"
        fill="currentColor"
        stroke="none"
      />
    </Svg>
  );
}

export function CartIcon({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </Svg>
  );
}

export function UserIcon({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="9" r="3.5" />
      <path d="M5 19.5c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5" />
    </Svg>
  );
}

export function HomeIcon({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
    </Svg>
  );
}

export function GridIcon({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </Svg>
  );
}

export function HeartIcon({
  className = "h-[18px] w-[18px]",
  filled = false,
}: IconProps & { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={S}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 20s-7-4.4-7-9.2A4 4 0 0 1 12 8a4 4 0 0 1 7 2.8C19 15.6 12 20 12 20Z" />
    </svg>
  );
}

export function CheckIcon({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </Svg>
  );
}

export function CloseIcon({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m6 6 12 12M18 6 6 18" />
    </Svg>
  );
}

export function PlusIcon({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 5.5v13M5.5 12h13" />
    </Svg>
  );
}

export function MinusIcon({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5.5 12h13" />
    </Svg>
  );
}

export function TrashIcon({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 7h14M10 7V5.5A1.5 1.5 0 0 1 11.5 4h1A1.5 1.5 0 0 1 14 5.5V7" />
      <path d="M6.5 7 7.5 20h9L17.5 7" />
    </Svg>
  );
}

export function ArrowRightIcon({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4.5 12h14M13 6.5l5.5 5.5L13 17.5" />
    </Svg>
  );
}

export function ChevronDownIcon({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />
    </Svg>
  );
}

export function SlidersIcon({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 8h10M18 8h2M4 16h4M12 16h8" />
      <circle cx="16" cy="8" r="2" />
      <circle cx="10" cy="16" r="2" />
    </Svg>
  );
}

export function TruckIcon({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3 16.5V7a1 1 0 0 1 1-1h9v10.5" />
      <path d="M13 9.5h3.8a1 1 0 0 1 .8.4l2.2 3a1 1 0 0 1 .2.6v3H13" />
      <circle cx="7.5" cy="17.5" r="1.8" />
      <circle cx="16.5" cy="17.5" r="1.8" />
    </Svg>
  );
}

export function ChatIcon({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M20 12.5c0 3.6-3.6 6.5-8 6.5-1 0-2-.15-2.9-.43L4 20l1.35-3.6C4.5 15.3 4 13.95 4 12.5 4 8.9 7.6 6 12 6s8 2.9 8 6.5Z" />
    </Svg>
  );
}

export function ShieldIcon({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 3.5 19 6v6c0 4-3 7-7 8.5C8 19 5 16 5 12V6l7-2.5Z" />
      <path d="m9.2 12.2 2 2 3.6-3.8" />
    </Svg>
  );
}
