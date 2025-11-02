import { useContext, useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { AuthContext } from "../../state/auth-context";
import { getSellerProfileByUserId } from "../../api/seller.api";
import type { SellerProfileDto } from "../../dto/seller.dto";
import { getErrorMessage } from "../../lib/errors";

export default function SellerProfilePage() {
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [profile, setProfile] = useState<SellerProfileDto | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!user) return;
      setLoading(true);
      setErr("");
      try {
        const res = await getSellerProfileByUserId(user.id);
        if (!alive) return;
        setProfile(res);
      } catch (e) {
        if (!alive) return;
        setErr(getErrorMessage(e, "Failed to load seller profile"));
        setProfile(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user]);

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
        Loading profile…
      </div>
    );
  }

  return (
    <div className="pastel-dot-bg space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Seller Profile</h1>
        <Button variant="outline" disabled className="rounded-xl border-2">
          Read-only
        </Button>
      </div>

      {err && (
        <div className="rounded-lg bg-white border-2 border-red-500 px-6 py-3 text-sm font-medium text-red-700 shadow">
          {err}
        </div>
      )}

      {!profile ? (
        <Card>
          <div className="p-2 text-sm text-gray-600">
            No seller profile found for this account.
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500">Store Name</div>
                <div className="font-medium">{profile.storeName}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">User ID</div>
                <div className="font-mono text-sm break-all">
                  {profile.userId}
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-gray-500">Description</div>
                <div className="text-sm">
                  {profile.description || (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Created At</div>
                <div className="text-sm">
                  {new Date(profile.createdAt).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Updated At</div>
                <div className="text-sm">
                  {new Date(profile.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500">Account Email</div>
                <div className="text-sm">{user.email}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Role</div>
                <div className="text-sm">{user.role}</div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
