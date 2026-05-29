import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminLayout from "../../components/admin/AdminLayout";
import * as orderService from "../../services/orderService";

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "pending", label: "Menunggu Pembayaran" },
  { value: "paid", label: "Dibayar" },
  { value: "processing", label: "Diproses" },
  { value: "shipped", label: "Dikirim" },
  { value: "delivered", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
];

const STATUS_NEXT = {
  paid: "processing",
  processing: "shipped",
  shipped: "delivered",
};

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

const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Filter state
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [search, setSearch] = useState("");

  const formatRupiah = (amount) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const fetchOrders = async () => {
    try {
      const res = await orderService.getAllOrders();
      setOrders(res.data);
    } catch {
      toast.error("Gagal memuat pesanan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter logic
  useEffect(() => {
    let result = [...orders];

    if (filterStatus) {
      result = result.filter((o) => o.status === filterStatus);
    }

    if (filterDate) {
      result = result.filter((o) => {
        const orderDate = new Date(o.createdAt).toISOString().slice(0, 10);
        return orderDate === filterDate;
      });
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o._id.toLowerCase().includes(q) ||
          o.user?.name?.toLowerCase().includes(q) ||
          o.user?.email?.toLowerCase().includes(q),
      );
    }

    setFiltered(result);
  }, [orders, filterStatus, filterDate, search]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      toast.success("Status pesanan diperbarui");
      await fetchOrders();
    } catch {
      toast.error("Gagal memperbarui status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Summary counts
  const summary = STATUS_OPTIONS.slice(1).map((s) => ({
    ...s,
    count: orders.filter((o) => o.status === s.value).length,
  }));

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            📦 Kelola Pesanan
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Kelola dan perbarui status semua pesanan masuk
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
          {summary.map((s) => (
            <button
              key={s.value}
              onClick={() =>
                setFilterStatus(filterStatus === s.value ? "" : s.value)
              }
              className={`bg-white rounded-xl p-3 border text-center transition-all ${
                filterStatus === s.value
                  ? "border-orange-400 shadow-md"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <p className="text-2xl font-bold text-gray-800">{s.count}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-tight">
                {s.label}
              </p>
            </button>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Cari ID / nama / email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          {(filterStatus || filterDate || search) && (
            <button
              onClick={() => {
                setFilterStatus("");
                setFilterDate("");
                setSearch("");
              }}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              ✕ Reset
            </button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-400">Tidak ada pesanan ditemukan</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                    ID Pesanan
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                    Pembeli
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                    Tanggal
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                    Total
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const status = statusConfig[order.status];
                  const nextStatus = STATUS_NEXT[order.status];
                  const nextLabel = nextStatus
                    ? statusConfig[nextStatus]?.label
                    : null;
                  return (
                    <tr
                      key={order._id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">
                          {order.user?.name || "-"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {order.user?.email}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {formatRupiah(order.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${status?.color}`}
                        >
                          {status?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 items-center">
                          <button
                            onClick={() =>
                              navigate(`/admin/orders/${order._id}`)
                            }
                            className="text-xs border border-gray-200 hover:border-orange-400 text-gray-600 hover:text-orange-500 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Detail
                          </button>
                          {nextStatus && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(order._id, nextStatus)
                              }
                              disabled={updatingId === order._id}
                              className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {updatingId === order._id
                                ? "..."
                                : `→ ${nextLabel}`}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrdersPage;
