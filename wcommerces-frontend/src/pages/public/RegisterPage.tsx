import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../../api/auth.api";
import { AuthContext } from "../../state/auth-context";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Alert from "../../components/ui/Alert";
import axios from "axios";
import TextArea from "../../components/ui/TextArea";

type FieldErrors = Partial<
  Record<"name" | "email" | "password" | "address", string>
>;

export default function RegisterPage() {
  const nav = useNavigate();
  const { setAuth } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");

  const [fieldErr, setFieldErr] = useState<FieldErrors>({});
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setFieldErr({});
    setLoading(true);
    try {
      const res = await register({ name, email, password, address });
      setAuth(res);
      const role = res.user.role;
      if (role === "ADMIN") nav("/admin");
      else if (role === "SELLER") nav("/seller");
      else nav("/");
    } catch (ex: unknown) {
      // Handle field errors: { statusCode:400, error:"Bad Request", message:{ field:[...messages] } }
      if (axios.isAxiosError(ex) && ex.response?.status === 400) {
        const data = ex.response.data as {
          statusCode?: number;
          error?: string;
          message?: Record<string, string[]>;
        };

        const m = data?.message ?? {};
        const nextFieldErr: FieldErrors = {};
        if (Array.isArray(m.name) && m.name[0]) nextFieldErr.name = m.name[0];
        if (Array.isArray(m.email) && m.email[0])
          nextFieldErr.email = m.email[0];
        if (Array.isArray(m.password) && m.password[0])
          nextFieldErr.password = m.password[0];
        if (Array.isArray(m.address) && m.address[0])
          nextFieldErr.address = m.address[0];

        if (Object.keys(nextFieldErr).length > 0) {
          setFieldErr(nextFieldErr);
        } else {
          setErr(
            (typeof data?.message === "string" && data.message) ||
              ex.message ||
              "Register failed"
          );
        }
      } else {
        setErr(
          axios.isAxiosError(ex)
            ? (ex.response?.data as { message?: string } | undefined)
                ?.message ??
                ex.message ??
                "Register failed"
            : ex instanceof Error
            ? ex.message
            : "Register failed"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const onName = (v: string) => {
    setName(v);
    if (fieldErr.name) setFieldErr((e) => ({ ...e, name: undefined }));
  };
  const onEmail = (v: string) => {
    setEmail(v);
    if (fieldErr.email) setFieldErr((e) => ({ ...e, email: undefined }));
  };
  const onPassword = (v: string) => {
    setPassword(v);
    if (fieldErr.password) setFieldErr((e) => ({ ...e, password: undefined }));
  };
  const onAddress = (v: string) => {
    setAddress(v);
    if (fieldErr.address) setFieldErr((e) => ({ ...e, address: undefined }));
  };

  return (
    <div className="pastel-dot-bg min-h-screen flex items-center justify-center px-4">
      <Card>
        <form onSubmit={submit} className="w-[320px] sm:w-[380px] space-y-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Create account</h1>
            <p className="text-sm text-gray-500">Join us in a minute.</p>
          </div>

          {err && <Alert>{err}</Alert>}

          <div>
            <Input
              label="Full Name"
              placeholder="Your name"
              value={name}
              onChange={(e) => onName(e.target.value)}
              autoComplete="name"
              required
              aria-invalid={!!fieldErr.name}
              className={
                fieldErr.name ? "border-red-500 focus:ring-red-500" : undefined
              }
            />
            {fieldErr.name && (
              <p className="mt-1 text-xs text-red-600">{fieldErr.name}</p>
            )}
          </div>

          <div>
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => onEmail(e.target.value)}
              autoComplete="email"
              required
              aria-invalid={!!fieldErr.email}
              className={
                fieldErr.email ? "border-red-500 focus:ring-red-500" : undefined
              }
            />
            {fieldErr.email && (
              <p className="mt-1 text-xs text-red-600">{fieldErr.email}</p>
            )}
          </div>

          <div>
            <Input
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => onPassword(e.target.value)}
              autoComplete="new-password"
              required
              aria-invalid={!!fieldErr.password}
              className={
                fieldErr.password
                  ? "border-red-500 focus:ring-red-500"
                  : undefined
              }
            />
            {fieldErr.password && (
              <p className="mt-1 text-xs text-red-600">{fieldErr.password}</p>
            )}
          </div>

          <div>
            <TextArea
              label="Address"
              placeholder="Street, city, province, postal code"
              value={address}
              onChange={(e) => onAddress(e.target.value)}
              required
              aria-invalid={!!fieldErr.address}
              className={
                fieldErr.address
                  ? "border-red-500 focus:ring-red-500"
                  : undefined
              }
            />
            {fieldErr.address && (
              <p className="mt-1 text-xs text-red-600">{fieldErr.address}</p>
            )}
          </div>

          <Button className="w-full" isLoading={loading} disabled={loading}>
            Register
          </Button>

          <div className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link className="text-[#03AC0E] hover:underline" to="/login">
              Sign in
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
