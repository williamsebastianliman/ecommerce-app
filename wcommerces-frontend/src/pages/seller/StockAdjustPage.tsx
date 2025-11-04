import { useContext, useEffect, useMemo, useRef, useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { AuthContext } from "../../state/auth-context";
import { listProductsBySeller, incrementStocks } from "../../api/products.api";
import type {
  ProductResponseDTO,
  PaginatedResponse,
  ProductSellerListRequestDTO,
  ImageMetadata,
  StockIncrementItem,
} from "../../dto/product.dto";
import { getErrorMessage } from "../../lib/errors";

type Row = {
  id: string;
  product?: ProductResponseDTO;
  qty: number;
};

const rupiah = new Intl.NumberFormat("id-ID");

function imgSrc(img?: ImageMetadata) {
  if (!img) return "";
  if (img.dataBase64) return `/api/media/${img.dataBase64}`;
  return "";
}

export default function StockAdjustPage() {
  const { user } = useContext(AuthContext);

  const [rows, setRows] = useState<Row[]>([]);
  const addRow = () =>
    setRows((r) => [...r, { id: crypto.randomUUID(), qty: 0 }]);
  const clearRows = () => setRows([]);

  const [pickerOpen, setPickerOpen] = useState<null | { rowId: string }>(null);
  const [pickerQ, setPickerQ] = useState("");
  const [pickerLoading, setPickerLoading] = useState(true);
  const [pickerErr, setPickerErr] = useState("");
  const [products, setProducts] = useState<ProductResponseDTO[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const pageSize = 24;
  const seqRef = useRef(0);

  const fetchProducts = async (pg: number, q: string) => {
    if (!user) return;
    const mySeq = ++seqRef.current;
    setPickerLoading(true);
    setPickerErr("");
    try {
      const dto: ProductSellerListRequestDTO = {
        sellerId: user.id,
        page: pg,
        pageSize,
        q: q || undefined,
      };
      const res: PaginatedResponse<ProductResponseDTO> =
        await listProductsBySeller(dto);
      if (mySeq !== seqRef.current) return;
      setProducts(res.data ?? []);
      setTotalPages(Math.max(1, res.meta?.totalPages ?? 1));
    } catch (e) {
      if (mySeq !== seqRef.current) return;
      setProducts([]);
      setTotalPages(1);
      setPickerErr(getErrorMessage(e, "Failed to load products"));
    } finally {
      if (mySeq === seqRef.current) setPickerLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !pickerOpen) return;
    void fetchProducts(page, pickerQ.trim());
  }, [user, pickerOpen, page]);

  useEffect(() => {
    if (!user || !pickerOpen) return;
    const t = window.setTimeout(() => {
      setPage(1);
      void fetchProducts(1, pickerQ.trim());
    }, 300);
    return () => window.clearTimeout(t);
  }, [pickerQ]);

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  useEffect(() => {
    if (!ok) return;
    const t = window.setTimeout(() => setOk(""), 2200);
    return () => window.clearTimeout(t);
  }, [ok]);
  useEffect(() => {
    if (!err) return;
    const t = window.setTimeout(() => setErr(""), 3000);
    return () => window.clearTimeout(t);
  }, [err]);

  const summary = useMemo(() => {
    const nonZero = rows.filter((r) => r.product && r.qty !== 0);
    const count = nonZero.length;
    const sum = nonZero.reduce((s, r) => s + (r.qty || 0), 0);
    return { count, sum };
  }, [rows]);

  const setRowProduct = (rowId: string, product: ProductResponseDTO) =>
    setRows((rs) => rs.map((r) => (r.id === rowId ? { ...r, product } : r)));

  const setRowQty = (rowId: string, qty: number) =>
    setRows((rs) => rs.map((r) => (r.id === rowId ? { ...r, qty } : r)));

  const removeRow = (rowId: string) =>
    setRows((rs) => rs.filter((r) => r.id !== rowId));

  const confirm = async () => {
    setErr("");
    setOk("");
    const items: StockIncrementItem[] = rows
      .filter((r) => r.product && r.qty !== 0)
      .map((r) => ({ productId: r.product!.id, delta: r.qty }));

    if (items.length === 0) {
      setErr("Please add at least one product with a non-zero quantity.");
      return;
    }

    try {
      const res = await incrementStocks(items);
      setOk(`Updated ${res.updated.length} product(s).`);
      clearRows();
    } catch (e) {
      setErr(getErrorMessage(e, "Failed to update stocks"));
    }
  };

  useEffect(() => {
    if (rows.length === 0) addRow();
  }, []);

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
        <h1 className="text-2xl font-semibold">Stock Mutation</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={addRow}
            className="rounded-xl border-2 !transition-none hover:!bg-white hover:!opacity-100"
          >
            + Add Product
          </Button>
          <Button
            variant="outline"
            onClick={clearRows}
            className="rounded-xl border-2 !transition-none hover:!bg-white hover:!opacity-100"
          >
            Clear
          </Button>
        </div>
      </div>

      {ok && (
        <div className="rounded-lg bg-white border-2 border-[#03AC0E] px-6 py-3 text-sm font-medium text-green-700 shadow">
          {ok}
        </div>
      )}
      {err && (
        <div className="rounded-lg bg-white border-2 border-red-500 px-6 py-3 text-sm font-medium text-red-700 shadow">
          {err}
        </div>
      )}

      <Card>
        <div className="space-y-3">
          {rows.map((r) => {
            const firstImg = r.product?.images?.[0];
            const thumb = imgSrc(firstImg);
            return (
              <div
                key={r.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl overflow-hidden border border-[#03AC0E]/30 bg-gray-100 flex items-center justify-center">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={r.product?.name || "thumb"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium line-clamp-1">
                      {r.product?.name || "Select a product"}
                    </div>
                    <div className="text-xs text-gray-500 line-clamp-1">
                      {r.product
                        ? r.product.description
                        : "Click Select to choose"}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-xl border-2 !transition-none hover:!bg-white hover:!opacity-100"
                    onClick={() => setPickerOpen({ rowId: r.id })}
                  >
                    Select
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    className="w-24 text-center"
                    value={String(r.qty)}
                    onChange={(e) =>
                      setRowQty(
                        r.id,
                        Number.isFinite(+e.target.value)
                          ? parseInt(e.target.value || "0", 10)
                          : 0
                      )
                    }
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    className="rounded-xl border-2 !border-red-500 !text-red-600 !transition-none hover:!bg-white hover:!opacity-100"
                    onClick={() => removeRow(r.id)}
                  >
                    Remove
                  </Button>
                </div>

                {r.product && (
                  <div className="md:col-span-3 text-xs text-gray-500">
                    Current price: Rp{rupiah.format(r.product.price)} — Stock:{" "}
                    {r.product.stock}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 border-t border-[#03AC0E]/30 pt-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Lines: <span className="font-medium">{rows.length}</span> •
            Selected: <span className="font-medium">{summary.count}</span> •
            Total Changes: <span className="font-medium">{summary.sum}</span>
          </div>
          <Button
            onClick={confirm}
            className="rounded-xl bg-[#03AC0E] border-2 border-[#03AC0E] text-white !transition-none hover:!bg-[#03AC0E] hover:!opacity-100"
          >
            Confirm Update
          </Button>
        </div>
      </Card>

      {pickerOpen && (
        <ProductPickerModal
          q={pickerQ}
          setQ={setPickerQ}
          loading={pickerLoading}
          error={pickerErr}
          products={products}
          page={page}
          totalPages={totalPages}
          onPick={(p) => {
            setRowProduct(pickerOpen.rowId, p);
            setPickerOpen(null);
          }}
          onClose={() => setPickerOpen(null)}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onGoto={(p) => setPage(p)}
        />
      )}
    </div>
  );
}

function ProductPickerModal(props: {
  q: string;
  setQ: (s: string) => void;
  loading: boolean;
  error: string;
  products: ProductResponseDTO[];
  page: number;
  totalPages: number;
  onPick: (p: ProductResponseDTO) => void;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onGoto: (p: number) => void;
}) {
  const {
    q,
    setQ,
    loading,
    error,
    products,
    page,
    totalPages,
    onPick,
    onClose,
    onNext,
    onPrev,
    onGoto,
  } = props;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="picker-title"
    >
      <div
        className="w-[92vw] max-w-3xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <Card>
          <div className="p-1 flex items-center justify-between sticky top-0 bg-white z-10 border-b border-gray-100">
            <div className="space-y-0.5">
              <div className="text-sm text-gray-500">Select Product</div>
              <div id="picker-title" className="font-semibold">
                Choose a product to mutate
              </div>
            </div>
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-xl border-2 !transition-none hover:!bg-white hover:!opacity-100"
            >
              Close
            </Button>
          </div>

          <div className="px-3 pb-3">
            <Input
              placeholder="Search product by name…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          {error && (
            <div className="px-3 pb-2 text-sm text-red-600">{error}</div>
          )}

          {loading ? (
            <div className="px-3 pb-4 text-sm text-gray-600 flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#03AC0E] border-t-transparent" />
              Loading…
            </div>
          ) : products.length === 0 ? (
            <div className="px-3 pb-4 text-sm text-gray-600">
              No products found.
            </div>
          ) : (
            <>
              <div className="px-3 pb-2 grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto">
                {products.map((p) => {
                  const img = p.images?.[0];
                  const src = imgSrc(img);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onPick(p)}
                      className="text-left rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#03AC0E]/50 select-text selection:bg-emerald-200 selection:text-emerald-950"
                    >
                      <div className="h-28 w-full rounded-t-xl overflow-hidden border-b border-gray-100 bg-gray-100 flex items-center justify-center">
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
                      <div className="p-2 space-y-0.5 selection:bg-emerald-200 selection:text-emerald-950">
                        <div className="font-medium line-clamp-1 text-black">
                          {p.name}
                        </div>
                        <div className="text-xs text-black line-clamp-2">
                          {p.description}
                        </div>
                        <div className="text-xs text-black">
                          Stock: {p.stock} • Rp{rupiah.format(p.price)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="px-3 pb-4 pt-3">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPrev={onPrev}
                  onNext={onNext}
                  onGoto={onGoto}
                />
                <div className="mt-2 text-center text-sm text-gray-500">
                  Page <span className="font-semibold">{page}</span> of{" "}
                  <span className="font-semibold">{totalPages}</span>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function Pagination(props: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onGoto: (p: number) => void;
}) {
  const { page, totalPages, onPrev, onNext, onGoto } = props;

  const span = 2;
  const nums: number[] = [];
  const start = Math.max(1, page - span);
  const end = Math.min(totalPages, page + span);
  if (start > 1) nums.push(1);
  if (start > 2) nums.push(-1);
  for (let i = start; i <= end; i++) nums.push(i);
  if (end < totalPages - 1) nums.push(-1);
  if (end < totalPages) nums.push(totalPages);

  const baseBtn =
    "[all:unset] inline-flex items-center justify-center cursor-pointer " +
    "rounded-full h-10 min-w-10 px-4 text-base font-medium select-none " +
    "transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400";

  const ghost = `${baseBtn} border border-gray-200 bg-white text-gray-800`;
  const ghostDisabled = `${baseBtn} border border-gray-200 bg-white text-gray-400 opacity-60 cursor-not-allowed`;
  const solidActive = `${baseBtn} border-2 border-emerald-600 bg-emerald-600 text-white`;

  return (
    <div
      className="w-full flex justify-center"
      role="navigation"
      aria-label="Pagination"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" && page > 1) onPrev();
        if (e.key === "ArrowRight" && page < totalPages) onNext();
      }}
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white p-2 shadow-md">
        <button
          type="button"
          onClick={() => onGoto(1)}
          disabled={page === 1}
          className={page === 1 ? ghostDisabled : ghost}
          aria-label="First page"
        >
          <span aria-hidden>«</span>
          <span className="hidden sm:inline ml-2">First</span>
        </button>
        <button
          type="button"
          onClick={onPrev}
          disabled={page === 1}
          className={page === 1 ? ghostDisabled : ghost}
          aria-label="Previous page"
        >
          <span aria-hidden>‹</span>
          <span className="hidden sm:inline ml-2">Prev</span>
        </button>

        {nums.map((n, i) =>
          n === -1 ? (
            <span
              key={`dots-${i}`}
              className="px-2 text-base text-gray-400 select-none"
            >
              …
            </span>
          ) : (
            <button
              key={n}
              type="button"
              onClick={() => onGoto(n)}
              aria-current={n === page ? "page" : undefined}
              className={n === page ? solidActive : ghost}
            >
              {n}
            </button>
          )
        )}

        <button
          type="button"
          onClick={onNext}
          disabled={page === totalPages}
          className={page === totalPages ? ghostDisabled : ghost}
          aria-label="Next page"
        >
          <span className="hidden sm:inline mr-2">Next</span>
          <span aria-hidden>›</span>
        </button>
        <button
          type="button"
          onClick={() => onGoto(totalPages)}
          disabled={page === totalPages}
          className={page === totalPages ? ghostDisabled : ghost}
          aria-label="Last page"
        >
          <span className="hidden sm:inline mr-2">Last</span>
          <span aria-hidden>»</span>
        </button>
      </div>
    </div>
  );
}
