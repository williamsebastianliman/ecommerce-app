import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../state/auth-context";
import { getUserById, updateUser } from "../../api/users.api";
import type { UserResponseDto, UpdateUserDTO } from "../../dto/user.dto";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { getErrorMessage } from "../../lib/errors";

export default function ProfilePage() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState<UserResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const [nameError, setNameError] = useState("");
  const [addressError, setAddressError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        setErr("");
        const data = await getUserById(user.id);
        setProfile(data);
        setName(data.name);
        setAddress(data.address);
      } catch (e) {
        setErr(getErrorMessage(e, "Failed to load profile"));
      } finally {
        setLoading(false);
      }
    };

    void fetchProfile();
  }, [user]);

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

  const validate = (): boolean => {
    let isValid = true;
    setNameError("");
    setAddressError("");

    if (name.trim().length < 4) {
      setNameError("Name must be at least 4 characters!");
      isValid = false;
    } else if (name.trim().length > 30) {
      setNameError("Name cannot be more than 30 characters!");
      isValid = false;
    }

    if (address.trim().length < 5) {
      setAddressError("Address must be at least 5 characters!");
      isValid = false;
    } else if (address.trim().length > 100) {
      setAddressError("Address cannot be more than 100 characters!");
      isValid = false;
    }

    return isValid;
  };

  const handleSave = async () => {
    if (!user?.id) return;

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      setErr("");
      const dto: UpdateUserDTO = {
        id: user.id,
        name: name.trim(),
        address: address.trim(),
      };
      const updated = await updateUser(dto);
      setProfile(updated);
      setSuccessMsg("Profile updated successfully!");
    } catch (e) {
      setErr(getErrorMessage(e, "Failed to update profile"));
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    profile && (name !== profile.name || address !== profile.address);

  if (loading) {
    return (
      <div className="pastel-dot-bg">
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#03AC0E] border-t-transparent" />
          Loading profile…
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="pastel-dot-bg">
        <Card>
          <div className="text-sm text-gray-500">Failed to load profile.</div>
        </Card>
      </div>
    );
  }

  return (
    <>
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
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-2xl font-semibold">My Profile</h1>

          <Card>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Profile Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600">
                  {profile.email}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <div className="inline-flex items-center rounded-xl border-2 border-[#03AC0E]/60 bg-[#03AC0E]/5 px-3 py-1 text-sm font-medium text-[#03AC0E]">
                  {profile.role}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameError("");
                  }}
                  className={`border-2 ${
                    nameError
                      ? "border-red-500 focus:ring-red-500"
                      : "border-[#03AC0E]/60 focus:ring-[#03AC0E]/60"
                  }`}
                  placeholder="Enter your name"
                />
                {nameError && (
                  <p className="mt-1 text-xs text-red-600">{nameError}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setAddressError("");
                  }}
                  className={`w-full rounded-xl border-2 px-4 py-2 text-sm focus:outline-none focus:ring-2 ${
                    addressError
                      ? "border-red-500 focus:ring-red-500"
                      : "border-[#03AC0E]/60 focus:ring-[#03AC0E]/60"
                  }`}
                  rows={3}
                  placeholder="Enter your address"
                />
                {addressError && (
                  <p className="mt-1 text-xs text-red-600">{addressError}</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSave}
                  isLoading={saving}
                  disabled={!hasChanges || saving}
                  className="flex-1 rounded-xl bg-[#03AC0E] border-2 border-[#03AC0E] text-white px-5 py-2 hover:bg-[#03940C] focus:ring-[#03AC0E] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving…
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Account Details
              </h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Account ID:</span>
                  <span className="font-medium text-gray-900">
                    {profile.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(profile.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
