import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { updateUserProfile } from "../../store/slices/authSlice";
import * as authService from "../../services/authService";
import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";

const LABELS = ["Rumah", "Kantor", "Lainnya"];

const emptyAddress = {
  label: "Rumah",
  recipientName: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
  isDefault: false,
};

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // "profile" | "edit-profile" | "edit-password" | "addresses" | "add-address" | "edit-address"
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
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Alamat
  const [addresses, setAddresses] = useState([]);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [submittingAddress, setSubmittingAddress] = useState(false);

  const roleLabel = { pembeli: "Pembeli", penjual: "Penjual", admin: "Admin" };

  // Fetch alamat saat buka tab alamat
  useEffect(() => {
    if (view === "addresses") fetchAddresses();
  }, [view]);

  const fetchAddresses = async () => {
    setLoadingAddress(true);
    try {
      const res = await authService.getAddresses();
      setAddresses(res.data);
    } catch {
      toast.error("Gagal memuat alamat");
    } finally {
      setLoadingAddress(false);
    }
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
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Konfirmasi kata sandi tidak cocok");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Kata sandi baru minimal 6 karakter");
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

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    const { recipientName, phone, address, city, postalCode } = addressForm;
    if (!recipientName || !phone || !address || !city || !postalCode) {
      toast.error("Semua field wajib diisi");
      return;
    }
    setSubmittingAddress(true);
    try {
      if (editingAddressId) {
        const res = await authService.updateAddress(
          editingAddressId,
          addressForm,
        );
        setAddresses(res.data);
        toast.success("Alamat berhasil diperbarui");
      } else {
        const res = await authService.addAddress(addressForm);
        setAddresses(res.data);
        toast.success("Alamat berhasil ditambahkan");
      }
      setView("addresses");
      setAddressForm(emptyAddress);
      setEditingAddressId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyimpan alamat");
    } finally {
      setSubmittingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Hapus alamat ini?")) return;
    try {
      const res = await authService.deleteAddress(id);
      setAddresses(res.data);
      toast.success("Alamat dihapus");
    } catch {
      toast.error("Gagal menghapus alamat");
    }
  };

  const handleEditAddress = (addr) => {
    setAddressForm({
      label: addr.label,
      recipientName: addr.recipientName,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      postalCode: addr.postalCode,
      isDefault: addr.isDefault,
    });
    setEditingAddressId(addr._id);
    setView("edit-address");
  };

  // ─── HALAMAN PROFIL ───────────────────────────────────────────
  if (view === "profile") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Profil Saya</h1>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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

            <div className="space-y-3">
              <button
                onClick={() => {
                  setProfileData({
                    name: user?.name || "",
                    phone: user?.phone || "",
                  });
                  setView("edit-profile");
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition-colors"
              >
                Edit Profil
              </button>
              <button
                onClick={() => setView("addresses")}
                className="w-full bg-white hover:bg-orange-50 text-orange-600 font-medium py-2.5 rounded-lg border border-orange-300 transition-colors"
              >
                📍 Alamat Tersimpan
              </button>
              <button
                onClick={() => {
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                  setView("edit-password");
                }}
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

  // ─── EDIT PROFIL ─────────────────────────────────────────────
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

  // ─── UBAH KATA SANDI ─────────────────────────────────────────
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

  // ─── DAFTAR ALAMAT ────────────────────────────────────────────
  if (view === "addresses") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView("profile")}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Kembali
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                Alamat Tersimpan
              </h1>
            </div>
            {addresses.length < 5 && (
              <button
                onClick={() => {
                  setAddressForm(emptyAddress);
                  setEditingAddressId(null);
                  setView("add-address");
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                + Tambah
              </button>
            )}
          </div>

          {loadingAddress ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <p className="text-4xl mb-3">📍</p>
              <p className="text-gray-500 mb-4">Belum ada alamat tersimpan</p>
              <button
                onClick={() => {
                  setAddressForm(emptyAddress);
                  setEditingAddressId(null);
                  setView("add-address");
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Tambah Alamat Pertama
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className="bg-white rounded-xl border border-gray-100 p-5"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span className="text-xs bg-orange-100 text-orange-600 font-medium px-2 py-0.5 rounded-full">
                          Utama
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditAddress(addr)}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        className="text-xs text-red-400 hover:underline"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    {addr.recipientName}
                  </p>
                  <p className="text-sm text-gray-500">{addr.phone}</p>
                  <p className="text-sm text-gray-500">
                    {addr.address}, {addr.city} {addr.postalCode}
                  </p>
                </div>
              ))}
              <p className="text-xs text-center text-gray-400">
                {addresses.length}/5 alamat tersimpan
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── FORM TAMBAH / EDIT ALAMAT ────────────────────────────────
  if (view === "add-address" || view === "edit-address") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setView("addresses")}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Kembali
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              {view === "edit-address" ? "Edit Alamat" : "Tambah Alamat Baru"}
            </h1>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <form onSubmit={handleAddressSubmit} className="space-y-4">
              {/* Label */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label Alamat
                </label>
                <div className="flex gap-2">
                  {LABELS.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() =>
                        setAddressForm({ ...addressForm, label: l })
                      }
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                        addressForm.label === l
                          ? "bg-orange-500 text-white border-orange-500"
                          : "border-gray-200 text-gray-600 hover:border-orange-300"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nama & Telepon */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Penerima <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={addressForm.recipientName}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        recipientName: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="Nama penerima"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    No. Telepon <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={addressForm.phone}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, phone: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="08xxx"
                  />
                </div>
              </div>

              {/* Alamat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat Lengkap <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={addressForm.address}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, address: e.target.value })
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                  placeholder="Jl. ..."
                />
              </div>

              {/* Kota & Kode Pos */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kota <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, city: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="Kota"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kode Pos <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={addressForm.postalCode}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        postalCode: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="12345"
                  />
                </div>
              </div>

              {/* Jadikan default */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      isDefault: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-sm text-gray-700">
                  Jadikan alamat utama
                </span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setView("addresses")}
                  className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-lg border border-gray-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingAddress}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {submittingAddress ? "Menyimpan..." : "Simpan Alamat"}
                </button>
              </div>
            </form>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
};

export default ProfilePage;
