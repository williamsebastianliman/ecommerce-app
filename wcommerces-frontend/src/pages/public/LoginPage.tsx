import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../api/auth.api";
import { AuthContext } from "../../state/auth-context";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Alert from "../../components/ui/Alert";
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

export default function LoginPage() {
  const nav = useNavigate();
  const { setAuth } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await login({ email, password });
      setAuth(res);
      const role = res.user.role;
      if (role === "ADMIN") nav("/admin");
      else if (role === "SELLER") nav("/seller");
      else nav("/");
    } catch (e: unknown) {
      setErr(getAxiosMessage(e) ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pastel-dot-bg min-h-screen flex items-center justify-center px-4">
      <Card>
        <form onSubmit={submit} className="w-[320px] sm:w-[380px] space-y-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Sign in</h1>
            <p className="text-sm text-gray-500">Welcome back</p>
          </div>

          {err && <Alert>{err}</Alert>}

          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <Button className="w-full" isLoading={loading}>
            Login
          </Button>

          <div className="text-sm text-center text-gray-600">
            No account?{" "}
            <Link className="text-[#03AC0E] hover:underline" to="/register">
              Create one
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
