import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

// @desc  Buat review — SD #10: Mengirim data ulasan → Validasi → Menyimpan ulasan
// @route POST /api/reviews
export const createReview = async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;

    // Validasi ulasan
    if (!productId || !orderId || !rating) {
      return res.status(400).json({ message: "Data ulasan tidak lengkap" });
    }
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating harus antara 1 sampai 5" });
    }

    // Pastikan order milik user dan statusnya delivered
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Tidak memiliki akses" });
    }
    if (order.status !== "delivered") {
      return res.status(400).json({ message: "Pesanan belum selesai" });
    }

    // Cek produk ada di order
    const itemExists = order.items.some(
      (item) => item.product.toString() === productId,
    );
    if (!itemExists) {
      return res
        .status(400)
        .json({ message: "Produk tidak ada di pesanan ini" });
    }

    // Cek sudah pernah review
    const existing = await Review.findOne({
      product: productId,
      order: orderId,
      user: req.user._id,
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Anda sudah memberikan ulasan untuk produk ini" });
    }

    // Simpan ulasan
    const review = await Review.create({
      product: productId,
      order: orderId,
      user: req.user._id,
      rating,
      comment,
    });

    // Update avgRating & reviewCount di produk
    const allReviews = await Review.find({ product: productId });
    const avg =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Product.findByIdAndUpdate(productId, {
      avgRating: Math.round(avg * 10) / 10,
      reviewCount: allReviews.length,
    });

    await review.populate("user", "name");
    res.status(201).json(review);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Anda sudah memberikan ulasan untuk produk ini" });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc  Ambil semua review per produk
// @route GET /api/reviews/product/:productId
export const getReviewsByProduct = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Cek apakah user sudah review produk di order tertentu
// @route GET /api/reviews/check?productId=&orderId=
export const checkReviewed = async (req, res) => {
  try {
    const { productId, orderId } = req.query;
    const existing = await Review.findOne({
      product: productId,
      order: orderId,
      user: req.user._id,
    });
    res.json({ reviewed: !!existing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
