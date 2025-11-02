// models/promotionImage.model.js

const PromotionImage = require('../schema/promotionImage.schema');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../public/uploads/promotion/');

// ✅ อัปโหลดรูปภาพ
const createImage = async (file) => {
  if (!file) throw new Error('No file uploaded');

  const newImage = new PromotionImage({
    filename: file.filename,
  });

  return await newImage.save();
};

// ✅ ลบรูปภาพ
const deleteImage = async (id) => {
  const image = await PromotionImage.findById(id);
  if (!image) throw new Error('Image not found');

  const filePath = path.join(uploadDir, image.filename);

  // ลบไฟล์ออกจากเครื่อง
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  return await PromotionImage.findByIdAndDelete(id);
};

// ✅ ดึงรูปภาพทั้งหมด (เรียงให้ภาพหลักมาก่อน)
const getAllImages = async () => {
  return await PromotionImage.find({}).sort({ isMain: -1, createdAt: -1 });
};

// ✅ ตั้งภาพหลัก
const setMainImage = async (id) => {
  // เอาค่า isMain ออกจากทุกภาพก่อน
  await PromotionImage.updateMany({}, { isMain: false });

  // ตั้งภาพนี้เป็นภาพหลัก
  const updated = await PromotionImage.findByIdAndUpdate(
    id,
    { isMain: true },
    { new: true }
  );

  if (!updated) throw new Error('Image not found');

  return updated;
};

module.exports = {
  createImage,
  deleteImage,
  getAllImages,
  setMainImage, // ✅ เพิ่มฟังก์ชันใหม่
};
