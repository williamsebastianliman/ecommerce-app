import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../state/auth-context";

export default function RoleRedirect() {
  const { role, loading } = useContext(AuthContext);

  if (loading) return null;

  if (role === "ADMIN") return <Navigate to="/admin" replace />;
  if (role === "SELLER") return <Navigate to="/seller" replace />;

  return <Navigate to="/" replace />;
}
