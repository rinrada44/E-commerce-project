// models/PromotionImage.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ✅ เปลี่ยนชื่อไฟล์ให้สื่อความหมายชัดเจนว่าเป็น promotion image
const PromotionImageSchema = new Schema({
  filename: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: '',
  },
  // ✅ เพิ่มฟิลด์ isMain เพื่อเก็บสถานะภาพหลัก
  isMain: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ เพิ่ม index สำหรับ createdAt เพื่อเรียงลำดับเวลาเร็วขึ้น
PromotionImageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PromotionImage', PromotionImageSchema);
