import { useContext, useEffect, useMemo, useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { AuthContext } from "../../state/auth-context";
import { createOrderFromCart } from "../../api/orders.api";
import { getErrorMessage } from "../../lib/errors";
import { useNavigate } from "react-router-dom";
import { clearCart, getCart, getStats, initCart } from "../../api/cart.api";
import type { CartItemResponseDTO, CartResponseDTO } from "../../dto/cart.dto";

export default function CheckoutPage() {
  const { user } = useContext(AuthContext);
  const nav = useNavigate();

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [placing, setPlacing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [cart, setCart] = useState<CartResponseDTO | null>(null);
  const [stats, setStats] = useState<{
    grandTotal: number;
    totalItems: number;
  } | null>(null);

  const items: CartItemResponseDTO[] = useMemo(() => cart?.items ?? [], [cart]);

  // client-side subtotal + total fallback
  const lineTotal = (it: CartItemResponseDTO) =>
    (it.product?.price ?? 0) * it.quantity;
  const clientCartTotal = (arr: CartItemResponseDTO[]) =>
    arr.reduce((acc, it) => acc + lineTotal(it), 0);

  const refreshStats = async (
    uid: string,
    fallbackItems: CartItemResponseDTO[]
  ) => {
    try {
      const s = await getStats(uid);
      setStats(s);
    } catch (e) {
      setStats({
        grandTotal: clientCartTotal(fallbackItems),
        totalItems: fallbackItems.length,
      });
      setErr(getErrorMessage(e, "Failed to load totals"));
    }
  };

  const refresh = async () => {
    if (!user) return;
    setErr("");
    setOk("");
    setLoading(true);
    try {
      await initCart(user.id);
      const c = await getCart(user.id);
      setCart(c);
      await refreshStats(user.id, c.items ?? []);
    } catch (e) {
      setErr(getErrorMessage(e, "Failed to load checkout data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setAuthChecked(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    if (!user) {
      nav("/login");
      return;
    }
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authChecked]);

  // prefer server total else fallback
  const grandTotal = stats?.grandTotal ?? clientCartTotal(items);

  const checkout = async () => {
    if (!user) return nav("/login");
    if (items.length === 0) {
      setErr("Your cart is empty.");
      return;
    }
    setErr("");
    setOk("");
    setPlacing(true);
    try {
      const r = await createOrderFromCart({ userId: user.id });
      // tolerate APIs that may not return { ok } explicitly
      const succeeded = typeof r?.ok === "boolean" ? r.ok : true;
      if (succeeded) {
        // 1) Show modal immediately so loading state doesn't hide it
        setShowSuccessModal(true);
        // 2) Then sync server/client state in the background
        await clearCart(user.id);
        await refresh();
      } else {
        setErr("Server cart checkout did not succeed.");
      }
    } catch (e) {
      setErr(getErrorMessage(e, "Failed to checkout"));
    } finally {
      setPlacing(false);
    }
  };

  const closeModal = () => {
    setShowSuccessModal(false);
    nav("/");
  };

  // Keep spinner unless the success modal is open (so we never hide it)
  if (!authChecked || (loading && !showSuccessModal)) {
    return (
      <div className="text-sm text-gray-600 flex items-center gap-2">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#03AC0E] border-t-transparent" />
        Loading…
      </div>
    );
  }

  return (
    <>
      {showSuccessModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative animate-in zoom-in-95 duration-300 w-[90vw] max-w-md mx-4">
            <Card>
              <div className="text-center space-y-4 p-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-[#03AC0E]/10 flex items-center justify-center animate-in zoom-in-50 duration-500">
                  <svg
                    className="w-8 h-8 text-[#03AC0E]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Order Successful!
                </h2>
                <p className="text-gray-600">
                  Your order has been placed successfully. The products will be
                  sent to your address shortly.
                </p>
                <Button
                  onClick={closeModal}
                  className="w-full rounded-xl bg-[#03AC0E] border-2 border-[#03AC0E] text-white hover:bg-[#03940C] focus:ring-[#03AC0E]"
                >
                  Continue Shopping
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      <div className="pastel-dot-bg space-y-4">
        <h1 className="text-2xl font-semibold">Checkout</h1>

        {err && <div className="text-sm text-red-600">{err}</div>}
        {ok && <div className="text-sm text-[#03AC0E]">{ok}</div>}

        {items.length === 0 ? (
          <Card>
            <div className="text-sm text-gray-600">Your cart is empty.</div>
          </Card>
        ) : (
          <>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="[&>th]:text-left [&>th]:px-3 [&>th]:py-2">
                      <th className="text-gray-600">Product</th>
                      <th className="text-gray-600 w-24">Qty</th>
                      <th className="text-gray-600 w-40">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => {
                      const subtotal = lineTotal(it);
                      return (
                        <tr
                          key={it.id ?? `${it.productId}-${idx}`}
                          className="border-t first:border-t-0 border-[#03AC0E]/30"
                        >
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-14 w-14 rounded-xl bg-gray-100 overflow-hidden border border-[#03AC0E]/30">
                                {it.product.image?.id ? (
                                  <img
                                    src={`/api/media/${it.product.image.baseData}`}
                                    className="h-full w-full object-cover"
                                    alt={it.product.name}
                                  />
                                ) : null}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {it.product.name}
                                </div>
                                <div className="text-xs text-gray-500 line-clamp-1">
                                  {it.product.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 align-top">
                            <div className="text-sm">{it.quantity}</div>
                          </td>
                          <td className="px-3 py-3 align-top">
                            <div className="font-semibold text-[#03AC0E]">
                              Rp{subtotal}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-lg font-semibold text-[#03AC0E]">
                  Grand Total: Rp{grandTotal}
                </div>
                <Button
                  className="sm:w-auto w-full rounded-xl bg-[#03AC0E] border-2 border-[#03AC0E] text-white hover:bg-[#03940C] focus:ring-[#03AC0E]"
                  onClick={checkout}
                  isLoading={placing}
                  disabled={placing || items.length === 0}
                >
                  Checkout
                </Button>
              </div>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
