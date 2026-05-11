import { Link } from "react-router-dom";

const ProductCard = ({ product, onAddToCart }) => {
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <Link to={`/products/${product._id}`}>
        <div className="aspect-square bg-orange-50 flex items-center justify-center overflow-hidden">
          {product.image ? (
            <img
              src={`http://localhost:5000${product.image}`}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <span className="text-6xl">🍳</span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 space-y-2">
        <span className="text-xs text-orange-500 font-medium bg-orange-50 px-2 py-0.5 rounded-full">
          {product.category}
        </span>
        <Link to={`/products/${product._id}`}>
          <h3 className="font-medium text-gray-800 hover:text-orange-600 transition-colors text-sm leading-tight mt-1">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between">
          <span className="font-bold text-orange-600 text-sm">
            {formatRupiah(product.price)}
          </span>
          <span className="text-xs text-gray-400">Stok: {product.stock}</span>
        </div>
        <button
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-1.5 rounded-lg transition-colors"
        >
          {product.stock === 0 ? "Stok Habis" : "+ Keranjang"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
