src/
├── api/
│ ├── auth.api.ts
│ ├── product.api.ts
│ ├── seller.api.ts
│ ├── cart.api.ts
│ └── order.api.ts
├── components/
│ ├── common/
│ │ ├── Button.tsx
│ │ ├── Input.tsx
│ │ ├── Card.tsx
│ │ ├── Modal.tsx
│ │ ├── ImageUpload.tsx
│ │ └── Spinner.tsx
│ ├── layout/
│ │ ├── AdminLayout.tsx
│ │ ├── SellerLayout.tsx
│ │ ├── UserLayout.tsx
│ │ ├── Navbar.tsx
│ │ └── Sidebar.tsx
│ ├── product/
│ │ ├── ProductCard.tsx
│ │ ├── ProductGrid.tsx
│ │ ├── ProductForm.tsx
│ │ └── ImagePreview.tsx
│ └── seller/
│ ├── ApplicationCard.tsx
│ └── ProfileForm.tsx
├── hooks/
│ ├── useAuth.ts
│ ├── useCart.ts
│ └── useProduct.ts
├── contexts/
│ ├── AuthContext.tsx
│ └── CartContext.tsx
├── dto/
│ ├── auth.dto.ts
│ ├── product.dto.ts
│ ├── seller.dto.ts
│ ├── cart.dto.ts
│ └── order.dto.ts
├── pages/
│ ├── auth/
│ │ ├── Login.tsx
│ │ └── Register.tsx
│ ├── admin/
│ │ ├── SellerApplications.tsx
│ │ └── ApplicationDetails.tsx
│ ├── seller/
│ │ ├── Profile.tsx
│ │ ├── Products.tsx
│ │ ├── ProductDetail.tsx
│ │ ├── NewProduct.tsx
│ │ └── StockManagement.tsx
│ └── user/
│ ├── Home.tsx
│ ├── ProductList.tsx
│ ├── ProductDetail.tsx
│ ├── Cart.tsx
│ └── Checkout.tsx
├── styles/
│ ├── variables.css
│ ├── components.css
│ └── pages.css
├── types/
│ ├── auth.types.ts
│ ├── product.types.ts
│ └── seller.types.ts
└── utils/
├── api.ts
├── validation.ts
└── helpers.ts
