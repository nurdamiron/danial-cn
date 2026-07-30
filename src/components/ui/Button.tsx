import { type ButtonHTMLAttributes } from "react";

/**
 * Color-safe button variants.
 * Do NOT override bg/text colors via className — Tailwind order won't win.
 * Use a dedicated variant instead.
 */
type Variant =
  | "primary" // black fill, white text — light surfaces
  | "secondary" // white fill, black text — dark surfaces
  | "outline" // black border/text — light surfaces
  | "outlineInverse" // white border/text — dark surfaces
  | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
};

const base =
  "inline-flex items-center justify-center font-medium transition disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b0b0b]";

const sizes = {
  sm: "h-9 px-4 text-xs",
  md: "h-12 px-7 text-sm",
  lg: "h-14 px-9 text-base",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-[#0b0b0b] text-[#ffffff] hover:bg-black focus-visible:outline-[#0b0b0b]",
  secondary:
    "bg-[#ffffff] text-[#0b0b0b] hover:bg-[#f5f4f1] focus-visible:outline-[#ffffff]",
  outline:
    "border border-[#0b0b0b] bg-transparent text-[#0b0b0b] hover:bg-[#0b0b0b] hover:text-[#ffffff]",
  outlineInverse:
    "border border-[#ffffff] bg-transparent text-[#ffffff] hover:bg-[#ffffff] hover:text-[#0b0b0b] focus-visible:outline-[#ffffff]",
  ghost: "bg-transparent text-[#0b0b0b] hover:bg-black/5",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: Props) {
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
