import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { updateUserProfile } from "../../store/slices/authSlice";
import * as authService from "../../services/authService";
import Navbar from "../../components/shared/Navbar";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // "profile" | "edit-profile" | "edit-password"
  const [view, setView] = useState("profile");

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const roleLabel = {
    pembeli: "Pembeli",
    penjual: "Penjual",
    admin: "Admin",
  };

  const handleEditProfileOpen = () => {
    setProfileData({ name: user?.name || "", phone: user?.phone || "" });
    setView("edit-profile");
  };

  const handleEditPasswordOpen = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setView("edit-password");
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      toast.error("Nama tidak boleh kosong");
      return;
    }
    setLoadingProfile(true);
    try {
      await dispatch(updateUserProfile(profileData)).unwrap();
      toast.success("Profil berhasil diperbarui");
      setView("profile");
    } catch (err) {
      toast.error(err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword) {
      toast.error("Kata sandi lama wajib diisi");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Kata sandi baru minimal 6 karakter");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Konfirmasi kata sandi tidak cocok");
      return;
    }
    setLoadingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Kata sandi berhasil diubah");
      setView("profile");
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengubah kata sandi");
    } finally {
      setLoadingPassword(false);
    }
  };

  // ─── Halaman Profil ───────────────────────────────────────────
  if (view === "profile") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Profil Saya</h1>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {/* Avatar & info utama */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-2xl font-bold text-orange-500 flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-lg">
                  {user?.name}
                </p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <span className="text-xs bg-orange-100 text-orange-600 font-medium px-2 py-0.5 rounded-full">
                  {roleLabel[user?.role] || user?.role}
                </span>
              </div>
            </div>

            {/* Data profil */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Nama</span>
                <span className="text-sm font-medium text-gray-800">
                  {user?.name}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Email</span>
                <span className="text-sm font-medium text-gray-800">
                  {user?.email}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">No. Telepon</span>
                <span className="text-sm font-medium text-gray-800">
                  {user?.phone || "-"}
                </span>
              </div>
            </div>

            {/* Tombol aksi */}
            <div className="space-y-3">
              <button
                onClick={handleEditProfileOpen}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition-colors"
              >
                Edit Profil
              </button>
              <button
                onClick={handleEditPasswordOpen}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-lg border border-gray-300 transition-colors"
              >
                Ubah Kata Sandi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Form Edit Profil ─────────────────────────────────────────
  if (view === "edit-profile") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setView("profile")}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Kembali
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Edit Profil</h1>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Nama lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Email tidak dapat diubah
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No. Telepon
                </label>
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="08xxx"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setView("profile")}
                  className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-lg border border-gray-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loadingProfile}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loadingProfile ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ─── Form Ubah Kata Sandi ─────────────────────────────────────
  if (view === "edit-password") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setView("profile")}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Kembali
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              Ubah Kata Sandi
            </h1>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {[
                {
                  key: "current",
                  label: "Kata Sandi Lama",
                  field: "currentPassword",
                  placeholder: "Masukkan kata sandi lama",
                },
                {
                  key: "new",
                  label: "Kata Sandi Baru",
                  field: "newPassword",
                  placeholder: "Minimal 6 karakter",
                },
                {
                  key: "confirm",
                  label: "Konfirmasi Kata Sandi Baru",
                  field: "confirmPassword",
                  placeholder: "Ulangi kata sandi baru",
                },
              ].map(({ key, label, field, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords[key] ? "text" : "password"}
                      value={passwordData[field]}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          [field]: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 pr-10"
                      placeholder={placeholder}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          [key]: !showPasswords[key],
                        })
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords[key] ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setView("profile")}
                  className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-lg border border-gray-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loadingPassword}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loadingPassword ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
};

export default ProfilePage;
