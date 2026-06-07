import { Link } from "react-router-dom";
import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-amber-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-6xl">🍳</span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mt-4 mb-4 leading-tight">
            Cita Rasa Rumahan,
            <br />
            <span className="text-orange-500">Langsung ke Meja Anda</span>
          </h1>
          <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto">
            Produk makanan UMKM berkualitas dari Dapur Si Mbok. Dibuat dengan
            resep tradisional pilihan.
          </p>
          <Link
            to="/products"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors inline-block"
          >
            Belanja Sekarang →
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
              🛍️
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Produk Pilihan</h3>
            <p className="text-sm text-gray-500">
              Dibuat fresh dengan bahan berkualitas setiap harinya
            </p>
          </div>
          <div className="p-6">
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
              ⭐
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Terpercaya</h3>
            <p className="text-sm text-gray-500">
              Ratusan pelanggan puas setiap bulannya
            </p>
          </div>
          <div className="p-6">
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
              🚚
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Pengiriman Cepat
            </h3>
            <p className="text-sm text-gray-500">
              Dikirim langsung ke rumah Anda dengan aman
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-orange-500 py-14 px-4 text-center text-white">
        <h2 className="text-2xl font-bold mb-3">Siap Memesan?</h2>
        <p className="mb-6 opacity-90">
          Pesan sekarang dan nikmati cita rasa rumahan terbaik
        </p>
        <Link
          to="/products"
          className="bg-white text-orange-600 font-semibold px-8 py-3 rounded-lg hover:bg-orange-50 transition-colors inline-block"
        >
          Lihat Semua Produk
        </Link>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
