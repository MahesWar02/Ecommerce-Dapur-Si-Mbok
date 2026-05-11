import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../store/slices/authSlice";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🍳</span>
          <span className="font-bold text-orange-600 text-lg">
            Dapur Si Mbok
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-orange-500 transition-colors">
            Beranda
          </Link>
          <Link
            to="/products"
            className="hover:text-orange-500 transition-colors"
          >
            Produk
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <Link
                to="/cart"
                className="text-gray-600 hover:text-orange-500 text-sm"
              >
                🛒 Keranjang
              </Link>
              <Link
                to="/orders"
                className="text-gray-600 hover:text-orange-500 text-sm"
              >
                📦 Pesanan
              </Link>
              <Link
                to="/profile"
                className="text-gray-600 hover:text-orange-500 text-sm"
              >
                👤 {user.name?.split(" ")[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-1.5 rounded-lg transition-colors"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="border border-orange-500 text-orange-500 hover:bg-orange-50 text-sm px-4 py-1.5 rounded-lg transition-colors"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-1.5 rounded-lg transition-colors"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
