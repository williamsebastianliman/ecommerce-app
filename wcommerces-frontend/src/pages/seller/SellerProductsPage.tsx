import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { AuthContext } from "../../state/auth-context";
import { listProductsBySeller, removeProduct } from "../../api/products.api";
import type {
  ProductResponseDTO,
  PaginatedResponse,
  ProductSellerListRequestDTO,
  ImageMetadata,
} from "../../dto/product.dto";
import { getErrorMessage } from "../../lib/errors";

const rupiah = new Intl.NumberFormat("id-ID");

function thumbSrc(img?: ImageMetadata) {
  if (!img) return "";
  if (img.dataBase64 && img.mimeType) return `/api/media/${img.dataBase64}`;
  return "";
}

export default function SellerProductsPage() {
  const nav = useNavigate();
  const { user } = useContext(AuthContext);

  const [items, setItems] = useState<ProductResponseDTO[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const seqRef = useRef(0);

  const fetchPage = async (pg: number, ps: number, query: string) => {
    if (!user) return;
    const mySeq = ++seqRef.current;
    setLoading(true);
    setErr("");
    try {
      const dto: ProductSellerListRequestDTO = {
        sellerId: user.id,
        page: pg,
        pageSize: ps,
        q: query || undefined,
      };
      const res: PaginatedResponse<ProductResponseDTO> =
        await listProductsBySeller(dto);
      if (mySeq !== seqRef.current) return;
      setItems(res?.data ?? []);
      setTotal(res?.meta?.total ?? 0);
      const tp = Math.max(1, res?.meta?.totalPages ?? 1);
      setTotalPages(tp);
      if (pg > tp) setPage(tp);
    } catch (e) {
      if (mySeq !== seqRef.current) return;
      setErr(getErrorMessage(e, "Failed to load products"));
      setItems([]);
      setTotal(0);
      setTotalPages(1);
      if (page !== 1) setPage(1);
    } finally {
      if (mySeq === seqRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    void fetchPage(1, pageSize, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const h = window.setTimeout(() => {
      setPage(1);
      void fetchPage(1, pageSize, q.trim());
    }, 300);
    return () => window.clearTimeout(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    if (!user) return;
    void fetchPage(page, pageSize, q.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  useEffect(() => {
    if (!okMsg) return;
    const t = window.setTimeout(() => setOkMsg(""), 2200);
    return () => window.clearTimeout(t);
  }, [okMsg]);

  useEffect(() => {
    if (!err) return;
    const t = window.setTimeout(() => setErr(""), 2800);
    return () => window.clearTimeout(t);
  }, [err]);

  const startIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(page * pageSize, total);

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

  if (!user) {
    return (
      <div className="text-sm text-gray-600 flex items-center gap-2">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#03AC0E] border-t-transparent" />
        Redirecting…
      </div>
    );
  }

  const onDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete product "${name}"? This cannot be undone.`))
      return;
    setDeletingId(id);
    setErr("");
    try {
      await removeProduct(id);
      setOkMsg("Product deleted.");
      await fetchPage(page, pageSize, q.trim());
    } catch (e) {
      setErr(getErrorMessage(e, "Failed to delete product"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="pastel-dot-bg space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">My Products</h1>
        <Button
          onClick={() => nav("products/create")}
          className="rounded-xl bg-[#03AC0E] border-2 border-[#03AC0E] text-white hover:bg-[#03940C]"
        >
          + Insert Product
        </Button>
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
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search my products…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Button
            onClick={() => void fetchPage(1, pageSize, q.trim())}
            disabled={loading}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Searching…
              </span>
            ) : (
              "Search"
            )}
          </Button>
        </div>
      </Card>

      {loading ? (
        <div className="text-sm text-gray-600 flex items-center gap-2">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#03AC0E] border-t-transparent" />
          Loading…
        </div>
      ) : items.length === 0 ? (
        <Card>
          <div className="text-sm text-gray-600">No products found.</div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((p) => {
              const img = p.images?.[0];
              const src = thumbSrc(img);
              const isDeleting = deletingId === p.id;
              return (
                <Card key={p.id}>
                  <div className="h-full flex flex-col">
                    <div className="h-40 w-full rounded-xl bg-gray-100 overflow-hidden border border-[#03AC0E]/20 flex items-center justify-center">
                      {src ? (
                        <img
                          src={src}
                          alt={p.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="text-xs text-gray-400">No Image</div>
                      )}
                    </div>

                    <div className="px-1 pt-2 flex-1">
                      <div className="font-semibold line-clamp-1">{p.name}</div>
                      <div className="text-xs text-gray-500 line-clamp-2">
                        {p.description}
                      </div>
                      <div className="mt-1 text-[#03AC0E] font-semibold">
                        Rp{rupiah.format(p.price)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Stock: {p.stock}
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        className="w-full sm:flex-1 rounded-xl border-2"
                        onClick={() => nav(`/seller/p/${p.id}`)}
                      >
                        Update
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full sm:flex-1 rounded-xl border-2 !border-red-500 !text-red-600 hover:!bg-red-50"
                        disabled={isDeleting}
                        onClick={() => void onDelete(p.id, p.name)}
                      >
                        {isDeleting ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                            Deleting…
                          </span>
                        ) : (
                          "Delete"
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{startIdx}</span>–
                <span className="font-medium">{endIdx}</span> of{" "}
                <span className="font-medium">{total}</span>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Per page</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      setPageSize(next);
                      setPage(1);
                    }}
                    className="rounded-xl border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#03AC0E]/40"
                  >
                    {[12, 24, 48].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1 whitespace-nowrap overflow-x-auto [-webkit-overflow-scrolling:touch] px-1">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="px-2.5 py-1.5 text-sm rounded-xl border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:text-gray-400"
                  >
                    <span aria-hidden>«</span>
                    <span className="hidden sm:inline ml-1">First</span>
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-2.5 py-1.5 text-sm rounded-xl border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:text-gray-400"
                  >
                    <span className="hidden sm:inline mr-1">Prev</span>
                    <span aria-hidden>‹</span>
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
                    className="px-2.5 py-1.5 text-sm rounded-xl border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:text-gray-400"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span aria-hidden className="ml-1">
                      ›
                    </span>
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="px-2.5 py-1.5 text-sm rounded-xl border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:text-gray-400"
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
    </div>
  );
}
