const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ กำหนดการจัดเก็บไฟล์ด้วย multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      const { productId, colorId } = req.params;

      // ✅ ใช้ path.join เพื่อป้องกัน error จากเครื่องต่างระบบ
      const uploadDir = path.join(
        __dirname,
        `../public/uploads/product/${productId}/${colorId}`
      );

      // ✅ ตรวจสอบและสร้างโฟลเดอร์ถ้ายังไม่มี
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
  },

  filename: function (req, file, cb) {
    // ✅ สร้างชื่อไฟล์ไม่ให้ซ้ำกัน
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `color-${uniqueSuffix}${ext}`);
  },
});

// ✅ ฟิลเตอร์ไฟล์: รับเฉพาะรูปภาพ
const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('รองรับเฉพาะไฟล์รูปภาพเท่านั้น'), false);
  }
};

// ✅ ตั้งค่า multer
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // จำกัดขนาดไฟล์ 10MB
  fileFilter,
});

module.exports = upload;
