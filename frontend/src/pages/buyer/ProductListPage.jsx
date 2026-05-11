import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { fetchProducts, setFilters } from "../../store/slices/productSlice";
import { addItemToCart } from "../../store/slices/cartSlice";
import ProductCard from "../../components/buyer/ProductCard";
import Navbar from "../../components/shared/Navbar";

const CATEGORIES = [
  "Semua",
  "Kue",
  "Jajanan Pasar",
  "Sambal",
  "Lauk Pauk",
  "Cemilan",
  "Minuman",
];

const ProductListPage = () => {
  const dispatch = useDispatch();
  const { products, loading, filters } = useSelector((state) => state.product);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(
      fetchProducts({
        search: filters.search,
        category: activeCategory === "Semua" ? "" : activeCategory,
      }),
    );
  }, [filters.search, activeCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({ search }));
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      toast.info("Silakan login terlebih dahulu");
      return;
    }
    const result = await dispatch(
      addItemToCart({
        productId: product._id,
        quantity: 1,
      }),
    );
    if (addItemToCart.fulfilled.match(result)) {
      toast.success(`${product.name} ditambahkan ke keranjang`);
    } else {
      toast.error(result.payload || "Gagal menambahkan ke keranjang");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Produk Kami</h1>
          <p className="text-gray-500 text-sm mt-1">
            Temukan produk UMKM terbaik dari Dapur Si Mbok
          </p>
        </div>

        <form onSubmit={handleSearch} className="mb-5 flex gap-2 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Cari
          </button>
        </form>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                ${
                  activeCategory === cat
                    ? "bg-orange-500 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-orange-300"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <span className="text-5xl">🔍</span>
            <p className="mt-3 font-medium">Produk tidak ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListPage;
