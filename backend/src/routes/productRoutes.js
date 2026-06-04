import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "dapur-si-mbok",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

// Public routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Private routes (admin/penjual only)
router.post(
  "/",
  protect,
  authorize("admin", "penjual"),
  upload.single("image"),
  createProduct,
);
router.put(
  "/:id",
  protect,
  authorize("admin", "penjual"),
  upload.single("image"),
  updateProduct,
);
router.delete("/:id", protect, authorize("admin", "penjual"), deleteProduct);

export default router;
