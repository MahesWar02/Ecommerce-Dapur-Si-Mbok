import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminLayout from "../../components/admin/AdminLayout";
import * as orderService from "../../services/orderService";

const statusConfig = {
  pending: {
    label: "Menunggu Pembayaran",
    color: "bg-yellow-100 text-yellow-700",
  },
  paid: { label: "Dibayar", color: "bg-blue-100 text-blue-700" },
  processing: { label: "Diproses", color: "bg-purple-100 text-purple-700" },
  shipped: { label: "Dikirim", color: "bg-indigo-100 text-indigo-700" },
  delivered: { label: "Selesai", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-700" },
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Menunggu Pembayaran" },
  { value: "paid", label: "Dibayar" },
  { value: "processing", label: "Diproses" },
  { value: "shipped", label: "Dikirim" },
  { value: "delivered", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
];

const statusSteps = ["pending", "paid", "processing", "shipped", "delivered"];

const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [updating, setUpdating] = useState(false);

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

  const fetchOrder = async () => {
    try {
      const res = await orderService.getOrderById(id);
      setOrder(res.data);
      setSelectedStatus(res.data.status);
    } catch {
      toast.error("Pesanan tidak ditemukan");
      navigate("/admin/orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (selectedStatus === order.status) {
      toast.info("Status tidak berubah");
      return;
    }
    setUpdating(true);
    try {
      await orderService.updateOrderStatus(id, selectedStatus);
      toast.success("Status berhasil diperbarui");
      await fetchOrder();
    } catch {
      toast.error("Gagal memperbarui status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
        </div>
      </AdminLayout>
    );
  }

  const currentStepIndex = statusSteps.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/admin/orders")}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Kembali
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Detail Pesanan</h1>
            <p className="text-xs text-gray-400 font-mono">
              #{order._id.slice(-12).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Status Tracker */}
        {!isCancelled ? (
          <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
            <h3 className="font-semibold text-gray-800 mb-5">
              Alur Status Pesanan
            </h3>
            <div className="relative">
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
                        className={`text-xs text-center leading-tight ${isDone ? "text-orange-600 font-medium" : "text-gray-400"}`}
                      >
                        {statusConfig[step]?.label}
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

        {/* Update Status Panel */}
        <div className="bg-white rounded-xl border border-orange-100 p-5 mb-4">
          <h3 className="font-semibold text-gray-800 mb-3">
            🔄 Perbarui Status
          </h3>
          <div className="flex gap-3 items-center">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleUpdateStatus}
              disabled={updating || selectedStatus === order.status}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {updating ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>

        {/* Info Pembeli */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
          <h3 className="font-semibold text-gray-800 mb-3">👤 Info Pembeli</h3>
          <div className="text-sm space-y-1 text-gray-600">
            <p>
              <span className="text-gray-400 w-20 inline-block">Nama</span>{" "}
              {order.user?.name}
            </p>
            <p>
              <span className="text-gray-400 w-20 inline-block">Email</span>{" "}
              {order.user?.email}
            </p>
            <p>
              <span className="text-gray-400 w-20 inline-block">Tanggal</span>{" "}
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        {/* Produk */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
          <h3 className="font-semibold text-gray-800 mb-4">
            🛒 Produk Dipesan
          </h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item._id} className="flex items-center gap-4">
                <img
                  src={
                    item.product?.image
                      ? `http://localhost:5000${item.product.image}`
                      : "/placeholder.png"
                  }
                  alt={item.product?.name}
                  className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">
                    {item.product?.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatRupiah(item.price)} × {item.quantity}
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
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
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
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-2">📝 Catatan</h3>
            <p className="text-sm text-gray-600">{order.notes}</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrderDetailPage;
