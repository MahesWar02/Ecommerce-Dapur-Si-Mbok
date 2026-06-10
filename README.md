# 🍳 Dapur Si Mbok — E-Commerce Platform

Situs web penjualan produk UMKM **Dapur Si Mbok** berbasis MERN Stack (MongoDB, Express, React, Node.js). Dibangun sebagai proyek skripsi menggunakan **Metode Prototype**.

🌐 **Live:** [https://dapursimbok.my.id](https://dapursimbok.my.id)

---

## Daftar Isi

- [Fitur](#fitur)
- [Teknologi](#teknologi)
- [Struktur Proyek](#struktur-proyek)
- [Prasyarat](#prasyarat)
- [Instalasi & Menjalankan Lokal](#instalasi--menjalankan-lokal)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Maintenance](#maintenance)

---

## Fitur

### Pelanggan (Customer)
- Registrasi & Login akun
- Lupa password & reset password via email
- Lihat & cari produk berdasarkan kategori
- Keranjang belanja
- Checkout & pembayaran online via **Midtrans**
- Riwayat pesanan & detail pesanan
- Konfirmasi pesanan diterima
- Beri ulasan produk
- Manajemen alamat tersimpan (tambah, ubah, hapus, atur default)
- Ganti profil & password
- Notifikasi in-app (polling)

### Admin / Penjual
- Manajemen produk (tambah, edit, hapus, upload foto via Cloudinary)
- Manajemen pesanan online (update status, lihat detail)
- Input transaksi offline (tunai/transfer langsung)
- Laporan penjualan (online + offline) dengan export PDF
- Sistem notifikasi pesanan masuk

---

## Teknologi

| Lapisan | Teknologi |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Redux Toolkit, Redux Persist |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas + Mongoose |
| Pembayaran | Midtrans (Sandbox/Production) |
| Upload Gambar | Cloudinary |
| Email | Nodemailer |
| Auth | JWT (JSON Web Token) |
| Deployment | Railway + Custom Domain (`dapursimbok.my.id`) |

---

## Struktur Proyek

```
Ecommerce-Dapur-Si-Mbok/
├── backend/
│   └── src/
│       ├── config/          # Koneksi DB & Cloudinary
│       ├── controllers/     # Logic bisnis (auth, produk, pesanan, dll)
│       ├── middleware/      # Auth middleware (protect, authorize)
│       ├── models/          # Mongoose schema (User, Product, Order, Cart, dll)
│       └── routes/          # Express router
│       index.js             # Entry point server
│   package.json
├── frontend/
│   └── src/
│       ├── assets/          # Gambar statis
│       ├── components/
│       │   ├── admin/       # AdminLayout, AdminRoute
│       │   ├── buyer/       # ProductCard, CartItem
│       │   └── shared/      # Navbar, Footer, NotificationBell
│       ├── hooks/           # useAuth
│       ├── pages/
│       │   ├── admin/       # Halaman admin (produk, pesanan, laporan, offline)
│       │   ├── auth/        # Login, Register, ForgotPassword, ResetPassword
│       │   └── buyer/       # Home, Cart, Checkout, Orders, OrderDetail
│       └── store/           # Redux store & slices
│   package.json
├── package.json             # Root scripts (build & start untuk Railway)
└── README.md
```

---

## Prasyarat

Pastikan sudah terinstal di komputer:

- **Node.js** v18 atau lebih baru — [nodejs.org](https://nodejs.org)
- **npm** (sudah termasuk bersama Node.js)
- Akun **MongoDB Atlas** — [mongodb.com/atlas](https://www.mongodb.com/atlas)
- Akun **Cloudinary** — [cloudinary.com](https://cloudinary.com)
- Akun **Midtrans** (Sandbox untuk development) — [midtrans.com](https://midtrans.com)

---

## Instalasi & Menjalankan Lokal

### 1. Clone repositori

```bash
git clone https://github.com/<username>/Ecommerce-Dapur-Si-Mbok.git
cd Ecommerce-Dapur-Si-Mbok
```

### 2. Install dependensi backend

```bash
cd backend
npm install
```

### 3. Buat file `.env` di folder `backend/`

Lihat bagian [Environment Variables](#environment-variables) di bawah.

### 4. Jalankan backend (development)

```bash
npm run dev
```

Server berjalan di `http://localhost:5000`

### 5. Install dependensi frontend (terminal baru)

```bash
cd frontend
npm install
```

### 6. Buat file `.env` di folder `frontend/`

```env
VITE_MIDTRANS_CLIENT_KEY=<Midtrans Client Key kamu>
```

### 7. Jalankan frontend

```bash
npm run dev
```

Frontend berjalan di `http://localhost:5173`

---

## Environment Variables

### `backend/.env`

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/dapur-si-mbok

# JWT
JWT_SECRET=<secret_key_rahasia>

# Cloudinary
CLOUDINARY_CLOUD_NAME=<cloud_name>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<api_secret>

# Midtrans
MIDTRANS_SERVER_KEY=<server_key>
MIDTRANS_CLIENT_KEY=<client_key>

# Email (Nodemailer)
EMAIL_USER=<email@gmail.com>
EMAIL_PASS=<app_password_gmail>

# URL
FRONTEND_URL=http://localhost:5173
```

### `frontend/.env`

```env
VITE_MIDTRANS_CLIENT_KEY=<Midtrans Client Key>
```

> ⚠️ **Jangan pernah commit file `.env` ke GitHub.** Pastikan `.env` sudah masuk ke `.gitignore`.

---

## API Endpoints

Base URL: `http://localhost:5000/api`

### Auth (`/api/auth`)

| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| POST | `/register` | Public | Registrasi akun baru |
| POST | `/login` | Public | Login |
| POST | `/logout` | Login | Logout |
| GET | `/me` | Login | Data profil sendiri |
| PUT | `/profile` | Login | Update profil |
| PUT | `/change-password` | Login | Ganti password |
| POST | `/forgot-password` | Public | Kirim email reset password |
| POST | `/reset-password/:token` | Public | Reset password dengan token |
| GET | `/addresses` | Login | Lihat alamat tersimpan |
| POST | `/addresses` | Login | Tambah alamat |
| PUT | `/addresses/:id` | Login | Update alamat |
| DELETE | `/addresses/:id` | Login | Hapus alamat |

### Produk (`/api/products`)

| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| GET | `/` | Public | Daftar semua produk |
| GET | `/:id` | Public | Detail produk |
| POST | `/` | Admin | Tambah produk baru |
| PUT | `/:id` | Admin | Update produk |
| DELETE | `/:id` | Admin | Hapus produk |

### Pesanan (`/api/orders`)

| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| POST | `/` | Login | Buat pesanan online |
| POST | `/offline` | Admin | Input transaksi offline |
| GET | `/my` | Login | Riwayat pesanan sendiri |
| GET | `/` | Admin | Semua pesanan |
| GET | `/report` | Admin | Laporan penjualan |
| GET | `/:id` | Login | Detail pesanan |
| PUT | `/:id/status` | Admin | Update status pesanan |
| PUT | `/:id/cancel` | Login | Batalkan pesanan |
| PUT | `/:id/confirm-received` | Login | Konfirmasi diterima |
| POST | `/:id/payment` | Login | Ambil token pembayaran Midtrans |
| POST | `/notification` | Public | Callback notifikasi Midtrans |

### Lainnya

| Prefix | Deskripsi |
|---|---|
| `/api/cart` | Manajemen keranjang belanja |
| `/api/reviews` | Ulasan produk |
| `/api/notifications` | Notifikasi in-app |

---

## Deployment

Aplikasi di-deploy ke **Railway** dengan konfigurasi berikut:

- **Build Command:** `cd backend && npm install && cd ../frontend && npm install && npm run build`
- **Start Command:** `node backend/src/index.js`
- **Environment:** semua variabel dari `backend/.env` di-set di Railway dashboard
- **Database:** MongoDB Atlas (cloud)
- **Gambar:** Cloudinary (cloud)
- **Domain:** `dapursimbok.my.id` (custom domain via Railway)

Untuk deploy ulang, cukup push ke branch `main` dan Railway akan otomatis rebuild.

---

## Maintenance

### Menambah Produk Baru

Login sebagai admin → menu **Produk** → klik **Tambah Produk**. Kategori yang tersedia:

1. Lauk Pauk
2. Sayur & Sup
3. Camilan
4. Minuman
5. Paket Hemat
6. Lainnya

### Update Status Pesanan

Login sebagai admin → menu **Pesanan** → klik pesanan → ubah status (Diproses → Dikirim → Selesai).

### Memonitor Transaksi

Cek di menu **Laporan Penjualan** untuk melihat rekap transaksi online dan offline. Bisa di-export ke PDF.

### Mengecek Log Error (Railway)

Buka Railway dashboard → pilih service → tab **Logs**. Log server tampil real-time.

### Update Dependensi

Lakukan secara berkala untuk keamanan:

```bash
# Backend
cd backend
npm outdated       # cek yang sudah lawas
npm update         # update minor & patch

# Frontend
cd frontend
npm outdated
npm update
```

> ⚠️ Untuk major version (contoh: Express 5 → 6), baca changelog dulu sebelum update karena mungkin ada breaking changes.

### Backup Database

MongoDB Atlas menyediakan backup otomatis. Untuk backup manual:

```bash
mongodump --uri="<MONGO_URI>" --out=./backup/$(date +%Y%m%d)
```

### Mengganti Midtrans dari Sandbox ke Production

1. Daftar akun Midtrans production
2. Ganti `MIDTRANS_SERVER_KEY` dan `MIDTRANS_CLIENT_KEY` di Railway dengan key production
3. Ganti `VITE_MIDTRANS_CLIENT_KEY` di frontend dan rebuild
4. Pastikan `isProduction: true` di konfigurasi Midtrans backend

---

> Dibuat oleh **Maheswara Abhista** sebagai proyek skripsi — *Rancang Bangun Situs Web Penjualan Produk UMKM Dapur Si Mbok Menggunakan Metode Prototype*
