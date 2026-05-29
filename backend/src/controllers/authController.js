import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Register user
// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Cek email sudah terdaftar
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    // Buat user baru
    const user = await User.create({ name, email, password, role });

    res.status(201).json({ message: "Registrasi berhasil" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cek user ada
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email atau kata sandi salah" });
    }

    // Cek password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email atau kata sandi salah" });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
export const logout = async (req, res) => {
  res.json({ message: "Logout berhasil" });
};

// @desc    Get current user
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Kata sandi lama salah" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Kata sandi baru minimal 6 karakter" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Kata sandi berhasil diubah" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request reset password — kirim email
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email wajib diisi" });
    }

    const user = await User.findOne({ email });

    // Selalu response sukses agar tidak bocorkan info email terdaftar
    if (!user) {
      return res.json({
        message: "Jika email terdaftar, link reset akan dikirim",
      });
    }

    // Buat token reset
    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 jam
    await user.save({ validateBeforeSave: false });

    // Kirim email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Dapur Si Mbok" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset Kata Sandi - Dapur Si Mbok",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
          <h2 style="color: #f97316;">Dapur Si Mbok</h2>
          <p>Halo <strong>${user.name}</strong>,</p>
          <p>Kami menerima permintaan reset kata sandi untuk akun Anda.</p>
          <p>Klik tombol berikut untuk membuat kata sandi baru:</p>
          <a href="${resetUrl}"
            style="display:inline-block;background:#f97316;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
            Reset Kata Sandi
          </a>
          <p style="color:#888;font-size:13px;">Link ini hanya berlaku selama <strong>1 jam</strong>.</p>
          <p style="color:#888;font-size:13px;">Jika Anda tidak meminta reset kata sandi, abaikan email ini.</p>
        </div>
      `,
    });

    res.json({ message: "Jika email terdaftar, link reset akan dikirim" });
  } catch (error) {
    console.error("Forgot password error:", error.message);
    res.status(500).json({ message: "Gagal mengirim email reset" });
  }
};

// @desc    Reset password dengan token dari email
// @route   POST /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Kata sandi minimal 6 karakter" });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }, // belum expired
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Link tidak valid atau sudah kedaluwarsa" });
    }

    // Update password & hapus token
    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: "Kata sandi berhasil diubah, silakan login" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
