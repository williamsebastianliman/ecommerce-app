import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { AuthContext } from "../../state/auth-context";
import { createProduct } from "../../api/products.api";
import type { CreateProductDTO } from "../../dto/product.dto";

type Preview = { url: string; file: File };

export default function SellerProductCreatePage() {
  const { user } = useContext(AuthContext);
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState<string>("");
  const [stock, setStock] = useState<string>("");

  const [previews, setPreviews] = useState<Preview[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const canSubmit = useMemo(() => {
    const p = Number(price);
    const s = Number(stock);
    return (
      user &&
      name.trim().length >= 3 &&
      desc.trim().length >= 3 &&
      Number.isFinite(p) &&
      p >= 0 &&
      Number.isInteger(s) &&
      s >= 0 &&
      previews.length > 0 &&
      !submitting
    );
  }, [user, name, desc, price, stock, previews, submitting]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [previews]);

  const addFiles = (files: FileList | File[]) => {
    const next: Preview[] = [];
    Array.from(files).forEach((f) => {
      if (!f.type.startsWith("image/")) return;
      next.push({ file: f, url: URL.createObjectURL(f) });
    });
    if (next.length) setPreviews((prev) => [...prev, ...next]);
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    addFiles(e.target.files);
    e.target.value = "";
  };

  const removeAt = (idx: number) => {
    setPreviews((prev) => {
      const cp = [...prev];
      const [rm] = cp.splice(idx, 1);
      if (rm) URL.revokeObjectURL(rm.url);
      return cp;
    });
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      addFiles(e.dataTransfer.files);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!canSubmit) {
      setErr("Please complete all fields and add at least one image.");
      return;
    }
    setSubmitting(true);
    setErr("");
    setOk("");
    try {
      const dto: CreateProductDTO = {
        sellerId: user.id,
        name: name.trim(),
        description: desc.trim(),
        price: Math.floor(Number(price)),
        stock: Math.floor(Number(stock)),
      };
      await createProduct(
        dto,
        previews.map((p) => p.file)
      );
      setOk("Product created.");
      setName("");
      setDesc("");
      setPrice("");
      setStock("");
      setPreviews((prev) => {
        prev.forEach((p) => URL.revokeObjectURL(p.url));
        return [];
      });
      setTimeout(() => nav("/seller"), 500);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to create product.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-sm text-gray-600 flex items-center gap-2">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#03AC0E] border-t-transparent" />
        Redirecting…
      </div>
    );
  }

  return (
    <div className="pastel-dot-bg space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Insert Product</h1>
        <Button
          variant="outline"
          onClick={() => nav("/seller")}
          className="rounded-xl border-2"
        >
          Back
        </Button>
      </div>

      {err && (
        <div className="rounded-lg bg-white border-2 border-red-500 px-6 py-3 text-sm font-medium text-red-700 shadow">
          {err}
        </div>
      )}
      {ok && (
        <div className="rounded-lg bg-white border-2 border-[#03AC0E] px-6 py-3 text-sm font-medium text-green-700 shadow">
          {ok}
        </div>
      )}

      <Card>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (Rp)
              </label>
              <Input
                type="number"
                min={0}
                step={1}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 150000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock
              </label>
              <Input
                type="number"
                min={0}
                step={1}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="e.g. 20"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Describe your product…"
                className="w-full min-h-[110px] rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#03AC0E]/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`rounded-2xl border-2 px-4 py-8 text-center transition ${
                dragOver
                  ? "border-[#03AC0E] bg-[#03AC0E]/5"
                  : "border-dashed border-gray-300"
              }`}
            >
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  Drag & drop images here, or{" "}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[#ffffff] underline underline-offset-4"
                  >
                    browse
                  </button>
                </div>
                <div className="text-xs text-gray-500">PNG, JPG, JPEG</div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onPick}
                  className="hidden"
                />
              </div>
            </div>

            {previews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {previews.map((p, i) => (
                  <div key={i} className="relative group">
                    <div className="h-32 w-full rounded-xl overflow-hidden border border-[#03AC0E]/30 bg-gray-100">
                      <img
                        src={p.url}
                        alt={`preview-${i}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAt(i)}
                      className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition px-2 py-1 text-xs rounded-lg bg-red-600 text-white"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              isLoading={submitting}
              disabled={!canSubmit}
              className="rounded-xl bg-[#03AC0E] border-2 border-[#03AC0E] text-white hover:bg-[#03940C]"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating…
                </span>
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
