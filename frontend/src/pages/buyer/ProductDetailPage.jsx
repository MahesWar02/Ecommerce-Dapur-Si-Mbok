import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  fetchProductById,
  clearSelectedProduct,
} from "../../store/slices/productSlice";
import { addItemToCart } from "../../store/slices/cartSlice";
import Navbar from "../../components/shared/Navbar";
import * as reviewService from "../../services/reviewService";
import Footer from "../../components/shared/Footer";

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedProduct: product, loading } = useSelector(
    (state) => state.product,
  );
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    dispatch(clearSelectedProduct());
    dispatch(fetchProductById(id));
  }, [id, dispatch]);
  const loadReviews = useCallback(async () => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const res = await reviewService.getReviewsByProduct(id);
      setReviews(res.data);
    } catch {
      // silent
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

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
      addItemToCart({ productId: product._id, quantity: qty }),
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
      addItemToCart({ productId: product._id, quantity: qty }),
    );
    if (addItemToCart.fulfilled.match(result)) {
      navigate("/cart");
    } else {
      toast.error(result.payload || "Gagal menambahkan ke keranjang");
    }
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8 animate-pulse">
            {/* Skeleton Gambar */}
            <div className="aspect-square rounded-2xl bg-gray-200"></div>

            {/* Skeleton Detail */}
            <div className="space-y-4">
              <div className="h-6 w-24 bg-gray-200 rounded"></div>

              <div className="h-10 w-3/4 bg-gray-200 rounded"></div>

              <div className="h-10 w-40 bg-gray-200 rounded"></div>

              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
              </div>

              <div className="h-12 w-full bg-gray-200 rounded"></div>

              <div className="h-12 w-full bg-gray-200 rounded"></div>
            </div>
          </div>
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
                src={product.image}
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

            {/* Rating ringkas */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className={`text-base ${
                        s <= Math.round(product.avgRating || 0)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {product.avgRating?.toFixed(1)} ({product.reviewCount} ulasan)
                </span>
              </div>
            )}

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

        {/* ── Section Ulasan ─────────────────────────────────── */}
        <div className="mt-10">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            ⭐ Ulasan Pembeli
            {reviews.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({reviews.length} ulasan)
              </span>
            )}
          </h2>

          {/* Ringkasan rating */}
          {reviews.length > 0 && (
            <div className="bg-orange-50 rounded-xl p-4 mb-5 flex items-center gap-5">
              <div className="text-center">
                <p className="text-4xl font-bold text-orange-600">
                  {product.avgRating?.toFixed(1) || "0.0"}
                </p>
                <div className="flex justify-center mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className={`text-lg ${
                        s <= Math.round(product.avgRating || 0)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {reviews.length} ulasan
                </p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews.filter((r) => r.rating === star).length;
                  const pct = reviews.length
                    ? (count / reviews.length) * 100
                    : 0;
                  return (
                    <div
                      key={star}
                      className="flex items-center gap-2 text-xs text-gray-500"
                    >
                      <span>{star}★</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-yellow-400 h-1.5 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-4 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {reviewsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-sm">Belum ada ulasan untuk produk ini</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600">
                        {review.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {review.user?.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span
                          key={s}
                          className={`text-sm ${
                            s <= review.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetailPage;
