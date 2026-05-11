import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  confirmOrderReceived,
} from "../controllers/orderController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

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

export default router;
