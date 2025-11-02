import { useContext, useEffect, useMemo, useRef, useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { AuthContext } from "../../state/auth-context";
import {
  createSellerApplication,
  getLatestApplicationByUser,
  getSellerProfileByUserId,
} from "../../api/seller.api";
import type {
  SellerApplicationDto,
  SellerProfileDto,
} from "../../dto/seller.dto";

export default function ApplySellerPage() {
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [profile, setProfile] = useState<SellerProfileDto | null>(null);
  const [latest, setLatest] = useState<SellerApplicationDto | null>(null);

  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");

  const canSubmit = useMemo(
    () => storeName.trim().length >= 3 && !submitting,
    [storeName, submitting]
  );

  const seqRef = useRef(0);

  const load = async () => {
    if (!user) return;
    const mySeq = ++seqRef.current;
    setLoading(true);
    setErr("");
    try {
      const [p, l] = await Promise.allSettled([
        getSellerProfileByUserId(user.id),
        getLatestApplicationByUser(user.id),
      ]);
      if (mySeq !== seqRef.current) return;

      setProfile(p.status === "fulfilled" ? p.value : null);
      setLatest(l.status === "fulfilled" ? l.value : null);
    } catch (e) {
      if (mySeq !== seqRef.current) return;
      setErr(e instanceof Error ? e.message : "Failed to load status");
    } finally {
      if (mySeq === seqRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    if (user) void load();
  }, [user]);

  useEffect(() => {
    if (!successMsg) return;
    const t = window.setTimeout(() => setSuccessMsg(""), 2400);
    return () => window.clearTimeout(t);
  }, [successMsg]);

  useEffect(() => {
    if (!err) return;
    const t = window.setTimeout(() => setErr(""), 2400);
    return () => window.clearTimeout(t);
  }, [err]);

  if (!user) {
    return (
      <div className="text-sm text-gray-600 flex items-center gap-2">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#03AC0E] border-t-transparent" />
        Redirecting…
      </div>
    );
  }

  const statusCard = (() => {
    if (profile) {
      return (
        <Card>
          <div className="space-y-2">
            <div className="text-lg font-semibold">
              You are already a Seller
            </div>
            <div className="text-sm text-gray-600">
              Store: <span className="font-medium">{profile.storeName}</span>
            </div>
            {profile.description ? (
              <div className="text-sm text-gray-600">{profile.description}</div>
            ) : null}
          </div>
        </Card>
      );
    }
    if (
      latest &&
      (latest.status === "PENDING" || latest.status === "APPROVED")
    ) {
      const badgeCls =
        latest.status === "PENDING"
          ? "bg-yellow-100 text-yellow-700 border-2 border-yellow-300"
          : "bg-green-100 text-green-700 border-2 border-green-300";
      return (
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-lg font-semibold">Application Status</div>
              <div className="text-sm text-gray-600">
                Submitted: {new Date(latest.submittedAt).toLocaleString()}
              </div>
              <div className="mt-2 text-sm">
                Store: <span className="font-medium">{latest.storeName}</span>
              </div>
              {latest.description ? (
                <div className="mt-1 text-sm text-gray-600">
                  {latest.description}
                </div>
              ) : null}
            </div>
            <div
              className={`px-3 py-1 rounded-xl text-xs font-semibold ${badgeCls}`}
            >
              {latest.status}
            </div>
          </div>
        </Card>
      );
    }
    return null;
  })();

  const canShowForm = !profile && (!latest || latest.status === "REJECTED");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!canSubmit) {
      setErr("Store name must be at least 3 characters.");
      return;
    }
    setSubmitting(true);
    setErr("");
    try {
      await createSellerApplication({
        userId: user.id,
        storeName: storeName.trim(),
        description: description.trim() || undefined,
      });
      setSuccessMsg("Application submitted!");
      setStoreName("");
      setDescription("");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pastel-dot-bg">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Apply as Seller</h1>

        {loading ? (
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#03AC0E] border-t-transparent" />
            Loading…
          </div>
        ) : (
          <>
            {successMsg ? (
              <div className="rounded-lg bg-white border-2 border-[#03AC0E] px-6 py-3 text-sm font-medium text-green-700 shadow">
                {successMsg}
              </div>
            ) : null}
            {err ? (
              <div className="rounded-lg bg-white border-2 border-red-500 px-6 py-3 text-sm font-medium text-red-700 shadow">
                {err}
              </div>
            ) : null}

            {statusCard}

            {canShowForm && (
              <Card>
                <form onSubmit={onSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Store Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="e.g., Warung Sukses Jaya"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell us about your store…"
                      className="w-full min-h-[100px] rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#03AC0E]/40"
                    />
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
                          Submitting…
                        </span>
                      ) : (
                        "Submit Application"
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
