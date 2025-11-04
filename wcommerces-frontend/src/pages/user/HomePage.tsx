import { useEffect, useMemo, useRef, useState } from "react";
import { listAllProducts } from "../../api/products.api";
import type {
  ProductResponseDTO,
  PaginatedResponse,
} from "../../dto/product.dto";
import ProductCard from "../../components/ProductCard";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import axios from "axios";

function getAxiosMessage(err: unknown): string | undefined {
  if (axios.isAxiosError(err)) {
    const msg =
      (err.response?.data as { message?: string } | undefined)?.message ??
      err.message;
    return msg;
  }
  if (err instanceof Error) return err.message;
  return undefined;
}

export default function HomePage() {
  const [items, setItems] = useState<ProductResponseDTO[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const seqRef = useRef(0);

  const fetchPage = async (query: string, pg: number, ps: number) => {
    const mySeq = ++seqRef.current;
    setLoading(true);
    setErr("");
    try {
      const res: PaginatedResponse<ProductResponseDTO> = await listAllProducts({
        page: pg,
        pageSize: ps,
        q: query,
      });
      if (mySeq !== seqRef.current) return;
      setItems(res?.data ?? []);
      const t = res?.meta?.total ?? 0;
      const tp = Math.max(1, res?.meta?.totalPages ?? 1);
      setTotal(t);
      setTotalPages(tp);

      if (pg > tp) setPage(tp);
    } catch (e) {
      if (mySeq !== seqRef.current) return;
      setErr(getAxiosMessage(e) ?? "Failed to load products");
      setItems([]);
      setTotal(0);
      setTotalPages(1);
      if (page !== 1) setPage(1);
    } finally {
      if (mySeq === seqRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPage("", 1, pageSize);
  }, []);

  useEffect(() => {
    const h = window.setTimeout(() => {
      void fetchPage(q.trim(), 1, pageSize);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(h);
  }, [q]);

  useEffect(() => {
    void fetchPage(q.trim(), page, pageSize);
  }, [page, pageSize]);

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

  return (
    <div className="pastel-dot-bg">
      <div className="space-y-4">
        <Card>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search products…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <Button
              onClick={() => void fetchPage(q.trim(), 1, pageSize)}
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

        {err && <div className="text-sm text-red-600">{err}</div>}

        {loading ? (
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#03AC0E] border-t-transparent" />
            Loading…
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {items.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  price={p.price}
                  stock={p.stock}
                  imageId={p.images?.[0]?.dataBase64}
                />
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

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                      className="px-3 py-1.5 text-sm rounded-xl border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:text-gray-400"
                      aria-label="First page"
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
                      aria-label="Previous page"
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
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="px-3 py-1.5 text-sm rounded-xl border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:text-gray-400"
                      aria-label="Next page"
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
                      aria-label="Last page"
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
    </div>
  );
}
