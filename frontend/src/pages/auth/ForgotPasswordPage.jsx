import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import * as authService from "../../services/authService";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email wajib diisi");
      return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengirim email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <span className="text-4xl">🍳</span>
          <h1 className="text-xl font-bold text-gray-800 mt-2">
            Lupa Kata Sandi
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Masukkan email Anda dan kami akan mengirim link reset
          </p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📧</div>
            <h2 className="font-semibold text-gray-800 mb-2">
              Email Terkirim!
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Jika email <strong>{email}</strong> terdaftar, link reset kata
              sandi telah dikirim. Periksa inbox atau folder spam Anda.
            </p>
            <Link
              to="/login"
              className="text-orange-500 hover:underline text-sm font-medium"
            >
              ← Kembali ke halaman masuk
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="email@contoh.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Mengirim..." : "Kirim Link Reset"}
            </button>

            <p className="text-center text-sm text-gray-500">
              <Link to="/login" className="text-orange-500 hover:underline">
                ← Kembali ke halaman masuk
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
