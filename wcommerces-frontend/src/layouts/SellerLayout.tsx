import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../state/auth-context";
import Button from "../components/ui/Button";
import clsx from "clsx";

export default function SellerLayout() {
  const { user, logout } = useContext(AuthContext);
  const nav = useNavigate();

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    clsx(
      "px-2 sm:px-3 py-2 rounded-lg sm:rounded-xl transition !text-white flex items-center gap-1 sm:gap-1.5 shrink-0",
      isActive ? "bg-white/20" : "hover:bg-white/10"
    );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9]">
      <header className="sticky top-0 z-10 bg-[#03AC0E] text-white shadow-md [&_a]:!text-white [&_a:hover]:!text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2">
          <NavLink
            to="/seller"
            end
            className="font-semibold tracking-wide text-base sm:text-lg shrink-0"
          >
            Seller Center
          </NavLink>

          <nav className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
            <NavLink to="/seller" end className={linkCls} aria-label="Products">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 7.5l-8.25 4.5L3.75 7.5m16.5 0v9a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 16.5v-9m16.5 0L12 3.75 3.75 7.5"
                />
              </svg>
              <span className="sr-only sm:not-sr-only sm:inline">Products</span>
            </NavLink>

            <NavLink
              to="/seller/profile"
              className={linkCls}
              aria-label="Profile"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.5-1.632z"
                />
              </svg>
              <span className="sr-only sm:not-sr-only sm:inline">Profile</span>
            </NavLink>

            <NavLink to="/seller/stock" className={linkCls} aria-label="Stock">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5m-13.5 3h10.5m-12 3h13.5m-15 3h16.5"
                />
              </svg>
              <span className="sr-only sm:not-sr-only sm:inline">Stock</span>
            </NavLink>

            {user && (
              <span className="hidden md:block text-sm text-white/90 truncate max-w-[180px] px-1.5">
                {user.email}
              </span>
            )}

            <Button
              variant="outline"
              onClick={() => {
                logout();
                nav("/login");
              }}
              className="rounded-lg sm:rounded-xl !bg-white !text-[#03AC0E] !border !border-white hover:!bg-white/90 focus:!ring-white flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                />
              </svg>
              <span className="sr-only sm:not-sr-only sm:inline">Logout</span>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-5 py-6 w-full">
        <Outlet />
      </main>

      <footer className="bg-[#03AC0E] text-white">
        <div className="max-w-7xl mx-auto px-5 py-3 text-sm text-center">
          Seller Center . WCommerceS
        </div>
      </footer>
    </div>
  );
}
