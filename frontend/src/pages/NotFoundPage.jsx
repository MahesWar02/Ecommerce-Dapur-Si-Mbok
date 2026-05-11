import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4">
      <div className="text-center">
        <span className="text-8xl">🍳</span>
        <h1 className="text-6xl font-bold text-orange-500 mt-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mt-2">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-gray-500 mt-2 mb-8">
          Maaf, halaman yang Anda cari tidak tersedia atau sedang dalam
          pengembangan.
        </p>
        <Link
          to="/"
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors inline-block"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
