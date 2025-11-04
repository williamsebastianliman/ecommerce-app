// src/routes/router.tsx
import { createBrowserRouter } from "react-router-dom";

// Public pages
import LoginPage from "../pages/public/LoginPage";
import RegisterPage from "../pages/public/RegisterPage";

// Guards
import { RequireAuth, RequireRole } from "./guards";

// Layouts
import UserLayout from "../layouts/UserLayout";
import AdminLayout from "../layouts/AdminLayout";
import SellerLayout from "../layouts/SellerLayout";

// User pages
import HomePage from "../pages/user/HomePage";
import ProductDetail from "../pages/user/ProductDetail";
import CartPage from "../pages/user/CartPage";
import CheckoutPage from "../pages/user/CheckoutPage";
import TransactionHistoryPage from "../pages/user/TransactionHistoryPage";
import ProfilePage from "../pages/user/ProfilePage";

// Admin pages
import SellerApplicationsPage from "../pages/admin/SellerApplicationsPage";
import ApplySellerPage from "../pages/user/ApplySellerPage";
import SellerProductsPage from "../pages/seller/SellerProductsPage";
import SellerProductCreatePage from "../pages/seller/SellerProductCreatePage";
import SellerProductDetailPage from "../pages/seller/SellerProductDetailPage";
import RoleRedirect from "./RoleRedirect";
import StockAdjustPage from "../pages/seller/StockAdjustPage";
import SellerProfilePage from "../pages/seller/SellerProfilePage";
export const router = createBrowserRouter([
  // Public
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },

  // Admin (protected)
  {
    path: "/admin",
    element: (
      <RequireAuth>
        <RequireRole role="ADMIN">
          <AdminLayout />
        </RequireRole>
      </RequireAuth>
    ),
    children: [
      { index: true, element: <SellerApplicationsPage /> },
      // add more admin child routes here
    ],
  },

  // Seller (protected)
  {
    path: "/seller",
    element: (
      <RequireAuth>
        <RequireRole role="SELLER">
          <SellerLayout />
        </RequireRole>
      </RequireAuth>
    ),
    children: [
      { index: true, element: <SellerProductsPage /> },
      { path: "profile", element: <SellerProfilePage /> },
      { path: "products/create", element: <SellerProductCreatePage /> },
      { path: "p/:id", element: <SellerProductDetailPage /> },
      { path: "stock", element: <StockAdjustPage /> },
    ],
  },

  // User storefront (protected with token validation)
  {
    path: "/",
    element: (
      <RequireAuth>
        <RequireRole role="USER">
          <UserLayout />
        </RequireRole>
      </RequireAuth>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: "p/:id", element: <ProductDetail /> },
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "transaction", element: <TransactionHistoryPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "apply", element: <ApplySellerPage /> },
    ],
  },

  {
    path: "*",
    element: <RoleRedirect />,
  },
]);
