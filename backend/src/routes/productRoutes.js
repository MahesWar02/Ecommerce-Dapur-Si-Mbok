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
import path from "path";

const router = express.Router();

// Setup multer untuk upload gambar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
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
