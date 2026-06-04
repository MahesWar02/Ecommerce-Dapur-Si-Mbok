import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import AdminLayout from "../../components/admin/AdminLayout";
import * as productService from "../../services/productService";

import { CATEGORIES } from "../../utils/constants";

// Hapus const CATEGORIES = [...] yang lama

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  image: null,
};

// ── Modal Form Tambah / Update (SD #12 & #13) ─────────────────────────────────
const ProductFormModal = ({ mode, product, onClose, onSaved }) => {
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "edit" && product) {
      setForm({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        stock: product.stock || "",
        category: product.category || "",
        image: null,
      });
      if (product.image) setPreview(product.image);
    }
  }, [mode, product]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nama produk wajib diisi";
    if (!form.price || Number(form.price) <= 0)
      e.price = "Harga harus lebih dari 0";
    if (form.stock === "" || Number(form.stock) < 0)
      e.stock = "Stok tidak boleh negatif";
    if (!form.category) e.category = "Kategori wajib dipilih";
    return e;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      setForm((prev) => ({ ...prev, image: file }));
      setPreview(file ? URL.createObjectURL(file) : null);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async () => {
    // SD #12 & #13: Validasi data produk
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("stock", form.stock);
    formData.append("category", form.category);
    if (form.image) formData.append("image", form.image);

    try {
      setLoading(true);
      if (mode === "add") {
        // SD #12: Menyimpan data produk → Data produk tersimpan → Notifikasi berhasil
        await productService.createProduct(formData);
        toast.success("Produk berhasil ditambahkan!");
      } else {
        // SD #13: Menyimpan perubahan data produk → Data produk tersimpan → Notifikasi berhasil
        await productService.updateProduct(product._id, formData);
        toast.success("Produk berhasil diperbarui!");
      }
      onSaved();
      onClose();
    } catch (err) {
      // SD #12 & #13: [Tidak valid] → Menampilkan pesan error
      toast.error(err.response?.data?.message || "Gagal menyimpan produk");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-orange-500 px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">
            {mode === "add" ? "Tambah Produk Baru" : "Update Data Produk"}
          </h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Nama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Produk <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Contoh: Nasi Goreng Spesial"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                errors.name ? "border-red-400" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Deskripsi singkat produk..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>

          {/* Harga & Stok */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="0"
                placeholder="0"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                  errors.price ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.price && (
                <p className="text-red-500 text-xs mt-1">{errors.price}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stok <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                min="0"
                placeholder="0"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                  errors.stock ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.stock && (
                <p className="text-red-500 text-xs mt-1">{errors.stock}</p>
              )}
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                errors.category ? "border-red-400" : "border-gray-300"
              }`}
            >
              <option value="">-- Pilih Kategori --</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">{errors.category}</p>
            )}
          </div>

          {/* Gambar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gambar Produk{" "}
              {mode === "edit" && (
                <span className="text-gray-400 font-normal">
                  (kosongkan jika tidak ingin mengubah)
                </span>
              )}
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-orange-50 file:text-orange-600 file:font-medium hover:file:bg-orange-100 cursor-pointer"
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-2 w-32 h-32 object-cover rounded-lg border border-gray-200"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 text-sm rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {loading
              ? "Menyimpan..."
              : mode === "add"
                ? "Tambah Produk"
                : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Modal Konfirmasi Hapus (SD #14) ───────────────────────────────────────────
const DeleteConfirmModal = ({ product, onClose, onConfirm, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6">
      <div className="text-center mb-5">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3 text-3xl">
          🗑️
        </div>
        <h3 className="font-semibold text-gray-800 text-lg">Hapus Produk?</h3>
        {/* SD #14: Menampilkan konfirmasi penghapusan */}
        <p className="text-sm text-gray-500 mt-1">
          Yakin ingin menghapus{" "}
          <span className="font-medium text-gray-700">
            &quot;{product?.name}&quot;
          </span>
          ? Tindakan ini tidak dapat dibatalkan.
        </p>
      </div>
      <div className="flex gap-3">
        {/* SD #14: [Tidak] → Kembali ke daftar produk */}
        <button
          onClick={onClose}
          disabled={loading}
          className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Batalkan
        </button>
        {/* SD #14: [Ya] → Mengirim permintaan hapus produk */}
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {loading ? "Menghapus..." : "Ya, Hapus"}
        </button>
      </div>
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [modal, setModal] = useState(null); // null | "add" | "edit" | "delete"
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const formatRupiah = (v) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(v);

  // SD #12 & #13: Meminta data halaman produk → Menampilkan halaman kelola produk
  // Bungkus loadProducts dengan useCallback
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (filterCategory) params.category = filterCategory;
      const res = await productService.getAllProducts(params);
      setProducts(res.data);
    } catch {
      toast.error("Gagal memuat data produk");
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // SD #14: Mengirim permintaan hapus → Menghapus data produk → Notifikasi berhasil
  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await productService.deleteProduct(selectedProduct._id);
      toast.success("Produk berhasil dihapus!");
      setModal(null);
      setSelectedProduct(null);
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menghapus produk");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openAdd = () => {
    setSelectedProduct(null);
    setModal("add");
  };
  const openEdit = (p) => {
    setSelectedProduct(p);
    setModal("edit");
  };
  const openDelete = (p) => {
    setSelectedProduct(p);
    setModal("delete");
  };
  const closeModal = () => {
    setModal(null);
    setSelectedProduct(null);
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Kelola Produk</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {products.length} produk terdaftar
            </p>
          </div>
          {/* SD #12: Klik tombol "Tambah Produk" */}
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <span>+</span> Tambah Produk
          </button>
        </div>

        {/* Filter & Search */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍  Cari nama produk..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            <option value="">Semua Kategori</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
              <span className="animate-spin mr-2">⏳</span> Memuat data...
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <span className="text-5xl mb-3">🍽️</span>
              <p className="text-sm">Belum ada produk</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="px-5 py-3 text-left">Produk</th>
                    <th className="px-5 py-3 text-left">Kategori</th>
                    <th className="px-5 py-3 text-right">Harga</th>
                    <th className="px-5 py-3 text-center">Stok</th>
                    <th className="px-5 py-3 text-center">Rating</th>
                    <th className="px-5 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((p) => (
                    <tr
                      key={p._id}
                      className="hover:bg-orange-50/30 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-12 h-12 rounded-lg object-cover border border-gray-100"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-xl border border-gray-100">
                              🍴
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-800">
                              {p.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-[200px]">
                              {p.description || "-"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-gray-700">
                        {formatRupiah(p.price)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            p.stock === 0
                              ? "bg-red-100 text-red-600"
                              : p.stock < 10
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center text-gray-500 text-xs">
                        ⭐ {p.avgRating?.toFixed(1) || "0.0"}{" "}
                        <span className="text-gray-400">
                          ({p.reviewCount || 0})
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {/* SD #13: Memilih produk yang akan di-update */}
                          <button
                            onClick={() => openEdit(p)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          >
                            ✏️ Edit
                          </button>
                          {/* SD #14: Memilih produk yang akan dihapus */}
                          <button
                            onClick={() => openDelete(p)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          >
                            🗑️ Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {(modal === "add" || modal === "edit") && (
        <ProductFormModal
          mode={modal}
          product={selectedProduct}
          onClose={closeModal}
          onSaved={loadProducts}
        />
      )}

      {modal === "delete" && (
        <DeleteConfirmModal
          product={selectedProduct}
          onClose={closeModal}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </AdminLayout>
  );
};

export default AdminProductsPage;
