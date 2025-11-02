// src/routes/RoleRedirect.tsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../state/auth-context";

export default function RoleRedirect() {
  const { role, loading } = useContext(AuthContext);

  // Avoid flashing the wrong redirect while auth hydrates
  if (loading) return null; // or a small spinner

  if (role === "ADMIN") return <Navigate to="/admin" replace />;
  if (role === "SELLER") return <Navigate to="/seller" replace />;

  // Unknown / USER / no token -> storefront
  return <Navigate to="/" replace />;
}
