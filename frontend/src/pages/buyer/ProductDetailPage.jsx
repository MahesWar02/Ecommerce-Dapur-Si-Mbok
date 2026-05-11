import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { fetchProductById } from "../../store/slices/productSlice";
import { addItemToCart } from "../../store/slices/cartSlice";
import Navbar from "../../components/shared/Navbar";

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedProduct: product, loading } = useSelector(
    (state) => state.product,
  );
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [id]);

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info("Silakan login terlebih dahulu");
      return;
    }
    const result = await dispatch(
      addItemToCart({
        productId: product._id,
        quantity: qty,
      }),
    );
    if (addItemToCart.fulfilled.match(result)) {
      toast.success(`${product.name} ditambahkan ke keranjang`);
    } else {
      toast.error(result.payload || "Gagal menambahkan ke keranjang");
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.info("Silakan login terlebih dahulu");
      return;
    }
    const result = await dispatch(
      addItemToCart({
        productId: product._id,
        quantity: qty,
      }),
    );
    if (addItemToCart.fulfilled.match(result)) {
      navigate("/cart");
    } else {
      toast.error(result.payload || "Gagal menambahkan ke keranjang");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tombol kembali */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm"
        >
          ← Kembali
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Gambar */}
          <div className="aspect-square rounded-2xl overflow-hidden bg-orange-50 flex items-center justify-center">
            {product.image ? (
              <img
                src={`http://localhost:5000${product.image}`}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-8xl">🍳</span>
            )}
          </div>

          {/* Info produk */}
          <div className="space-y-4">
            <div>
              <span className="text-xs text-orange-500 font-medium bg-orange-50 px-2 py-0.5 rounded-full">
                {product.category}
              </span>
              <h1 className="text-2xl font-bold text-gray-800 mt-2">
                {product.name}
              </h1>
            </div>

            {/* Harga */}
            <div className="text-3xl font-bold text-orange-600">
              {formatRupiah(product.price)}
            </div>

            {/* Deskripsi */}
            <p className="text-gray-600 text-sm leading-relaxed">
              {product.description}
            </p>

            {/* Stok */}
            <p className="text-sm text-gray-500">
              Stok tersedia:{" "}
              <span
                className={`font-medium ${product.stock <= 5 ? "text-red-500" : "text-gray-700"}`}
              >
                {product.stock}
              </span>
            </p>

            {/* Qty selector */}
            {product.stock > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  Jumlah:
                </span>
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 hover:bg-gray-50 text-gray-600"
                  >
                    −
                  </button>
                  <span className="px-3 py-2 text-sm font-medium min-w-[2rem] text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() =>
                      setQty((q) => Math.min(product.stock, q + 1))
                    }
                    className="px-3 py-2 hover:bg-gray-50 text-gray-600"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Tombol aksi */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 border border-orange-500 text-orange-500 hover:bg-orange-50 font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                🛒 {product.stock === 0 ? "Stok Habis" : "Keranjang"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                ⚡ Beli Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
