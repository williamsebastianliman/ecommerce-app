import { useEffect, useMemo, useState } from "react";
import { me } from "../api/auth.api";
import { AuthContext } from "./auth-context";
import type { AuthResponse } from "../dto/auth.dto";
import type { AuthState } from "./auth-context";
import { saveTokens, getAccessToken, clearTokens } from "../lib/storage";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<AuthState>({ loading: true });

  useEffect(() => {
    const init = async () => {
      const t = getAccessToken();
      if (!t) {
        setState({ loading: false });
        return;
      }
      try {
        const u = await me();
        setState({ user: u, token: t, role: u.role, loading: false });
      } catch {
        setState({ loading: false });
      }
    };
    void init();
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === null ||
        e.key === "access_token" ||
        e.key === "refresh_token"
      ) {
        const t = getAccessToken();
        if (!t) {
          setState({ loading: false });
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      setAuth: (r: AuthResponse) => {
        console.log("[AuthProvider.setAuth] got:", r);
        if (!r?.accessToken) console.error("No accessToken in response!");
        saveTokens(r.accessToken, r.refreshToken);
        setState({
          user: r.user,
          token: r.accessToken,
          role: r.user.role,
          loading: false,
        });
      },
      logout: () => {
        clearTokens();
        setState({ loading: false });
      },
    }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
