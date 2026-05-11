import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

// @desc    Create order
// @route   POST /api/orders
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
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      totalAmount,
      notes,
    });

    // Kurangi stok produk
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

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
