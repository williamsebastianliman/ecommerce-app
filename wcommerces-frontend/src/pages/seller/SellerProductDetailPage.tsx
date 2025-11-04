import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { AuthContext } from "../../state/auth-context";
import {
  getProductById,
  updateProduct,
  addImages,
} from "../../api/products.api";
import type {
  ImageMetadata,
  ProductResponseDTO,
  UpdateProductDTO,
} from "../../dto/product.dto";
import { getErrorMessage } from "../../lib/errors";

type Preview = { url: string; file: File };

function imgSrc(img?: ImageMetadata) {
  if (!img) return "";
  if (img.dataBase64) return `/api/media/${img.dataBase64}`;
  return "";
}

export default function SellerProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");

  const [product, setProduct] = useState<ProductResponseDTO | null>(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState<string>("");

  const [previews, setPreviews] = useState<Preview[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const canSave = useMemo(() => {
    const p = Number(price);
    return (
      !!product &&
      name.trim().length >= 3 &&
      desc.trim().length >= 3 &&
      Number.isFinite(p) &&
      p >= 0 &&
      !saving
    );
  }, [product, name, desc, price, saving]);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!id) return;
      setLoading(true);
      setErr("");
      try {
        const p = await getProductById(id);
        if (!alive) return;
        setProduct(p);
        setName(p.name ?? "");
        setDesc(p.description ?? "");
        setPrice(String(p.price ?? 0));
      } catch (e) {
        if (!alive) return;
        setErr(getErrorMessage(e, "Failed to load product"));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!okMsg) return;
    const t = window.setTimeout(() => setOkMsg(""), 2200);
    return () => window.clearTimeout(t);
  }, [okMsg]);

  useEffect(() => {
    if (!err) return;
    const t = window.setTimeout(() => setErr(""), 3000);
    return () => window.clearTimeout(t);
  }, [err]);

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

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !id) return;
    if (!canSave) {
      setErr("Please fill name/description (≥ 3 chars) and a valid price.");
      return;
    }
    setSaving(true);
    setErr("");
    setOkMsg("");
    try {
      const dto: UpdateProductDTO = {
        name: name.trim(),
        description: desc.trim(),
        price: Math.floor(Number(price)),
      };

      const widenDto = {
        ...dto,
        stock: product.stock,
      } as unknown as UpdateProductDTO;

      await updateProduct(id, widenDto);

      if (previews.length > 0) {
        await addImages(
          id,
          previews.map((p) => p.file)
        );
        previews.forEach((p) => URL.revokeObjectURL(p.url));
        setPreviews([]);
      }

      const fresh = await getProductById(id);
      setProduct(fresh);
      setOkMsg("Product updated.");
    } catch (e) {
      setErr(getErrorMessage(e, "Failed to update product"));
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="text-sm text-gray-600 flex items-center gap-2">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#03AC0E] border-t-transparent" />
        Loading product…
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-sm text-red-600">{err || "Product not found."}</div>
    );
  }

  return (
    <div className="pastel-dot-bg space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Edit Product</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => nav(-1)}
            className="rounded-xl border-2"
          >
            Back
          </Button>
          <Button
            onClick={onSave}
            isLoading={saving}
            disabled={!canSave}
            className="rounded-xl bg-[#03AC0E] border-2 border-[#03AC0E] text-white hover:bg-[#03940C]"
          >
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving…
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>

      {okMsg && (
        <div className="rounded-lg bg-white border-2 border-[#03AC0E] px-6 py-3 text-sm font-medium text-green-700 shadow">
          {okMsg}
        </div>
      )}
      {err && (
        <div className="rounded-lg bg-white border-2 border-red-500 px-6 py-3 text-sm font-medium text-red-700 shadow">
          {err}
        </div>
      )}

      <Card>
        <form onSubmit={onSave} className="space-y-6">
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
              <Input value={String(product.stock ?? 0)} disabled readOnly />
              <p className="mt-1 text-xs text-gray-500">
                Stock is not editable here.
              </p>
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

          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">
              Existing Images
            </div>
            {product.images?.length ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {product.images.map((img) => {
                  const src = imgSrc(img);
                  return (
                    <div
                      key={img.id}
                      className="h-32 w-full rounded-xl overflow-hidden border border-[#03AC0E]/30 bg-gray-100 flex items-center justify-center"
                    >
                      {src ? (
                        <img
                          src={src}
                          alt={img.originalName || img.id}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-xs text-gray-400">No Image</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-gray-500">No existing images.</div>
            )}
            <div className="text-xs text-gray-500">
              (Removing existing images isn’t enabled here; you can add more
              below.)
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Images
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
              isLoading={saving}
              disabled={!canSave}
              className="rounded-xl bg-[#03AC0E] border-2 border-[#03AC0E] text-white hover:bg-[#03940C]"
            >
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving…
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
