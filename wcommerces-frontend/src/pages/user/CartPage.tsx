import { useEffect, useState, useContext } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../state/auth-context";
import {
  getCart,
  initCart,
  setItemQty,
  removeItem,
  getStats,
} from "../../api/cart.api";
import type { CartItemResponseDTO, CartResponseDTO } from "../../dto/cart.dto";
import { getErrorMessage } from "../../lib/errors";

export default function CartPage() {
  const nav = useNavigate();
  const { user } = useContext(AuthContext);

  const [cart, setCart] = useState<CartResponseDTO | null>(null);
  const [stats, setStats] = useState<{
    grandTotal: number;
    totalItems: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const items: CartItemResponseDTO[] = cart?.items ?? [];

  // ---- client-side fallback totals (used if /stats fails or is absent)
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
      // fall back to computing total from items you already have
      setStats({
        grandTotal: clientCartTotal(fallbackItems),
        totalItems: fallbackItems.length,
      });
      setErr(getErrorMessage(e, "Failed to load cart stats"));
    }
  };

  const refresh = async () => {
    if (!user) return;
    setErr("");
    setLoading(true);
    try {
      await initCart(user.id);
      const c = await getCart(user.id);
      setCart(c);
      await refreshStats(user.id, c.items ?? []);
    } catch (e) {
      setErr(getErrorMessage(e, "Failed to load cart"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait a bit for auth to initialize
    const timer = setTimeout(() => {
      setAuthChecked(true);
    }, 100);

    return () => clearTimeout(timer);
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

  const update = async (productId: string, qty: number) => {
    if (!user) return;
    setErr("");
    setBusyId(productId);
    try {
      const next = await setItemQty(user.id, productId, {
        quantity: Math.max(1, qty),
      });
      setCart(next);
      await refreshStats(user.id, next.items ?? []);
    } catch (e) {
      setErr(getErrorMessage(e, "Failed to update item quantity"));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (productId: string) => {
    if (!user) return;
    setErr("");
    setBusyId(productId);
    try {
      const next = await removeItem(user.id, productId);
      setCart(next);
      await refreshStats(user.id, next.items ?? []);
    } catch (e) {
      setErr(getErrorMessage(e, "Failed to remove item"));
    } finally {
      setBusyId(null);
    }
  };

  // Prefer server grandTotal; fall back to client-computed sum
  const sum = stats?.grandTotal ?? clientCartTotal(items);

  if (!authChecked || loading) {
    return (
      <div className="text-sm text-gray-600 flex items-center gap-2">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#03AC0E] border-t-transparent" />
        Loading…
      </div>
    );
  }

  return (
    <div className="pastel-dot-bg">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Your Cart</h1>
        {err && <div className="text-sm text-red-600">{err}</div>}

        {items.length === 0 ? (
          <Card>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Your cart is empty.</div>
              <Link to="/" className="text-[#03AC0E] hover:underline">
                Go shopping
              </Link>
            </div>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {items.map((it) => {
                const price = it.product?.price ?? 0;
                const lt = lineTotal(it);
                return (
                  <Card key={it.id}>
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-xl bg-gray-100 overflow-hidden">
                        {it.product.image?.id ? (
                          <img
                            src={`/api/media/${it.product.image.baseData}`}
                            className="w-full h-full object-cover"
                            alt={it.product.name}
                          />
                        ) : null}
                      </div>

                      <div className="flex-1">
                        <div className="font-medium">{it.product.name}</div>
                        <div className="text-xs text-gray-500 line-clamp-1">
                          {it.product.description}
                        </div>
                        <div className="mt-1 text-sm">
                          <span className="text-gray-600">Price: </span>
                          <span className="font-medium">Rp{price}</span>
                          <span className="mx-2 text-gray-400">•</span>
                          <span className="text-gray-600">Subtotal: </span>
                          <span className="font-semibold text-[#03AC0E]">
                            Rp{lt}
                          </span>
                        </div>
                      </div>

                      <div className="w-24">
                        <Input
                          type="number"
                          min={1}
                          value={it.quantity}
                          onChange={(e) =>
                            update(it.productId, Number(e.target.value))
                          }
                          disabled={busyId === it.productId}
                        />
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => remove(it.productId)}
                        isLoading={busyId === it.productId}
                      >
                        Remove
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>

            <Card>
              <div className="flex items-center justify-between">
                <div className="font-semibold">Grand Total</div>
                <div className="text-[#03AC0E] font-semibold">Rp{sum}</div>
              </div>
              <div className="mt-4 flex gap-3">
                <Button className="flex-1" onClick={() => nav("/checkout")}>
                  Proceed to Checkout
                </Button>
                <Link to="/" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
