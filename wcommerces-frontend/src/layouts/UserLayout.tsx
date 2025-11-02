import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../state/auth-context";
import Button from "../components/ui/Button";
import clsx from "clsx";

export default function UserLayout() {
  const { user, logout } = useContext(AuthContext);
  const nav = useNavigate();

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    clsx(
      "px-3 py-2 rounded-xl transition !text-white flex items-center gap-1.5",
      isActive ? "bg-white/20" : "hover:bg-white/10"
    );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9]">
      <header className="sticky top-0 z-10 bg-[#03AC0E] text-white shadow-md [&_a]:!text-white [&_a:hover]:!text-white">
        <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between gap-3">
          <NavLink to="/" className="font-semibold tracking-wide text-lg">
            WCommerceS
          </NavLink>

          <nav className="flex items-center gap-2">
            {/* Cart */}
            <NavLink to="/cart" className={linkCls}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
              <span className="hidden sm:inline">Cart</span>
            </NavLink>

            {user ? (
              <>
                {/* Profile */}
                <NavLink to="/profile" className={linkCls}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Profile</span>
                </NavLink>

                {/* Transaction */}
                <NavLink to="/transaction" className={linkCls}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Transaction</span>
                </NavLink>

                {/* Apply as Seller */}
                {user.role !== "SELLER" && (
                  <NavLink to="/apply" className={linkCls}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M3 7.5A2.5 2.5 0 015.5 5h13A2.5 2.5 0 0121 7.5V9H3V7.5zM3 10.5h18V16a3 3 0 01-3 3H6a3 3 0 01-3-3v-5.5z" />
                      <path d="M12 12.75a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0V16.5H9.75a.75.75 0 010-1.5h1.5v-1.5a.75.75 0 01.75-.75z" />
                    </svg>
                    <span className="hidden sm:inline">Apply as Seller</span>
                  </NavLink>
                )}

                {/* User email (desktop only) */}
                <span className="hidden md:block text-sm text-white/90 truncate max-w-[150px] px-2">
                  {user.email}
                </span>

                {/* Logout */}
                <Button
                  variant="outline"
                  onClick={() => {
                    logout();
                    nav("/login");
                  }}
                  className="rounded-xl !bg-white !text-[#03AC0E] !border-2 !border-white hover:!bg-white/90 focus:!ring-white flex items-center gap-1.5"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                    />
                  </svg>
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkCls}>
                  Login
                </NavLink>
                <NavLink to="/register" className={linkCls}>
                  Register
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-5 py-6 w-full">
        <Outlet />
      </main>

      <footer className="bg-[#03AC0E] text-white">
        <div className="max-w-7xl mx-auto px-5 py-3 text-sm text-center">
          WcommerceS
        </div>
      </footer>
    </div>
  );
}
