import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as authService from "../../services/authService";
import { ROLES } from "../../utils/constants";
import { useDispatch } from "react-redux";
import { loginUser } from "../../store/slices/authSlice";
import loginImage from "../../assets/LoginPage.jpg";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authService.login(data);
      localStorage.setItem("token", res.data.token);
      dispatch(loginUser.fulfilled(res.data));
      toast.success(`Selamat datang, ${res.data.user.name}!`);
      if (
        res.data.user.role === ROLES.ADMIN ||
        res.data.user.role === ROLES.PENJUAL
      ) {
        navigate("/admin/products");
      } else {
        navigate("/");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Email atau kata sandi salah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4">
      <div className="flex w-full max-w-3xl rounded-2xl shadow-sm border border-gray-100 overflow-hidden bg-white">
        {/* Form Side */}
        <div className="w-full max-w-sm p-8 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-gray-800 mt-2">Masuk</h1>
            <p className="text-sm text-gray-500 mt-1">
              Nikmati ragam kue tradisional
              <p />
              pilihan langsung dari dapur kami
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                {...register("email", {
                  required: "Email wajib diisi",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Format email tidak valid",
                  },
                })}
                type="email"
                placeholder="email@contoh.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Kata Sandi
                </label>
                <Link
                  to="/reset-password"
                  className="text-xs text-orange-600 hover:underline"
                >
                  Lupa kata sandi?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register("password", {
                    required: "Kata sandi wajib diisi",
                  })}
                  type={showPassword ? "text" : "password"}
                  placeholder="Kata sandi Anda"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Belum punya akun?{" "}
            <Link
              to="/register"
              className="text-orange-600 font-medium hover:underline"
            >
              Daftar
            </Link>
          </p>
        </div>

        {/* Image Side */}
        <div className="hidden md:block flex-1">
          <img
            src={loginImage}
            alt="Dapur Si Mbok"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
