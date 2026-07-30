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
    "inline-flex items-center justify-center tracking-wide transition disabled:opacity-40 disabled:cursor-not-allowed";
  const sizes = {
    sm: "h-9 px-4 text-xs",
    md: "h-11 px-6 text-sm",
    lg: "h-12 px-8 text-sm",
  };
  const variants = {
    primary: "bg-[#111] text-white hover:bg-black",
    outline: "border border-[#111] text-[#111] hover:bg-[#111] hover:text-white",
    ghost: "text-[#111] hover:bg-black/5",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
