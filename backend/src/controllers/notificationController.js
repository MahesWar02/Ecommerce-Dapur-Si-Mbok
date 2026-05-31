import Notification from "../models/Notification.js";

// @desc    Get semua notifikasi user
// @route   GET /api/notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Jumlah notifikasi belum dibaca
// @route   GET /api/notifications/unread-count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Tandai satu notifikasi sudah dibaca
// @route   PUT /api/notifications/:id/read
export const markAsRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
    );
    res.json({ message: "OK" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Tandai semua sudah dibaca
// @route   PUT /api/notifications/read-all
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true },
    );
    res.json({ message: "OK" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Hapus semua notifikasi
// @route   DELETE /api/notifications
export const deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id });
    res.json({ message: "OK" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper — dipanggil dari controller lain (bukan route)
export const createNotification = async ({
  userId,
  title,
  message,
  type,
  orderId,
}) => {
  try {
    await Notification.create({ user: userId, title, message, type, orderId });
  } catch (error) {
    console.error("Gagal buat notifikasi:", error.message);
  }
};
