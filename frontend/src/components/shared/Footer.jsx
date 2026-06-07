import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-orange-500 text-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🍳</span>
              <span className="font-bold text-lg">Dapur Si Mbok</span>
            </div>
            <p className="text-sm text-orange-100">
              Jajanan tradisional homemade dengan cita rasa autentik khas
              rumahan.
            </p>
          </div>

          {/* Navigasi */}
          <div>
            <h4 className="font-semibold mb-3">Navigasi</h4>
            <ul className="space-y-2 text-sm text-orange-100">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="hover:text-white transition-colors"
                >
                  Produk
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="hover:text-white transition-colors"
                >
                  Pesanan Saya
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="hover:text-white transition-colors"
                >
                  Profil
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="font-semibold mb-3">Kontak Kami</h4>
            <ul className="space-y-2 text-sm text-orange-100">
              <li className="flex items-start gap-2">
                <span>📍</span>
                <div>
                  <p>Perum Trully Purwasari Blok N No.17</p>
                  <p>Purwasari, Karawang, Jawa Barat</p>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <span>📱</span>
                <span>+62 857-7771-7139</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📧</span>
                <span>dapursimbok0@gmail.com</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🕐</span>
                <div>
                  <p>Setiap Hari</p>
                  <p>08.00 - 20.00 WIB</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="border-t border-orange-400 mt-8 pt-5 text-center text-xs text-orange-100">
          © {new Date().getFullYear()} Dapur Si Mbok. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
