// src/components/ui/TransactionCard.tsx
import clsx from "clsx";

type Props = {
  onClick?: () => void;
  createdAt: string | Date;
  total: number;
  className?: string;
  children?: React.ReactNode;
};

function formatIDR(n: number) {
  try {
    return new Intl.NumberFormat("id-ID").format(n);
  } catch {
    return String(n);
  }
}

export default function TransactionCard({
  onClick,
  createdAt,
  total,
  className,
  children,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "group w-full text-left bg-transparent p-0 m-0 border-0 rounded-none",
        "shadow-none focus:outline-none focus:ring-0 hover:bg-transparent"
      )}
    >
      <div
        className={clsx(
          "relative bg-white rounded-2xl p-4 sm:p-5",
          "ring-1 ring-[#03AC0E]/35",
          "transition-shadow group-hover:shadow-[0_4px_20px_rgba(3,172,14,0.12)]",
          "group-focus-visible:shadow-[0_0_0_6px_rgba(3,172,14,0.10)]",
          className
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            {children}
            <div className="text-xs text-gray-500">
              {new Date(createdAt).toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Grand Total</div>
            <div className="font-semibold text-[#03AC0E]">
              Rp{formatIDR(total)}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
