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
} from "../controllers/orderController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Webhook Midtrans — TANPA protect (Midtrans tidak kirim token)
router.post("/notification", handlePaymentNotification);

router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);
router.get("/", protect, authorize("admin", "penjual"), getAllOrders);
router.get("/:id", protect, getOrderById);
router.put(
  "/:id/status",
  protect,
  authorize("admin", "penjual"),
  updateOrderStatus,
);
router.put("/:id/confirm-received", protect, confirmOrderReceived);
router.post("/:id/payment", protect, getPaymentToken);

export default router;
