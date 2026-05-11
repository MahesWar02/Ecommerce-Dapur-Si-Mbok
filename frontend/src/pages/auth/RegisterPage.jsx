import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { registerUser, clearError } from "../../store/slices/authSlice";

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    dispatch(clearError());
  }, []);

  const onSubmit = async (data) => {
    const result = await dispatch(
      registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: "pembeli",
      }),
    );
    if (registerUser.fulfilled.match(result)) {
      toast.success("Registrasi berhasil! Silakan login.");
      navigate("/login");
    } else {
      toast.error(result.payload || "Registrasi Gagal");
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <span className="text-4xl">🍳</span>
          <h1 className="text-xl font-bold text-gray-800 mt-2">Daftar Akun</h1>
          <p className="text-sm text-gray-500 mt-1">
            Buat akun untuk mulai belanja
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <input
              {...register("name", {
                required: "Nama wajib diisi",
                minLength: { value: 3, message: "Minimal 3 karakter" },
              })}
              type="text"
              placeholder="Nama lengkap Anda"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                {...register("password", {
                  required: "Kata sandi wajib diisi",
                  minLength: { value: 6, message: "Minimal 6 karakter" },
                })}
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 6 karakter"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Konfirmasi Kata Sandi
            </label>
            <div className="relative">
              <input
                {...register("confirmPassword", {
                  required: "Konfirmasi kata sandi wajib diisi",
                  validate: (val) =>
                    val === watch("password") || "Kata sandi tidak cocok",
                })}
                type={showConfirm ? "text" : "password"}
                placeholder="Ulangi kata sandi"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Sudah punya akun?{" "}
          <Link
            to="/login"
            className="text-orange-600 font-medium hover:underline"
          >
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
