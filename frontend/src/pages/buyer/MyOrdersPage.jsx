import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as orderService from "../../services/orderService";
import Navbar from "../../components/shared/Navbar";

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

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderService.getMyOrders();
        setOrders(res.data);
      } catch {
        toast.error("Gagal memuat pesanan");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          📦 Pesanan Saya
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🛍️</p>
            <p className="text-gray-500 mb-4">Belum ada pesanan</p>
            <Link
              to="/products"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm transition-colors"
            >
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || {
                label: order.status,
                color: "bg-gray-100 text-gray-700",
              };
              return (
                <div
                  key={order._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">
                        {formatDate(order.createdAt)}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  {/* Items preview */}
                  <div className="flex items-center gap-3 mb-4">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item._id} className="flex items-center gap-2">
                        <img
                          src={
                            item.product?.image
                              ? `http://localhost:5000${item.product.image}`
                              : "/placeholder.png"
                          }
                          alt={item.product?.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                        +{order.items.length - 3}
                      </div>
                    )}
                    <div className="ml-2">
                      <p className="text-sm font-medium text-gray-800">
                        {order.items[0]?.product?.name}
                        {order.items.length > 1 &&
                          ` + ${order.items.length - 1} produk lain`}
                      </p>
                      <p className="text-xs text-gray-400">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} item
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <div>
                      <p className="text-xs text-gray-400">Total</p>
                      <p className="font-bold text-orange-600">
                        {formatRupiah(order.totalAmount)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {order.status === "pending" && (
                        <button
                          onClick={() => navigate(`/payment/${order._id}`)}
                          className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                        >
                          Bayar Sekarang
                        </button>
                      )}
                      <Link
                        to={`/orders/${order._id}`}
                        className="border border-gray-200 hover:border-orange-400 text-gray-600 hover:text-orange-500 text-sm px-4 py-2 rounded-lg transition-colors"
                      >
                        Lihat Detail
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
