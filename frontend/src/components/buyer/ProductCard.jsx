import { Link } from "react-router-dom";

const ProductCard = ({ product, onAddToCart }) => {
  const formatRupiah = (amount) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Gambar — rasio kotak */}
      <Link to={`/products/${product._id}`} className="block flex-shrink-0">
        <div className="aspect-square bg-orange-50 overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl">🍳</span>
            </div>
          )}
        </div>
      </Link>

      {/* Konten — flex-grow agar semua card sama tinggi */}
      <div className="p-3 flex flex-col flex-1">
        {/* Kategori */}
        <span className="text-xs text-orange-500 font-medium bg-orange-50 px-2 py-0.5 rounded-full self-start">
          {product.category}
        </span>

        {/* Nama produk — 2 baris, sisanya terpotong */}
        <Link to={`/products/${product._id}`} className="mt-1 mb-1">
          <h3 className="font-medium text-gray-800 hover:text-orange-600 transition-colors text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {/* Rating — selalu ada ruang meski belum ada ulasan */}
        <div className="flex items-center gap-1 h-5 mb-1">
          {product.reviewCount > 0 ? (
            <>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    className={`text-xs ${
                      s <= Math.round(product.avgRating || 0)
                        ? "text-yellow-400"
                        : "text-gray-200"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-xs text-gray-400">
                {product.avgRating?.toFixed(1)} ({product.reviewCount})
              </span>
            </>
          ) : (
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className="text-xs text-gray-200">
                  ★
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Harga & stok — didorong ke bawah */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="font-bold text-orange-600 text-sm">
            {formatRupiah(product.price)}
          </span>
          <span className="text-xs text-gray-400">Stok: {product.stock}</span>
        </div>

        {/* Tombol */}
        <button
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
          className="w-full mt-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-200 disabled:cursor-not-allowed text-white text-sm font-medium py-1.5 rounded-lg transition-colors"
        >
          {product.stock === 0 ? "Stok Habis" : "+ Keranjang"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
