import { useContext, useEffect, useMemo, useRef, useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { AuthContext } from "../../state/auth-context";
import { useNavigate } from "react-router-dom";
import { listBuyerOrders } from "../../api/orders.api";
import type { PaginatedResponse } from "../../dto/product.dto";
import { getErrorMessage } from "../../lib/errors";
import type {
  OrderDetailResponseDTO,
  OrderResponseDTO,
} from "../../dto/order.dto";
import TransactionCard from "../../components/ui/TransactionCard";

const rupiah = new Intl.NumberFormat("id-ID");

export default function TransactionHistoryPage() {
  const { user } = useContext(AuthContext);
  const nav = useNavigate();

  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAuthChecked(true), 100);
    return () => clearTimeout(t);
  }, []);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [orders, setOrders] = useState<OrderResponseDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selected, setSelected] = useState<OrderResponseDTO | null>(null);

  const seqRef = useRef(0);

  const fetchPage = async (pg: number, ps: number) => {
    if (!user) return;
    const mySeq = ++seqRef.current;
    setLoading(true);
    setErr("");
    try {
      const res: PaginatedResponse<OrderResponseDTO> = await listBuyerOrders({
        userId: user.id,
        page: pg,
        pageSize: ps,
      });
      if (mySeq !== seqRef.current) return;
      const data = res?.data ?? [];
      const t = res?.meta?.total ?? 0;
      const tp = Math.max(1, res?.meta?.totalPages ?? 1);
      setOrders(data);
      setTotal(t);
      setTotalPages(tp);
      if (pg > tp) setPage(tp);
    } catch (e) {
      if (mySeq !== seqRef.current) return;
      setErr(getErrorMessage(e, "Failed to load transactions"));
      setOrders([]);
      setTotal(0);
      setTotalPages(1);
      if (page !== 1) setPage(1);
    } finally {
      if (mySeq === seqRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    if (!authChecked) return;
    if (!user) {
      nav("/login");
      return;
    }
    void fetchPage(page, pageSize);
  }, [user, authChecked, page, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pageNumbers = useMemo(() => {
    const span = 2;
    const nums: number[] = [];
    const start = Math.max(1, page - span);
    const end = Math.min(totalPages, page + span);

    if (start > 1) nums.push(1);
    if (start > 2) nums.push(-1);

    for (let i = start; i <= end; i++) nums.push(i);

    if (end < totalPages - 1) nums.push(-1);
    if (end < totalPages) nums.push(totalPages);
    return nums;
  }, [page, totalPages]);

  const startIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(page * pageSize, total);

  if (!authChecked) {
    return (
      <div className="text-sm text-gray-600 flex items-center gap-2">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#03AC0E] border-t-transparent" />
        Loading…
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="pastel-dot-bg space-y-4">
      <h1 className="text-2xl font-semibold">Transaction History</h1>

      {err && <div className="text-sm text-red-600">{err}</div>}

      {loading ? (
        <div className="text-sm text-gray-600 flex items-center gap-2">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#03AC0E] border-t-transparent" />
          Loading…
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <div className="text-sm text-gray-600">No transactions found.</div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((o) => (
              <TransactionCard
                key={o.id}
                onClick={() => setSelected(o)}
                createdAt={o.createdAt}
                total={o.orderDetails.reduce(
                  (s, d) => s + d.priceSnapshot * d.qty,
                  0
                )}
              >
                <div className="text-sm text-gray-500">Transaction ID</div>
                <div className="font-semibold break-all">{o.id}</div>
              </TransactionCard>
            ))}
          </div>

          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{startIdx}</span>–
                <span className="font-medium">{endIdx}</span> of{" "}
                <span className="font-medium">{total}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Per page</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="rounded-xl border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#03AC0E]/40"
                  >
                    {[10, 20, 50].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm rounded-xl border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:text-gray-400"
                  >
                    <span aria-hidden className="mr-1">
                      «
                    </span>
                    <span className="hidden sm:inline">First</span>
                  </button>

                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm rounded-xl border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:text-gray-400"
                  >
                    <span aria-hidden className="mr-1">
                      ‹
                    </span>
                    <span className="hidden sm:inline">Prev</span>
                  </button>

                  {pageNumbers.map((n, idx) =>
                    n === -1 ? (
                      <span
                        key={`dots-${idx}`}
                        className="px-2 text-sm text-gray-500 select-none"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`px-3 py-1.5 text-sm rounded-xl transition ${
                          n === page
                            ? "bg-[#03AC0E] text-white border-2 border-[#03AC0E]"
                            : "border border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
                        }`}
                        aria-current={n === page ? "page" : undefined}
                      >
                        {n}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-sm rounded-xl border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:text-gray-400"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span aria-hidden className="ml-1">
                      ›
                    </span>
                  </button>

                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-sm rounded-xl border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:text-gray-400"
                  >
                    <span className="hidden sm:inline">Last</span>
                    <span aria-hidden className="ml-1">
                      »
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}

      {selected && (
        <OrderDetailModal order={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function OrderDetailModal({
  order,
  onClose,
}: {
  order: OrderResponseDTO;
  onClose: () => void;
}) {
  const rows = useMemo(() => order.orderDetails, [order]);
  const sum = rows.reduce((s, d) => s + d.priceSnapshot * d.qty, 0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-title"
    >
      <div
        className="w-[92vw] max-w-2xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <Card>
          <div className="p-1 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm text-gray-500">Transaction</div>
              <div id="order-title" className="font-semibold break-all">
                {order.id}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(order.createdAt).toLocaleString()}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-xl border-2 border-[#03AC0E] text-gray-800 bg-white"
            >
              Close
            </Button>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="[&>th]:text-left [&>th]:px-3 [&>th]:py-2">
                  <th className="text-gray-600">Product</th>
                  <th className="text-gray-600 w-24">Qty</th>
                  <th className="text-gray-600 w-32">Price</th>
                  <th className="text-gray-600 w-40">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d: OrderDetailResponseDTO) => {
                  const sub = d.priceSnapshot * d.qty;
                  return (
                    <tr
                      key={d.id}
                      className="border-t first:border-t-0 border-[#03AC0E]/30"
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-14 rounded-xl bg-gray-100 overflow-hidden border border-[#03AC0E]/30">
                            {d.product.image ? (
                              <img
                                src={`/api/media/${d.product.image}`}
                                className="h-full w-full object-cover"
                                alt={d.product.name}
                              />
                            ) : null}
                          </div>
                          <div>
                            <div className="font-medium">{d.product.name}</div>
                            <div className="text-xs text-gray-500 line-clamp-1">
                              {d.product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <div className="text-sm">{d.qty}</div>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <div className="text-sm">
                          Rp{rupiah.format(d.priceSnapshot)}
                        </div>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <div className="font-semibold text-[#03AC0E]">
                          Rp{rupiah.format(sub)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-[#03AC0E]/40">
                  <td />
                  <td />
                  <td className="px-3 py-3 text-right font-semibold">
                    Grand Total
                  </td>
                  <td className="px-3 py-3 font-bold text-[#03AC0E]">
                    Rp{rupiah.format(sum)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
