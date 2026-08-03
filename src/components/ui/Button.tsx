import { type ButtonHTMLAttributes } from "react";

/**
 * One button shape for the whole site — pill, ink-first.
 * Colours live in globals.css (.btn-*) so a link and a button that read as
 * the same control are guaranteed to look identical.
 */
export type ButtonVariant =
  | "primary" // ink fill — the main action on light surfaces
  | "secondary" // paper fill — the main action on ink surfaces
  | "outline" // hairline — secondary action on light surfaces
  | "outlineInverse" // hairline — secondary action on ink surfaces
  | "ghost";

export type ButtonSize = "sm" | "md" | "lg";

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[0.8125rem]",
  md: "h-12 px-6 text-sm",
  lg: "h-[3.25rem] px-8 text-[0.9375rem]",
};

const variants: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  outline: "btn-outline",
  outlineInverse: "btn-outline-inverse",
  ghost: "btn-ghost",
};

/** For links that should read as buttons — avoids nesting <button> in <a>. */
export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className = "",
) {
  return `btn ${variants[variant]} ${sizes[size]} ${className}`;
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: Props) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}
