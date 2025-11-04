import { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../state/auth-context";
import { me } from "../api/auth.api";
import { getAccessToken } from "../lib/storage";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#03AC0E] border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function RequireRole({
  role,
  children,
}: {
  role: "ADMIN" | "SELLER" | "USER";
  children: React.ReactNode;
}) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#03AC0E] border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function RequireValidToken({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [validating, setValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      const token = getAccessToken();

      if (!token) {
        setIsValid(false);
        setValidating(false);
        return;
      }

      try {
        await me();
        setIsValid(true);
      } catch (error) {
        console.error("Token validation failed:", error);
        setIsValid(false);
      } finally {
        setValidating(false);
      }
    };

    void validateToken();
  }, []);

  if (validating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#03AC0E] border-t-transparent" />
      </div>
    );
  }

  if (!isValid) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
