// routes/promotionImage.route.js

const express = require('express');
const router = express.Router();
const controller = require('../controllers/promotionImage.controller');
const upload = require('../middlewares/promotionImage');

// ✅ อัปโหลดรูปใหม่
router.post('/', upload.single('image'), controller.create);

// ✅ ดึงรูปทั้งหมด
router.get('/', controller.getAll);

// ✅ ลบรูป
router.delete('/:id', controller.remove);

// ✅ ตั้งรูปเป็นภาพหลัก
// เมื่อเรียก /promotion-images/:id/set-main → ระบบจะตั้งภาพนี้เป็นหลัก และยกเลิก isMain ของรูปอื่น
router.put('/:id/set-main', controller.setMain);

module.exports = router;
