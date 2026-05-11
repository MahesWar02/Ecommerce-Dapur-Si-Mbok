import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../store/slices/authSlice";
import { ROLES } from "../utils/constants";

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, error } = useSelector(
    (state) => state.auth,
  );

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    isPembeli: user?.role === ROLES.PEMBELI,
    isPenjual: user?.role === ROLES.PENJUAL,
    isAdmin: user?.role === ROLES.ADMIN,
    handleLogout,
  };
};
