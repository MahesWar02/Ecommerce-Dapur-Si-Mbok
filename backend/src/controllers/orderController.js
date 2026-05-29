import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import midtransClient from "midtrans-client";
// @desc    Create order
// @route   POST /api/orders
export const getPaymentToken = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product")
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Tidak memiliki akses" });
    }

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    const parameter = {
      transaction_details: {
        order_id: order._id.toString(),
        gross_amount: order.totalAmount,
      },
      customer_details: {
        first_name: order.shippingAddress.recipientName,
        phone: order.shippingAddress.phone,
        email: order.user.email,
        shipping_address: {
          first_name: order.shippingAddress.recipientName,
          phone: order.shippingAddress.phone,
          address: order.shippingAddress.address,
          city: order.shippingAddress.city,
          postal_code: order.shippingAddress.postalCode,
          country_code: "IDN",
        },
      },
      item_details: order.items.map((item) => ({
        id: item.product._id.toString(),
        price: item.price,
        quantity: item.quantity,
        name: item.product.name,
      })),
    };

    const transaction = await snap.createTransaction(parameter);

    // Simpan token ke order
    order.paymentToken = transaction.token;
    await order.save();

    res.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Handle Midtrans webhook notification
// @route   POST /api/orders/notification
export const handlePaymentNotification = async (req, res) => {
  try {
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    const notification = await snap.transaction.notification(req.body);
    const { order_id, transaction_status, fraud_status } = notification;

    const order = await Order.findById(order_id);
    if (!order) {
      return res.status(404).json({ message: "Order tidak ditemukan" });
    }

    // Update status berdasarkan notifikasi Midtrans
    if (transaction_status === "capture" && fraud_status === "accept") {
      order.status = "paid";
    } else if (transaction_status === "settlement") {
      order.status = "paid";
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire"
    ) {
      order.status = "cancelled";
    } else if (transaction_status === "pending") {
      order.status = "pending";
    }

    await order.save();
    res.status(200).json({ message: "OK" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, notes } = req.body;

    // Cek stok dan hitung total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Produk tidak ditemukan` });
      }
      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Stok ${product.name} tidak cukup` });
      }
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });
      totalAmount += product.price * item.quantity;
    }

    // Buat order
    // Buat order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      totalAmount,
      notes,
      expiredAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    });

    // Kosongkan keranjang
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    await order.populate("items.product");
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my orders
// @route   GET /api/orders/my
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by id
// @route   GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product")
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    // Pastikan user hanya bisa lihat pesanannya sendiri
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "penjual"
    ) {
      return res.status(403).json({ message: "Tidak memiliki akses" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (admin/penjual)
// @route   GET /api/orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.product")
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    order.status = status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Confirm order received
// @route   PUT /api/orders/:id/confirm-received
export const confirmOrderReceived = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Tidak memiliki akses" });
    }

    order.status = "delivered";
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markOrderPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Pesanan tidak ditemukan",
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Tidak memiliki akses",
      });
    }

    // Cegah double payment
    if (order.status === "paid") {
      return res.status(400).json({
        message: "Pesanan sudah dibayar",
      });
    }

    // Kurangi stok SETELAH pembayaran berhasil
    for (const item of order.items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          message: "Produk tidak ditemukan",
        });
      }

      // Validasi stok
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Stok ${product.name} tidak cukup`,
        });
      }

      product.stock -= item.quantity;

      await product.save();
    }

    order.status = "paid";

    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Pesanan tidak ditemukan",
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Tidak memiliki akses",
      });
    }

    if (order.status === "paid") {
      return res.status(400).json({
        message: "Pesanan yang sudah dibayar tidak bisa dibatalkan",
      });
    }

    order.status = "cancelled";

    await order.save();

    res.json({
      message: "Pesanan berhasil dibatalkan",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const autoCancelExpiredOrders = async () => {
  try {
    const expiredOrders = await Order.find({
      status: "pending",
      expiredAt: { $lt: new Date() },
    });

    for (const order of expiredOrders) {
      order.status = "cancelled";

      await order.save();
    }

    console.log("Auto cancel expired orders selesai");
  } catch (error) {
    console.log(error.message);
  }
};

// @desc  Laporan penjualan — SD #15
// @route GET /api/orders/report?startDate=&endDate=
export const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let filter = {
      status: { $in: ["paid", "processing", "shipped", "delivered"] },
    };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const orders = await Order.find(filter)
      .populate("items.product", "name category price")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    // Hitung ringkasan
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = orders.length;

    // Produk terlaris
    const productMap = {};
    orders.forEach((o) => {
      o.items.forEach((item) => {
        const pid = item.product?._id?.toString();
        if (!pid) return;
        if (!productMap[pid]) {
          productMap[pid] = {
            name: item.product.name,
            category: item.product.category,
            qty: 0,
            revenue: 0,
          };
        }
        productMap[pid].qty += item.quantity;
        productMap[pid].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    res.json({ orders, totalRevenue, totalOrders, topProducts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOfflineOrder = async (req, res) => {
  try {
    const { customerName, items, notes, transactionDate } = req.body;

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ message: "Nama pelanggan wajib diisi" });
    }
    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Minimal satu produk harus dipilih" });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      if (!item.product || item.quantity < 1) {
        return res.status(400).json({ message: "Data produk tidak valid" });
      }
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: "Produk tidak ditemukan" });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Stok ${product.name} tidak cukup (tersisa ${product.stock})`,
        });
      }
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });
      totalAmount += product.price * item.quantity;
      product.stock -= item.quantity;
      await product.save();
    }

    // Gunakan tanggal dari input, fallback ke sekarang
    const createdAt = transactionDate ? new Date(transactionDate) : new Date();

    const order = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress: {
        recipientName: customerName,
        phone: "-",
        address: "Transaksi Offline",
        city: "-",
        postalCode: "-",
      },
      totalAmount,
      notes: notes || "",
      status: "delivered",
      isOffline: true,
      customerName: customerName.trim(),
    });

    // Override timestamps dengan tanggal transaksi yang dipilih
    order.createdAt = createdAt;
    order.updatedAt = createdAt;
    await order.save();

    await order.populate("items.product", "name price image");
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
