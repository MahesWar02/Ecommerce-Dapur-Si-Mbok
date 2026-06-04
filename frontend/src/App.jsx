import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser } from "./store/slices/authSlice";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import HomePage from "./pages/buyer/HomePage";
import ProductListPage from "./pages/buyer/ProductListPage";
import ProductDetailPage from "./pages/buyer/ProductDetailPage";
import CartPage from "./pages/buyer/CartPage";
import CheckoutPage from "./pages/buyer/CheckoutPage";
import PaymentPage from "./pages/buyer/PaymentPage";
import MyOrdersPage from "./pages/buyer/MyOrdersPage";
import OrderDetailPage from "./pages/buyer/OrderDetailPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/buyer/ProfilePage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import AdminRoute from "./components/admin/AdminRoute";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminOrderDetailPage from "./pages/admin/AdminOrderDetailPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import ReviewPage from "./pages/buyer/ReviewPage";
import AdminSalesReportPage from "./pages/admin/AdminSalesReportPage";
import AdminOfflineOrderPage from "./pages/admin/AdminOfflineOrderPage";

function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  useEffect(() => {
    if (token) dispatch(fetchCurrentUser());
  }, []);
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductListPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/payment/:id" element={<PaymentPage />} />
      <Route path="/orders" element={<MyOrdersPage />} />
      <Route path="/orders/:id" element={<OrderDetailPage />} />
      <Route path="/review/:orderId" element={<ReviewPage />} />

      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route
        path="/admin/products"
        element={
          <AdminRoute>
            <AdminProductsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <AdminRoute>
            <AdminOrdersPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/orders/:id"
        element={
          <AdminRoute>
            <AdminOrderDetailPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/sales-report"
        element={
          <AdminRoute>
            <AdminSalesReportPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/offline-order"
        element={
          <AdminRoute>
            <AdminOfflineOrderPage />
          </AdminRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
