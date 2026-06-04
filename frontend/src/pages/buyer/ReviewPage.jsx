import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as orderService from "../../services/orderService";
import * as reviewService from "../../services/reviewService";
import Navbar from "../../components/shared/Navbar";

const StarInput = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className={`text-3xl transition-transform hover:scale-110 ${
          star <= value ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </button>
    ))}
  </div>
);

const ratingLabel = ["", "Buruk", "Kurang", "Cukup", "Bagus", "Sempurna"];

const ReviewPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  // reviewState: { [productId]: { rating, comment, reviewed, submitting } }
  const [reviewState, setReviewState] = useState({});

  // SD #10: Mengakses halaman pesanan → Meminta daftar pesanan
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderService.getOrderById(orderId);
        const o = res.data;

        if (o.status !== "delivered") {
          toast.error("Pesanan belum selesai");
          navigate("/orders");
          return;
        }

        setOrder(o);

        // Cek sudah di-review per produk
        const checks = await Promise.all(
          o.items.map((item) =>
            reviewService
              .checkReviewed(item.product._id, orderId)
              .then((r) => ({
                productId: item.product._id,
                reviewed: r.data.reviewed,
              }))
              .catch(() => ({ productId: item.product._id, reviewed: false })),
          ),
        );

        const state = {};
        o.items.forEach((item) => {
          const check = checks.find((c) => c.productId === item.product._id);
          state[item.product._id] = {
            rating: 5,
            comment: "",
            reviewed: check?.reviewed || false,
            submitting: false,
          };
        });
        setReviewState(state);
      } catch {
        toast.error("Pesanan tidak ditemukan");
        navigate("/orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleChange = (productId, field, value) => {
    setReviewState((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], [field]: value },
    }));
  };

  // SD #10: Kirim ulasan → Mengirim data ulasan → Validasi → Menyimpan ulasan
  const handleSubmit = async (productId) => {
    const state = reviewState[productId];
    if (!state.rating) {
      toast.error("Pilih rating terlebih dahulu");
      return;
    }

    setReviewState((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], submitting: true },
    }));

    try {
      await reviewService.createReview({
        productId,
        orderId,
        rating: state.rating,
        comment: state.comment,
      });
      // SD #10: [Ya] → Menampilkan pesan sukses
      toast.success("Ulasan berhasil dikirim!");
      setReviewState((prev) => ({
        ...prev,
        [productId]: { ...prev[productId], reviewed: true, submitting: false },
      }));
    } catch (err) {
      // SD #10: [Tidak] → Menampilkan pesan gagal
      toast.error(err.response?.data?.message || "Gagal mengirim ulasan");
      setReviewState((prev) => ({
        ...prev,
        [productId]: { ...prev[productId], submitting: false },
      }));
    }
  };

  const allReviewed = order
    ? order.items.every((item) => reviewState[item.product._id]?.reviewed)
    : false;

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
        <button
          onClick={() => navigate(`/orders/${orderId}`)}
          className="text-gray-400 hover:text-gray-600 text-sm mb-4 flex items-center gap-1"
        >
          ← Kembali ke detail pesanan
        </button>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          ⭐ Beri Ulasan
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Bagikan pengalamanmu untuk membantu pembeli lain
        </p>

        {allReviewed && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-green-700 font-medium">
              ✅ Semua produk sudah diulas. Terima kasih!
            </p>
            <button
              onClick={() => navigate("/orders")}
              className="mt-2 text-sm text-orange-500 hover:underline"
            >
              Lihat pesanan lainnya
            </button>
          </div>
        )}

        <div className="space-y-5">
          {order.items.map((item) => {
            const state = reviewState[item.product._id] || {};
            return (
              <div
                key={item.product._id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
              >
                {/* Produk info */}
                <div className="flex items-center gap-3 mb-4">
                  {item.product.image ? (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-14 h-14 rounded-lg object-cover border border-gray-100"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-orange-50 flex items-center justify-center text-2xl">
                      🍴
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-800">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.quantity} item
                    </p>
                  </div>
                </div>

                {state.reviewed ? (
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-green-600 text-sm font-medium">
                      ✅ Sudah diulas
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Rating bintang */}
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Rating
                      </p>
                      <div className="flex items-center gap-3">
                        <StarInput
                          value={state.rating || 0}
                          onChange={(v) =>
                            handleChange(item.product._id, "rating", v)
                          }
                        />
                        {state.rating > 0 && (
                          <span className="text-sm text-orange-500 font-medium">
                            {ratingLabel[state.rating]}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Komentar */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Komentar{" "}
                        <span className="text-gray-400 font-normal">
                          (opsional)
                        </span>
                      </p>
                      <textarea
                        value={state.comment || ""}
                        onChange={(e) =>
                          handleChange(
                            item.product._id,
                            "comment",
                            e.target.value,
                          )
                        }
                        rows={3}
                        placeholder="Ceritakan pengalamanmu dengan produk ini..."
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                      />
                    </div>

                    <button
                      onClick={() => handleSubmit(item.product._id)}
                      disabled={state.submitting || !state.rating}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {state.submitting ? "Mengirim..." : "Kirim Ulasan"}
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
