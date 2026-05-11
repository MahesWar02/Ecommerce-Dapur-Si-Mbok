import { useDispatch } from "react-redux";
import {
  updateCartItemQty,
  removeItemFromCart,
} from "../../store/slices/cartSlice";

const CartItem = ({ item }) => {
  const dispatch = useDispatch();

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleQtyChange = (newQty) => {
    if (newQty < 1) return;
    if (newQty > item.product?.stock) return;
    dispatch(updateCartItemQty({ itemId: item._id, quantity: newQty }));
  };

  const handleRemove = () => {
    dispatch(removeItemFromCart(item._id));
  };

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
      {/* Gambar */}
      <img
        src={
          item.product?.image
            ? `http://localhost:5000${item.product.image}`
            : "/placeholder.png"
        }
        alt={item.product?.name}
        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 text-sm truncate">
          {item.product?.name}
        </p>
        <p className="text-orange-600 font-semibold text-sm">
          {formatRupiah(item.product?.price)}
        </p>
      </div>

      {/* Qty control */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleQtyChange(item.quantity - 1)}
          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-orange-400 hover:text-orange-500 transition-colors"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-medium">
          {item.quantity}
        </span>
        <button
          onClick={() => handleQtyChange(item.quantity + 1)}
          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-orange-400 hover:text-orange-500 transition-colors"
        >
          +
        </button>
      </div>

      {/* Subtotal */}
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-gray-800 text-sm">
          {formatRupiah(item.product?.price * item.quantity)}
        </p>
        <button
          onClick={handleRemove}
          className="text-red-400 hover:text-red-600 transition-colors mt-1 text-xs"
        >
          Hapus
        </button>
      </div>
    </div>
  );
};

export default CartItem;
