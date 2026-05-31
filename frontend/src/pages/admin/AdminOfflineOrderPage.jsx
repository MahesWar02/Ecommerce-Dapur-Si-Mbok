import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminLayout from "../../components/admin/AdminLayout";
import * as productService from "../../services/productService";
import * as orderService from "../../services/orderService";

const AdminOfflineOrderPage = () => {
  const navigate = useNavigate();

  const [view, setView] = useState("form");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [transactionDate, setTransactionDate] = useState(today);
  const [selectedItems, setSelectedItems] = useState([
    { product: "", quantity: 1 },
  ]);

  const formatRupiah = (amount) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDateDisplay = (dateStr) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productService.getAllProducts();
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.products || [];
        setProducts(data.filter((p) => p.stock > 0));
      } catch {
        toast.error("Gagal memuat produk");
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  const getProductDetail = (productId) =>
    products.find((p) => p._id === productId);

  const handleItemChange = (index, field, value) => {
    const updated = [...selectedItems];
    updated[index][field] = field === "quantity" ? parseInt(value) || 1 : value;
    if (field === "product") updated[index].quantity = 1;
    setSelectedItems(updated);
  };

  const handleAddItem = () => {
    setSelectedItems([...selectedItems, { product: "", quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    if (selectedItems.length === 1) return;
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const getTotal = () =>
    selectedItems.reduce((sum, item) => {
      const product = getProductDetail(item.product);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);

  const handleGoToPreview = () => {
    if (!customerName.trim()) {
      toast.error("Nama pelanggan wajib diisi");
      return;
    }
    if (!transactionDate) {
      toast.error("Tanggal transaksi wajib diisi");
      return;
    }
    const hasEmpty = selectedItems.some((i) => !i.product);
    if (hasEmpty) {
      toast.error("Pilih produk untuk semua item");
      return;
    }
    const hasDuplicate =
      new Set(selectedItems.map((i) => i.product)).size !==
      selectedItems.length;
    if (hasDuplicate) {
      toast.error("Produk tidak boleh duplikat");
      return;
    }
    for (const item of selectedItems) {
      const product = getProductDetail(item.product);
      if (product && item.quantity > product.stock) {
        toast.error(
          `Stok ${product.name} tidak cukup (tersisa ${product.stock})`,
        );
        return;
      }
    }
    setView("preview");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await orderService.createOfflineOrder({
        customerName: customerName.trim(),
        items: selectedItems.map((i) => ({
          product: i.product,
          quantity: i.quantity,
        })),
        notes,
        transactionDate,
      });
      toast.success("Transaksi offline berhasil dicatat!");
      navigate("/admin/sales-report");
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyimpan transaksi");
      setView("form");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── FORM ────────────────────────────────────────────────────
  if (view === "form") {
    return (
      <AdminLayout>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate("/admin/sales-report")}
              className="text-gray-400 hover:text-gray-600"
            >
              ← Kembali
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Input Transaksi Offline
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Catat penjualan langsung / offline
              </p>
            </div>
          </div>

          {/* Info pelanggan */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
            <h3 className="font-semibold text-gray-800 mb-4">
              👤 Info Pelanggan
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Pelanggan <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="Nama pelanggan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Transaksi <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={transactionDate}
                  max={today}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan (opsional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="Catatan tambahan..."
                />
              </div>
            </div>
          </div>

          {/* Pilih produk */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
            <h3 className="font-semibold text-gray-800 mb-4">🛒 Produk</h3>

            {loadingProducts ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
              </div>
            ) : (
              <div className="space-y-3">
                {selectedItems.map((item, index) => {
                  const productDetail = getProductDetail(item.product);
                  return (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <select
                          value={item.product}
                          onChange={(e) =>
                            handleItemChange(index, "product", e.target.value)
                          }
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                        >
                          <option value="">-- Pilih produk --</option>
                          {products.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.name} — {formatRupiah(p.price)} (stok:{" "}
                              {p.stock})
                            </option>
                          ))}
                        </select>
                        {productDetail && (
                          <p className="text-xs text-gray-400 mt-1 pl-1">
                            Subtotal:{" "}
                            {formatRupiah(productDetail.price * item.quantity)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() =>
                            handleItemChange(
                              index,
                              "quantity",
                              Math.max(1, item.quantity - 1),
                            )
                          }
                          className="px-3 py-2 text-gray-500 hover:bg-gray-50 text-sm"
                        >
                          −
                        </button>
                        <span className="px-3 py-2 text-sm font-medium min-w-[40px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleItemChange(
                              index,
                              "quantity",
                              Math.min(
                                productDetail?.stock || 99,
                                item.quantity + 1,
                              ),
                            )
                          }
                          className="px-3 py-2 text-gray-500 hover:bg-gray-50 text-sm"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        disabled={selectedItems.length === 1}
                        className="p-2 text-gray-300 hover:text-red-400 disabled:opacity-30 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })}

                <button
                  onClick={handleAddItem}
                  className="w-full border border-dashed border-gray-200 rounded-lg py-2 text-sm text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-colors"
                >
                  + Tambah Produk
                </button>
              </div>
            )}
          </div>

          {/* Total & Lanjut */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-gray-700">Total</span>
              <span className="text-xl font-bold text-orange-600">
                {formatRupiah(getTotal())}
              </span>
            </div>
            <button
              onClick={handleGoToPreview}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              Lanjut ke Preview →
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // ─── PREVIEW ─────────────────────────────────────────────────
  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setView("form")}
            className="text-gray-400 hover:text-gray-600"
          >
            ← Edit
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Preview Pesanan Offline
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Periksa kembali sebelum menyimpan
            </p>
          </div>
        </div>

        {/* Info pelanggan */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
          <h3 className="font-semibold text-gray-800 mb-3">
            👤 Info Pelanggan
          </h3>
          <div className="text-sm space-y-2 text-gray-600">
            <div className="flex justify-between">
              <span className="text-gray-400">Nama</span>
              <span className="font-medium text-gray-800">{customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tanggal Transaksi</span>
              <span className="font-medium text-gray-800">
                {formatDateDisplay(transactionDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ID Pesanan</span>
              <span className="text-xs text-gray-400 italic">
                (otomatis dibuat sistem)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Asal Transaksi</span>
              <span className="bg-orange-100 text-orange-600 text-xs font-medium px-2 py-0.5 rounded-full">
                Offline
              </span>
            </div>
            {notes && (
              <div className="flex justify-between">
                <span className="text-gray-400">Catatan</span>
                <span>{notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Produk */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
          <h3 className="font-semibold text-gray-800 mb-4">
            🛒 Produk Dipesan
          </h3>
          <div className="space-y-3">
            {selectedItems.map((item, index) => {
              const product = getProductDetail(item.product);
              return (
                <div
                  key={index}
                  className="flex justify-between items-center text-sm"
                >
                  <div>
                    <p className="font-medium text-gray-800">{product?.name}</p>
                    <p className="text-xs text-gray-400">
                      {formatRupiah(product?.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-800">
                    {formatRupiah((product?.price || 0) * item.quantity)}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between">
            <span className="font-semibold text-gray-700">Total</span>
            <span className="text-xl font-bold text-orange-600">
              {formatRupiah(getTotal())}
            </span>
          </div>
        </div>

        {/* Tombol */}
        <div className="flex gap-3">
          <button
            onClick={() => setView("form")}
            className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Kembali Edit
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {submitting ? "Menyimpan..." : "✅ Simpan Transaksi"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOfflineOrderPage;
