// controllers/productColorImage.controller.js
const imagesModel = require("../models/productColorImage.model");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// สร้างรูปภาพใหม่
const createImages = async (req, res) => {
  try {
    const { colorId } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "กรุณาอัพโหลดไฟล์รูปภาพ" });
    }

    const images = req.files.map((file) => ({
      fileName: file.filename,
      colorId: new mongoose.Types.ObjectId(colorId),
    }));

    const savedImages = await imagesModel.createProductColorImages(images);
    return res.status(201).json(savedImages);
  } catch (err) {
    console.error("Error uploading images:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ดึงรูปภาพทั้งหมดของสี
const getAllProductImages = async (req, res) => {
  try {
    const { colorId } = req.params;
    const images = await imagesModel.getAll(colorId); // <-- ใช้ model ของเรา
    return res.status(200).json(images);
  } catch (err) {
    console.error("Error fetching images:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ดึงรูปภาพตาม ID
const getProductImageById = async (req, res) => {
  try {
    const objectId = new mongoose.Types.ObjectId(req.params.id);
    const image = await imagesModel.getById(objectId);
    if (!image) return res.status(404).json({ message: "Product image not found" });
    return res.json(image);
  } catch (err) {
    console.error("Error fetching image:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ลบรูปภาพเดียว
const deleteProductImage = async (req, res) => {
  try {
    const { productId, colorId, id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid image ID" });
    }

    const objectId = new mongoose.Types.ObjectId(id);
    const image = await imagesModel.getById(objectId);
    if (!image) return res.status(404).json({ message: "Product image not found" });

    const filePath = path.join(__dirname, "../public/uploads/product", productId, colorId, image.fileName);

    await imagesModel.remove(objectId);

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    else console.warn(`File not found: ${filePath}`);

    return res.status(200).json({ message: "Image deleted successfully" });
  } catch (err) {
    console.error("Error deleting image:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ลบหลายรูปพร้อมกัน
const deleteSelectedProductImages = async (req, res) => {
  try {
    const { ids } = req.body;
    const { productId, colorId } = req.params;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Image IDs are required" });
    }

    const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length) {
      return res.status(400).json({ message: "One or more image IDs are invalid", invalidIds });
    }

    const deleted = [];
    const notFound = [];

    for (const id of ids) {
      const objectId = new mongoose.Types.ObjectId(id);
      const image = await imagesModel.getById(objectId);

      if (!image) {
        notFound.push(id);
        continue;
      }

      const filePath = path.join(__dirname, "../public/uploads/product", productId, colorId, image.fileName);

      await imagesModel.remove(objectId);

      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      else console.warn(`File not found: ${filePath}`);

      deleted.push(id);
    }

    return res.status(200).json({
      message: "Selected images processed",
      deletedCount: deleted.length,
      notFoundCount: notFound.length,
      deleted,
      notFound,
    });
  } catch (err) {
    console.error("Error deleting selected images:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createImages,
  getAllProductImages,
  getProductImageById,
  deleteProductImage,
  deleteSelectedProductImages,
};
