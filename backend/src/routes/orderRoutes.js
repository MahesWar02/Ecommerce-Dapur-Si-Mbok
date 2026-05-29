import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  confirmOrderReceived,
  getPaymentToken,
  handlePaymentNotification,
  markOrderPaid,
  cancelOrder,
  getSalesReport,
} from "../controllers/orderController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Midtrans notification
router.post("/notification", handlePaymentNotification);

// Order routes
router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);
router.get(
  "/report",
  protect,
  authorize("admin", "penjual", "superadmin"),
  getSalesReport,
);
router.get("/", protect, authorize("admin", "penjual"), getAllOrders);
router.get("/:id", protect, getOrderById);

router.put("/:id/cancel", protect, cancelOrder);
router.put(
  "/:id/status",
  protect,
  authorize("admin", "penjual"),
  updateOrderStatus,
);
router.put("/:id/confirm-received", protect, confirmOrderReceived);
router.put("/:id/mark-paid", protect, markOrderPaid);

router.post("/:id/payment", protect, getPaymentToken);

export default router;
