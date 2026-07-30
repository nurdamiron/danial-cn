import { type ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center tracking-[0.12em] uppercase transition disabled:opacity-40 disabled:cursor-not-allowed";
  const sizes = {
    sm: "h-9 px-4 text-[10px]",
    md: "h-12 px-7 text-[11px]",
    lg: "h-14 px-9 text-xs",
  };
  const variants = {
    primary: "bg-[#0a0a0a] text-white hover:bg-black",
    outline:
      "border border-[#0a0a0a] text-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white",
    ghost: "text-[#0a0a0a] hover:bg-black/5",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
