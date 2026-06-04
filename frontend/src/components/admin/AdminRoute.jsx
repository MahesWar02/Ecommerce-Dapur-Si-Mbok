import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  if (loading || (isAuthenticated && !user)) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "#f97316" }}>Memuat...</p>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "admin" && user?.role !== "penjual")
    return <Navigate to="/" replace />;
  return children;
};
export default AdminRoute;
4;
