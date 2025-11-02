const mongoose = require('mongoose');
const productModel = require('../models/product.model');
const categoryModel = require('../models/category.model');
const SubCategory = require('../schema/subCategory.schema');
const productColorModel = require("../models/productColor.model");

// 🧩 ฟังก์ชันสร้าง SKU อัตโนมัติ (PROD-YYMMDD-XXXXX)
function generateSKU() {
  const date = new Date();
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `PROD-${yy}${mm}${dd}-${random}`;
}

// 🖼️ ฟังก์ชันช่วยสร้าง URL เต็มของรูป
function buildImageUrl(req, imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath; // ถ้ามี http อยู่แล้วไม่ต้องต่อ
  return `${req.protocol}://${req.get('host')}/${imagePath}`;
}

// 🧱 สร้าง Product ใหม่
const createProduct = async (req, res) => {
  try {
    const { name, description, price, weight, material, dimensions, categoryId, subCategoryId, roomId } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'ต้องระบุชื่อและราคาสินค้า' });
    }

    if (!categoryId || categoryId === '') {
      return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน กรุณาเลือกหมวดหมู่สินค้า' });
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ error: 'categoryId ไม่ถูกต้องตามรูปแบบ ObjectId' });
    }

    const category = await categoryModel.getCategoryById(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'ไม่พบหมวดหมู่ที่ระบุ' });
    }

    const sku = generateSKU();

    const product = await productModel.createProduct({
      name,
      sku,
      description,
      price,
      weight,
      material,
      dimensions,
      categoryId,
      subCategoryId,
      roomId,
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการสร้างสินค้า:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'มีสินค้านี้อยู่แล้ว' });
    }
    return res.status(500).json({ error: 'ไม่สามารถสร้างสินค้าได้', details: error.message });
  }
};

// 📦 ดึงข้อมูล Product ทั้งหมด (พร้อม populate และรูปเต็ม URL)
const getAllProducts = async (req, res) => {
  try {
    const { r, c, q } = req.query;
    console.log("Query Params:", req.query);

    let products = await productModel.getAllProducts(r, c, q) || [];

    products = await Promise.all(products.map(async (product) => {
      // populate เฉพาะกรณีเป็น document
      if (product && typeof product.populate === 'function') {
        await product.populate([
          { path: 'categoryId', select: 'name' },
          { path: 'subCategoryId', select: 'name' },
          { path: 'roomId', select: 'name' },
        ]);
      }

      // ✅ รองรับทั้ง document และ lean object
      const data = product._doc ? product._doc : product;

      return {
        ...data,
        image: buildImageUrl(req, data.image),
      };
    }));

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("🔥 ERROR ใน getAllProducts:", error);
    res.status(500).json({ success: false, error: 'ไม่สามารถดึงข้อมูลสินค้าได้', details: error.message });
  }
};

// 🔍 ดึงข้อมูล Product ตาม ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    let product = await productModel.getProductById(id);

    if (!product) return res.status(404).json({ error: 'ไม่พบสินค้า' });

    if (product && typeof product.populate === 'function') {
      await product.populate([
        { path: 'categoryId', select: 'name' },
        { path: 'subCategoryId', select: 'name' },
        { path: 'roomId', select: 'name' },
      ]);
    }

    const data = product._doc ? product._doc : product;

    const formattedProduct = {
      ...data,
      image: buildImageUrl(req, data.image),
    };

    res.status(200).json({ success: true, data: formattedProduct });
  } catch (error) {
    console.error('🔥 ERROR ใน getProductById:', error);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลสินค้าได้', details: error.message });
  }
};

// ⭐ ดึงสินค้ายอดนิยม
const getTopProducts = async (req, res) => {
  try {
    const products = await productModel.getTopProducts();

    const formattedProducts = products.map(p => {
      const data = p._doc ? p._doc : p;
      return {
        ...data,
        image: buildImageUrl(req, data.image),
      };
    });

    res.status(200).json({ success: true, data: formattedProducts });
  } catch (err) {
    console.error('🔥 ERROR ใน getTopProducts:', err);
    res.status(500).json({ success: false, message: 'ไม่สามารถดึงสินค้ายอดนิยมได้', error: err.message });
  }
};

// ✏️ อัพเดต Product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, description, price, color, weight, material, dimensions, categoryId, subCategoryId, roomId } = req.body;

    if (categoryId) {
      const category = await categoryModel.getCategoryById(categoryId);
      if (!category) return res.status(404).json({ error: 'ไม่พบหมวดหมู่' });
    }

    const product = await productModel.updateProduct(id, {
      name, sku, description, price, color, weight, material, dimensions, categoryId, subCategoryId, roomId
    });

    if (product && typeof product.populate === 'function') {
      await product.populate([
        { path: 'categoryId', select: 'name' },
        { path: 'subCategoryId', select: 'name' },
        { path: 'roomId', select: 'name' },
      ]);
    }

    const data = product._doc ? product._doc : product;

    const formattedProduct = {
      ...data,
      image: buildImageUrl(req, data.image),
    };

    res.status(200).json({ success: true, data: formattedProduct });
  } catch (error) {
    console.error('🔥 ERROR ใน updateProduct:', error);
    res.status(500).json({ success: false, error: 'ไม่สามารถอัพเดตสินค้าได้', details: error.message });
  }
};

// 🗑️ ลบสินค้าแบบ soft delete
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productModel.deleteProduct(id);

    if (!result) return res.status(404).json({ success: false, message: 'ไม่พบสินค้า' });

    res.status(204).send();
  } catch (error) {
    console.error('🔥 ERROR ใน deleteProduct:', error);
    res.status(500).json({ success: false, error: 'ไม่สามารถลบสินค้าได้', details: error.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  getTopProducts,
  updateProduct,
  deleteProduct,
};
