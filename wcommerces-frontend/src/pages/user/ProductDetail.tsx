import { useEffect, useMemo, useState, useContext, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById } from "../../api/products.api";
import { initCart, addItem, getCart } from "../../api/cart.api";
import type { ProductResponseDTO } from "../../dto/product.dto";
import { AuthContext } from "../../state/auth-context";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import { getErrorMessage } from "../../lib/errors";

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useContext(AuthContext);

  const [p, setP] = useState<ProductResponseDTO | null>(null);
  const [qty, setQty] = useState(0);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [cartQty, setCartQty] = useState(0);

  const [idx, setIdx] = useState(0);
  const timerRef = useRef<number | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (!id) return;
        setLoading(true);
        setErr("");
        const product = await getProductById(id);
        setP(product);

        if (user) {
          try {
            await initCart(user.id);
            const cart = await getCart(user.id);
            const existingItem = cart.items?.find(
              (item) => item.productId === id
            );
            setCartQty(existingItem?.quantity ?? 0);
          } catch {
            setCartQty(0);
          }
        }
      } catch (e) {
        setErr(getErrorMessage(e, "Failed to load product"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user]);

  const imgs = useMemo(() => p?.images ?? [], [p]);

  useEffect(() => {
    if (imgs.length <= 1) return;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setIdx((prev) => (imgs.length ? (prev + 1) % imgs.length : 0));
    }, 3500) as unknown as number;
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [imgs]);

  useEffect(() => {
    if (ok) {
      setShowSuccessToast(true);
      const timer = window.setTimeout(() => {
        setShowSuccessToast(false);
        window.setTimeout(() => setOk(""), 300);
      }, 2700);
      return () => window.clearTimeout(timer);
    }
  }, [ok]);

  useEffect(() => {
    if (err) {
      setShowErrorToast(true);
      const timer = window.setTimeout(() => {
        setShowErrorToast(false);
        window.setTimeout(() => setErr(""), 300);
      }, 2700);
      return () => window.clearTimeout(timer);
    }
  }, [err]);

  const next = () => setIdx((i) => (imgs.length ? (i + 1) % imgs.length : 0));
  const prev = () =>
    setIdx((i) => (imgs.length ? (i - 1 + imgs.length) % imgs.length : 0));

  const add = async () => {
    if (!user) {
      nav("/login");
      return;
    }
    if (!p) return;

    if (qty <= 0) {
      setErr("Quantity must be greater than 0");
      return;
    }

    const totalQty = cartQty + qty;
    if (totalQty > p.stock) {
      setErr(
        `Cannot add ${qty} item(s). You already have ${cartQty} in cart. Maximum available: ${p.stock}`
      );
      return;
    }

    try {
      setAdding(true);
      setErr("");
      setOk("");
      await initCart(user.id);
      await addItem(user.id, { productId: p.id, quantity: qty });

      setCartQty(totalQty);
      setQty(0);
      setOk(`Added ${qty} item(s) to cart successfully`);
    } catch (e) {
      setErr(getErrorMessage(e, "Failed to add to cart"));
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-gray-500 flex items-center gap-2">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#03AC0E] border-t-transparent" />
        Loading…
      </div>
    );
  }
  if (!p)
    return <div className="text-sm text-gray-500">Product not found.</div>;

  const availableStock = p.stock - cartQty;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none">
        <div className="flex flex-col gap-3">
          {ok && (
            <div
              className={`pointer-events-auto transition-all duration-300 ease-out ${
                showSuccessToast
                  ? "translate-x-0 opacity-100"
                  : "translate-x-full opacity-0"
              }`}
            >
              <div className="rounded-lg bg-white border-2 border-[#03AC0E] px-6 py-3 text-sm font-medium text-green-700 shadow-xl min-w-[300px]">
                <div className="flex items-center gap-2">
                  <span className="text-[#03AC0E] text-lg">✓</span>
                  <span>{ok}</span>
                </div>
              </div>
            </div>
          )}

          {err && (
            <div
              className={`pointer-events-auto transition-all duration-300 ease-out ${
                showErrorToast
                  ? "translate-x-0 opacity-100"
                  : "translate-x-full opacity-0"
              }`}
            >
              <div className="rounded-lg bg-white border-2 border-red-500 px-6 py-3 text-sm font-medium text-red-700 shadow-xl min-w-[300px]">
                <div className="flex items-center gap-2">
                  <span className="text-red-500 text-lg">✕</span>
                  <span>{err}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pastel-dot-bg relative">
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-100 border-2 border-[#03AC0E]/60">
              {imgs.length > 0 ? (
                <>
                  {imgs.map((im, i) => {
                    const src = `/api/media/${im.dataBase64}`;
                    return (
                      <img
                        key={im.id ?? i}
                        src={src}
                        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                          i === idx ? "opacity-100" : "opacity-0"
                        }`}
                        alt=""
                        draggable={false}
                      />
                    );
                  })}

                  {imgs.length > 1 && (
                    <>
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/30 to-transparent" />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />

                      <button
                        onClick={prev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/55 text-white px-3 py-2 text-lg shadow-lg ring-2 ring-[#03AC0E]/50 hover:bg-black/70"
                        aria-label="Previous image"
                      >
                        ‹
                      </button>
                      <button
                        onClick={next}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/55 text-white px-3 py-2 text-lg shadow-lg ring-2 ring-[#03AC0E]/50 hover:bg-black/70"
                        aria-label="Next image"
                      >
                        ›
                      </button>

                      <div className="absolute bottom-3 inset-x-0 flex justify-center">
                        <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#03AC0E]/80 bg-white/80 px-2 py-1 shadow-sm backdrop-blur">
                          {imgs.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setIdx(i)}
                              className={`h-2.5 w-2.5 rounded-full transition ring-1 ${
                                i === idx
                                  ? "bg-[#03AC0E] ring-[#03AC0E]/80"
                                  : "bg-[#03AC0E]/30 ring-[#03AC0E]/40 hover:bg-[#03AC0E]/50"
                              }`}
                              aria-label={`Go to image ${i + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : null}
            </div>
          </Card>

          <Card>
            <div className="flex flex-col h-full">
              <div className="space-y-4 flex-1">
                <h1 className="text-2xl font-semibold">{p.name}</h1>
                <div className="text-xl text-[#03AC0E] font-semibold">
                  Rp{p.price}
                </div>
                <div className="text-sm space-y-1">
                  <div className="text-gray-500">Total Stock: {p.stock}</div>
                  {cartQty > 0 && (
                    <div className="text-gray-500">In Cart: {cartQty}</div>
                  )}
                  <div className="text-gray-700 font-medium">
                    Available: {availableStock}
                  </div>
                </div>

                <div className="rounded-xl border-2 border-[#03AC0E]/60 bg-white p-4">
                  <p className="text-gray-700">{p.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-28">
                    <Input
                      type="number"
                      min={0}
                      max={availableStock}
                      value={qty}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setQty(Math.max(0, Math.min(val, availableStock)));
                      }}
                      className="border-2 border-[#03AC0E]/60 focus:ring-[#03AC0E]/60"
                    />
                  </div>

                  <Button
                    onClick={add}
                    isLoading={adding}
                    disabled={availableStock === 0}
                    className="rounded-xl bg-[#03AC0E] border-2 border-[#03AC0E] text-white px-5 py-2 hover:bg-[#03940C] focus:ring-[#03AC0E] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {adding ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Adding…
                      </span>
                    ) : availableStock === 0 ? (
                      "Out of Stock"
                    ) : (
                      "Add to Cart"
                    )}
                  </Button>
                </div>
              </div>

              {p.seller && (
                <div className="mt-10 rounded-xl border-2 border-[#03AC0E]/60 bg-gradient-to-br from-[#03AC0E]/5 to-transparent p-4">
                  <h3 className="text-sm font-semibold text-[#03AC0E] mb-2">
                    Seller Data
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-gray-500">Name:</span>
                      <div className="text-sm font-medium text-gray-900">
                        {p.seller.storeName}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">
                        Description:
                      </span>
                      <div className="text-sm text-gray-700">
                        {p.seller.description}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
