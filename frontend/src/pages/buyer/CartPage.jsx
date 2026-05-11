import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart } from "../../store/slices/cartSlice";
import CartItem from "../../components/buyer/CartItem";
import Navbar from "../../components/shared/Navbar";

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, []);

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalPrice = items.reduce(
    (sum, item) => sum + item.quantity * (item.product?.price || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Keranjang Belanja
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl">🛒</span>
            <h2 className="text-lg font-medium text-gray-600 mt-4">
              Keranjang masih kosong
            </h2>
            <p className="text-sm text-gray-400 mt-1 mb-6">
              Mulai belanja dan tambahkan produk ke keranjang
            </p>
            <Link
              to="/products"
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors inline-block"
            >
              Lihat Produk
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Items */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <p className="text-sm text-gray-500 mb-3">
                  {items.length} produk
                </p>
                {items.map((item) => (
                  <CartItem key={item._id} item={item} />
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-20">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Ringkasan Pesanan
                </h3>
                <div className="space-y-2 text-sm text-gray-600 pb-4 border-b border-gray-100">
                  <div className="flex justify-between">
                    <span>Subtotal ({items.length} produk)</span>
                    <span>{formatRupiah(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ongkos kirim</span>
                    <span className="text-green-600">
                      Dihitung saat checkout
                    </span>
                  </div>
                </div>
                <div className="flex justify-between font-bold text-gray-800 mt-4 mb-5">
                  <span>Total</span>
                  <span className="text-orange-600">
                    {formatRupiah(totalPrice)}
                  </span>
                </div>
                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition-colors"
                >
                  Lanjut ke Pemesanan →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
