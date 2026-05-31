import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      recipientName: { type: String, default: "-" },
      phone: { type: String, default: "-" },
      address: { type: String, default: "-" },
      city: { type: String, default: "-" },
      postalCode: { type: String, default: "-" },
    },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    expiredAt: { type: Date },
    paymentToken: { type: String, default: "" },
    notes: { type: String, default: "" },
    // Transaksi offline
    isOffline: { type: Boolean, default: false },
    customerName: { type: String, default: "" },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
