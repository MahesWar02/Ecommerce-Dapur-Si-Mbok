import express from "express";
import {
  createReview,
  getReviewsByProduct,
  checkReviewed,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createReview);
router.get("/product/:productId", getReviewsByProduct);
router.get("/check", protect, checkReviewed);

export default router;
