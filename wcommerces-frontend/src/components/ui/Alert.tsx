import type { PropsWithChildren } from "react";

export default function Alert({ children }: PropsWithChildren) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
      {children}
    </div>
  );
}
