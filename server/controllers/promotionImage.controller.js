// controllers/promotionImage.controller.js

const service = require('../models/promotionImage.model');

// ✅ อัปโหลดรูปใหม่
const create = async (req, res) => {
  try {
    const file = req.file;
    const result = await service.createImage(file);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ✅ ดึงรูปทั้งหมด
const getAll = async (req, res) => {
  try {
    const result = await service.getAllImages();
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// ✅ ลบรูป
const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await service.deleteImage(id);
    res.status(200).json({ success: true, message: 'Image deleted', data: result });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

// ✅ ตั้งรูปเป็นภาพหลัก
const setMain = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await service.setMainImage(id);
    res.status(200).json({ success: true, message: 'ตั้งภาพหลักเรียบร้อยแล้ว', data: result });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  create,
  remove,
  getAll,
  setMain, // ✅ เพิ่มฟังก์ชันใหม่
};
