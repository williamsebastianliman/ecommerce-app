import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../state/auth-context";
import Button from "../components/ui/Button";
import clsx from "clsx";

export default function AdminLayout() {
  const nav = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    clsx(
      "px-2 sm:px-3 py-2 rounded-lg sm:rounded-xl transition !text-white flex items-center gap-1 sm:gap-1.5 shrink-0",
      isActive ? "bg-white/20" : "hover:bg-white/10"
    );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9]">
      <header className="sticky top-0 z-10 bg-[#03AC0E] text-white shadow-md [&_a]:!text-white [&_a:hover]:!text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2">
          <span className="font-semibold tracking-wide text-base sm:text-lg shrink-0">
            Admin Console
          </span>

          <nav className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
            <NavLink
              to="/admin"
              end
              className={linkCls}
              aria-label="Applications"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 sm:w-5 sm:h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                />
              </svg>
              <span className="sr-only sm:not-sr-only sm:inline">
                Applications
              </span>
            </NavLink>

            <span className="hidden md:block text-sm text-white/90 truncate max-w-[150px] px-1.5">
              {user?.email}
            </span>

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
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 sm:w-5 sm:h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
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
          Admin Console - WcommerceS
        </div>
      </footer>
    </div>
  );
}
