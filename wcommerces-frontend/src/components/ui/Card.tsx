import type { PropsWithChildren } from "react";

export default function Card({ children }: PropsWithChildren) {
  return (
    <div className="bg-white rounded-2xl border-2 border-[#03AC0E]/60 shadow-md">
      <div className="p-5">{children}</div>
    </div>
  );
}
