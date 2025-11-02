const express = require("express");
const router = express.Router();
const controller = require("../controllers/review.controller");

// ✅ สร้างรีวิว
router.post("/", controller.createReview);

// ✅ ดึงรีวิวทั้งหมด
router.get("/", controller.getAllReviews);

// ✅ ดึงรีวิวตาม ID
router.get("/:id", controller.getReviewById);

// ✅ ดึงคะแนนเฉลี่ยของสินค้า (วางไว้ก่อน /product/:productId เพื่อไม่ให้ชนกัน)
router.get("/product/:productId/average", controller.getProductAverageScore);

// ✅ ดึงรีวิวทั้งหมดของสินค้านั้น
router.get("/product/:productId", controller.getReviewsByProductId);

// ✅ ดึงรีวิวทั้งหมดของผู้ใช้
router.get("/user/:userId", controller.getReviewsByUserId);

// ✅ อัปเดตรีวิว
router.put("/:id", controller.updateReview);

// ✅ ลบรีวิว (soft delete)
router.delete("/:id", controller.deleteReview);

// ✅ ลบรีวิวถาวร
router.delete("/:id/permanent", controller.permanentDeleteReview);

module.exports = router;
