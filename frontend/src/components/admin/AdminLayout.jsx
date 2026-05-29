import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../store/slices/authSlice";

const menuItems = [
  { path: "/admin/orders", icon: "📦", label: "Kelola Pesanan" },
  { path: "/admin/products", icon: "🍽️", label: "Kelola Produk" },
  { path: "/admin/sales-report", icon: "📊", label: "Laporan Penjualan" },
];

const AdminLayout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-100 shadow-sm flex flex-col fixed h-full z-30">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🍳</span>
            <div>
              <p className="font-bold text-orange-600 text-sm leading-tight">
                Dapur Si Mbok
              </p>
              <p className="text-xs text-gray-400">Panel Admin</p>
            </div>
          </Link>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-orange-50 text-orange-600 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info & logout */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-800 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 py-2 rounded-lg transition-colors text-left px-2"
          >
            🚪 Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-60 flex-1 p-6">{children}</main>
    </div>
  );
};

export default AdminLayout;
