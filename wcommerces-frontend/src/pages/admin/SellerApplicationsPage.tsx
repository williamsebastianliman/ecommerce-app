import { useEffect, useMemo, useRef, useState } from "react";
import {
  listSellerApplications,
  approveSellerApplication,
  rejectSellerApplication,
} from "../../api/seller.api";
import type {
  SellerApplicationDto,
  ListSellerApplicationDto,
} from "../../dto/seller.dto";
import type { PaginatedResponse } from "../../dto/product.dto";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { getErrorMessage } from "../../lib/errors";

export default function SellerApplicationsPage() {
  const [applications, setApplications] = useState<SellerApplicationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "PENDING" | "APPROVED" | "REJECTED"
  >("PENDING");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [processingId, setProcessingId] = useState<string | null>(null);

  // Toast state
  const [successMsg, setSuccessMsg] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);

  // Prevent stale overwrites during rapid filter/page changes
  const seqRef = useRef(0);

  const fetchApplications = async (pg = page) => {
    const mySeq = ++seqRef.current;
    setLoading(true);
    setErr("");
    try {
      const query: ListSellerApplicationDto = {
        status: statusFilter,
        page: pg,
        pageSize,
      };
      const res: PaginatedResponse<SellerApplicationDto> =
        await listSellerApplications(query);

      if (mySeq !== seqRef.current) return;

      const data = res?.data ?? [];
      const t = res?.meta?.total ?? 0;
      const tp = Math.max(1, res?.meta?.totalPages ?? 1);

      setApplications(data);
      setTotal(t);
      setTotalPages(tp);

      // clamp page if server reports fewer pages than current
      if (pg > tp) setPage(tp);
    } catch (e) {
      if (mySeq !== seqRef.current) return;
      setErr(getErrorMessage(e, "Failed to load applications"));
      setApplications([]);
      setTotal(0);
      setTotalPages(1);
      if (page !== 1) setPage(1);
    } finally {
      if (mySeq === seqRef.current) setLoading(false);
    }
  };

  // Load on filter or page change
  useEffect(() => {
    void fetchApplications(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page]);

  // Success toast animation
  useEffect(() => {
    if (successMsg) {
      setShowSuccessToast(true);
      const timer = window.setTimeout(() => {
        setShowSuccessToast(false);
        window.setTimeout(() => setSuccessMsg(""), 300);
      }, 2700);
      return () => window.clearTimeout(timer);
    }
  }, [successMsg]);

  // Error toast animation
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

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    setErr("");
    try {
      await approveSellerApplication(id);
      setSuccessMsg("Application approved successfully!");
      await fetchApplications(); // refresh current page
    } catch (e) {
      setErr(getErrorMessage(e, "Failed to approve application"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    setErr("");
    try {
      await rejectSellerApplication(id);
      setSuccessMsg("Application rejected successfully!");
      await fetchApplications(); // refresh current page
    } catch (e) {
      setErr(getErrorMessage(e, "Failed to reject application"));
    } finally {
      setProcessingId(null);
    }
  };

  // Build page number window (first/last with ellipses)
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

  return (
    <>
      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none">
        <div className="flex flex-col gap-3">
          {successMsg && (
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
                  <span>{successMsg}</span>
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

      <div className="pastel-dot-bg">
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">Seller Applications</h1>

          {/* Filter Card */}
          <Card>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                Filter by Status:
              </span>
              <div className="flex gap-2">
                {(["PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setStatusFilter(s);
                      setPage(1); // reset page on filter change
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                      statusFilter === s
                        ? "bg-[#03AC0E] text-white border-2 border-[#03AC0E]"
                        : "bg-white text-gray-700 border-2 border-gray-200 hover:border-[#03AC0E]/40"
                    }`}
                  >
                    {s[0] + s.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {loading ? (
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#03AC0E] border-t-transparent" />
              Loading applications…
            </div>
          ) : applications.length === 0 ? (
            <Card>
              <div className="text-center py-8 text-gray-500">
                No {statusFilter.toLowerCase()} applications found.
              </div>
            </Card>
          ) : (
            <>
              <div className="space-y-3">
                {applications.map((app) => (
                  <Card key={app.id}>
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {app.storeName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Submitted:{" "}
                            {new Date(app.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                            app.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700 border-2 border-yellow-300"
                              : app.status === "APPROVED"
                              ? "bg-green-100 text-green-700 border-2 border-green-300"
                              : "bg-red-100 text-red-700 border-2 border-red-300"
                          }`}
                        >
                          {app.status}
                        </div>
                      </div>

                      {/* Description */}
                      {app.description && (
                        <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-3">
                          <p className="text-sm text-gray-700">
                            {app.description}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      {app.status === "PENDING" ? (
                        <div className="flex gap-3 pt-2">
                          <Button
                            onClick={() => handleApprove(app.id)}
                            isLoading={processingId === app.id}
                            disabled={processingId !== null}
                            className="flex-1 rounded-xl bg-[#03AC0E] border-2 border-[#03AC0E] text-white hover:bg-[#03940C]"
                          >
                            {processingId === app.id ? (
                              <span className="inline-flex items-center gap-2">
                                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Processing…
                              </span>
                            ) : (
                              "Approve"
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleReject(app.id)}
                            isLoading={processingId === app.id}
                            disabled={processingId !== null}
                            className="flex-1 rounded-xl border-2 border-red-500 text-red-600 hover:bg-red-50"
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 italic">
                          This application has already been{" "}
                          {app.status.toLowerCase()}.
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <Card>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-medium">
                      {(page - 1) * pageSize + 1}
                    </span>
                    –
                    <span className="font-medium">
                      {Math.min(page * pageSize, total)}
                    </span>{" "}
                    of <span className="font-medium">{total}</span>
                  </div>

                  <div className="flex items-center gap-2">
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
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
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
        </div>
      </div>
    </>
  );
}
