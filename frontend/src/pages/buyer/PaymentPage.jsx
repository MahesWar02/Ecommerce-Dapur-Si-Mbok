import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as orderService from "../../services/orderService";
import Navbar from "../../components/shared/Navbar";

const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);

  const formatRupiah = (amount) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderService.getOrderById(id);
        setOrder(res.data);
      } catch {
        toast.error("Pesanan tidak ditemukan");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  // Load Snap.js Midtrans
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute(
      "data-client-key",
      import.meta.env.VITE_MIDTRANS_CLIENT_KEY,
    );
    script.async = true;
    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, []);

  const handlePay = async () => {
    setPayLoading(true);
    try {
      const res = await orderService.getPaymentToken(id);
      const { token } = res.data;

      window.snap.pay(token, {
        onSuccess: () => {
          toast.success("Pembayaran berhasil!");
          navigate(`/orders/${id}?status=success`);
        },
        onPending: () => {
          toast.info("Menunggu pembayaran...");
          navigate(`/orders/${id}?status=pending`);
        },
        onError: () => {
          toast.error("Pembayaran gagal");
        },
        onClose: () => {
          toast.info("Popup ditutup");
        },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal memproses pembayaran");
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Pembayaran</h1>

        {/* Status pesanan */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Detail Pesanan</h3>
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full ${
                order.status === "paid"
                  ? "bg-green-100 text-green-700"
                  : order.status === "cancelled"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {order.status === "pending"
                ? "Menunggu Pembayaran"
                : order.status === "paid"
                  ? "Sudah Dibayar"
                  : order.status === "cancelled"
                    ? "Dibatalkan"
                    : order.status}
            </span>
          </div>

          {/* Daftar item */}
          <div className="space-y-3 mb-4">
            {order.items.map((item) => (
              <div key={item._id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.product?.name} x{item.quantity}
                </span>
                <span className="font-medium">
                  {formatRupiah(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-gray-800">
            <span>Total</span>
            <span className="text-orange-600">
              {formatRupiah(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Alamat pengiriman */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">
            📍 Alamat Pengiriman
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="font-medium text-gray-800">
              {order.shippingAddress.recipientName}
            </p>
            <p>{order.shippingAddress.phone}</p>
            <p>{order.shippingAddress.address}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.postalCode}
            </p>
          </div>
        </div>

        {/* Tombol bayar */}
        {order.status === "pending" && (
          <button
            onClick={handlePay}
            disabled={payLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {payLoading ? "Memuat..." : "Bayar Sekarang"}
          </button>
        )}

        {order.status === "paid" && (
          <div className="text-center py-4">
            <p className="text-green-600 font-semibold text-lg mb-3">
              ✅ Pembayaran selesai
            </p>
            <button
              onClick={() => navigate("/orders")}
              className="text-orange-500 hover:underline text-sm"
            >
              Lihat semua pesanan →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
