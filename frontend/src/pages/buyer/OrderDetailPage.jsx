import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import * as orderService from "../../services/orderService";
import Navbar from "../../components/shared/Navbar";

const statusSteps = ["pending", "paid", "processing", "shipped", "delivered"];

const statusConfig = {
  pending: { label: "Menunggu Pembayaran", icon: "⏳" },
  paid: { label: "Pembayaran Diterima", icon: "✅" },
  processing: { label: "Sedang Diproses", icon: "🔧" },
  shipped: { label: "Dalam Pengiriman", icon: "🚚" },
  delivered: { label: "Pesanan Selesai", icon: "📦" },
  cancelled: { label: "Dibatalkan", icon: "❌" },
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const formatRupiah = (amount) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderService.getOrderById(id);
        setOrder(res.data);
      } catch {
        toast.error("Pesanan tidak ditemukan");
        navigate("/orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleConfirmReceived = async () => {
    setConfirmLoading(true);
    try {
      await orderService.confirmOrderReceived(id);
      toast.success("Pesanan dikonfirmasi diterima!");
      // Refresh data
      const res = await orderService.getOrderById(id);
      setOrder(res.data);
    } catch {
      toast.error("Gagal mengkonfirmasi pesanan");
    } finally {
      setConfirmLoading(false);
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

  const currentStepIndex = statusSteps.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/orders")}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Kembali
          </button>
          <h1 className="text-xl font-bold text-gray-800">Detail Pesanan</h1>
        </div>

        {/* Order ID & Tanggal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 mb-1">ID Pesanan</p>
              <p className="font-mono text-sm font-medium text-gray-800">
                #{order._id.slice(-12).toUpperCase()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-1">Tanggal</p>
              <p className="text-sm text-gray-600">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Status Tracker */}
        {!isCancelled ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
            <h3 className="font-semibold text-gray-800 mb-5">Status Pesanan</h3>
            <div className="relative">
              {/* Progress line */}
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200">
                <div
                  className="h-full bg-orange-400 transition-all duration-500"
                  style={{
                    width:
                      currentStepIndex <= 0
                        ? "0%"
                        : `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between relative">
                {statusSteps.map((step, index) => {
                  const config = statusConfig[step];
                  const isDone = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  return (
                    <div
                      key={step}
                      className="flex flex-col items-center gap-2"
                      style={{ width: "20%" }}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm z-10 transition-all ${
                          isDone
                            ? "bg-orange-500 text-white"
                            : "bg-gray-200 text-gray-400"
                        } ${isCurrent ? "ring-4 ring-orange-100" : ""}`}
                      >
                        {isDone ? "✓" : index + 1}
                      </div>
                      <p
                        className={`text-xs text-center leading-tight ${
                          isDone
                            ? "text-orange-600 font-medium"
                            : "text-gray-400"
                        }`}
                      >
                        {config.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 text-center">
            <p className="text-red-600 font-semibold">❌ Pesanan Dibatalkan</p>
          </div>
        )}

        {/* Produk */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
          <h3 className="font-semibold text-gray-800 mb-4">🛒 Produk</h3>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item._id} className="flex items-center gap-4">
                <img
                  src={
                    item.product?.image
                      ? `http://localhost:5000${item.product.image}`
                      : "/placeholder.png"
                  }
                  alt={item.product?.name}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">
                    {item.product?.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatRupiah(item.price)} x {item.quantity}
                  </p>
                </div>
                <p className="font-bold text-sm text-gray-800">
                  {formatRupiah(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between">
            <span className="font-semibold text-gray-700">Total</span>
            <span className="font-bold text-orange-600 text-lg">
              {formatRupiah(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Alamat */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
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

        {/* Catatan */}
        {order.notes && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">📝 Catatan</h3>
            <p className="text-sm text-gray-600">{order.notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {order.status === "pending" && (
            <button
              onClick={() => navigate(`/payment/${order._id}`)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Bayar Sekarang
            </button>
          )}
          {order.status === "shipped" && (
            <button
              onClick={handleConfirmReceived}
              disabled={confirmLoading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {confirmLoading
                ? "Memproses..."
                : "✅ Konfirmasi Pesanan Diterima"}
            </button>
          )}
          {order.status === "delivered" && (
            <Link
              to={`/review/${order._id}`}
              className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              ⭐ Beri Ulasan
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
