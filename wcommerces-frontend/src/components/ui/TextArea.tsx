import type { TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export default function TextArea({
  label,
  hint,
  error,
  className = "",
  ...rest
}: Props) {
  return (
    <label className="block space-y-1.5">
      {label && (
        <span className="text-sm font-medium text-gray-800">{label}</span>
      )}
      <textarea
        className={`w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#03AC0E]/40 ${className}`}
        {...rest}
      />
      {hint && !error && <span className="text-xs text-gray-500">{hint}</span>}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}
