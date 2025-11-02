import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type Variant = "primary" | "outline" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  isLoading?: boolean;
  children?: ReactNode;
};

const base =
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition";
const variants: Record<Variant, string> = {
  primary: "bg-[#03AC0E] text-white hover:opacity-90",
  outline: "border border-gray-200 bg-white text-gray-800 hover:bg-gray-50",
  ghost: "text-gray-700 hover:bg-gray-100",
};

export default function Button({
  variant = "primary",
  isLoading = false,
  className,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={clsx(
        base,
        variants[variant],
        isLoading && "opacity-60 pointer-events-none",
        className
      )}
      disabled={isLoading || disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
