import { Link, type LinkProps } from "react-router-dom";
import type { ReactNode } from "react";
import clsx from "clsx";

type Variant = "primary" | "outline" | "ghost";

type LinkButtonProps = LinkProps & {
  variant?: Variant;
  className?: string;
  children?: ReactNode;
};

const base =
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition";
const variants: Record<Variant, string> = {
  primary: "bg-[#03AC0E] text-white hover:opacity-90",
  outline: "border border-gray-200 bg-white text-gray-800 hover:bg-gray-50",
  ghost: "text-gray-700 hover:bg-gray-100",
};

export default function LinkButton({
  variant = "primary",
  className,
  children,
  ...rest
}: LinkButtonProps) {
  return (
    <Link className={clsx(base, variants[variant], className)} {...rest}>
      {children}
    </Link>
  );
}
