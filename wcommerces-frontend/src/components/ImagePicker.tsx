import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  files: File[];
  setFiles: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  onError?: (msg: string) => void;
};

type LocalPreview = { url: string; name: string; size: number; type: string };

export default function ImagePicker({
  files,
  setFiles,
  accept = "image/*",
  maxFiles = 20,
  maxSizeMB = 10,
  onError,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isOver, setIsOver] = useState(false);

  const previews = useMemo<LocalPreview[]>(
    () =>
      files.map((f) => ({
        url: URL.createObjectURL(f),
        name: f.name,
        size: f.size,
        type: f.type,
      })),
    [files]
  );

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  const emitError = (msg: string) => {
    if (onError) onError(msg);
  };

  const validateFiles = (incoming: File[]): File[] => {
    const currentCount = files.length;
    const allowed = Math.max(0, maxFiles - currentCount);
    const batch = incoming.slice(0, allowed);

    if (incoming.length > allowed) {
      emitError(`Maximum ${maxFiles} files allowed.`);
    }

    const sizeLimit = maxSizeMB * 1024 * 1024;
    const filtered = batch.filter((f) => {
      const ok = f.size <= sizeLimit;
      if (!ok) emitError(`"${f.name}" exceeds ${maxSizeMB} MB.`);
      return ok;
    });

    const exists = new Set(
      files.map((f) => `${f.name}|${f.size}|${f.lastModified}`)
    );
    const unique = filtered.filter((f) => {
      const key = `${f.name}|${f.size}|${f.lastModified}`;
      if (exists.has(key)) {
        emitError(`"${f.name}" is already added.`);
        return false;
      }
      exists.add(key);
      return true;
    });

    return unique;
  };

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files ?? []);
    if (incoming.length === 0) return;
    const valid = validateFiles(incoming);
    if (valid.length > 0) setFiles([...files, ...valid]);
    e.target.value = "";
  };

  const removeAt = (idx: number) => {
    const next = files.filter((_, i) => i !== idx);
    setFiles(next);
  };

  const openPicker = () => inputRef.current?.click();

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    const incoming = Array.from(e.dataTransfer.files ?? []);
    if (incoming.length === 0) return;
    const valid = validateFiles(incoming);
    if (valid.length > 0) setFiles([...files, ...valid]);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(true);
  };
  const onDragLeave = () => setIsOver(false);

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={handlePick}
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={openPicker}
          className="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition active:scale-95"
        >
          Add Images
        </button>
        <div className="text-xs text-gray-500">
          Up to {maxFiles} files, ≤ {maxSizeMB} MB each
        </div>
      </div>

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`rounded-2xl border-2 border-dashed p-6 transition ${
          isOver ? "border-[#03AC0E]/60 bg-[#03AC0E]/5" : "border-gray-200"
        }`}
      >
        <div className="text-center text-sm text-gray-600">
          Drag & drop images here, or click{" "}
          <span className="text-[#03AC0E]">Add Images</span>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {previews.map((p, i) => (
            <div key={`${p.url}-${i}`} className="relative group">
              <img
                src={p.url}
                alt={p.name}
                className="w-full h-32 object-cover rounded-xl border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute top-2 right-2 px-2 py-1 text-xs rounded-md bg-white/90 border border-gray-200 shadow opacity-0 group-hover:opacity-100 transition"
                aria-label={`Remove ${p.name}`}
                title="Remove"
              >
                Remove
              </button>
              <div className="mt-1 text-[11px] text-gray-500 line-clamp-1">
                {p.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
