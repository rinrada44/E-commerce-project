const Product = require('../schema/product.schema');
const mongoose = require('mongoose');
const toObjectId = require("../utils/toObjectId");
const OrderItem = require('../schema/orderItems.schema');
const productColorModel = require("./productColor.model");

// ✅ ฟังก์ชันสร้าง SKU ในรูปแบบ PROD-YYMMDD-XXXXX
function generateSKU() {
  const date = new Date();
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 7).toUpperCase(); // 5 ตัวอักษรสุ่ม
  return `PROD-${yy}${mm}${dd}-${random}`;
}

// ✅ สร้าง Product
const createProduct = async (data) => {
  try {
    console.log('ตรวจสอบ categoryId:', data.categoryId, 'ประเภท:', typeof data.categoryId);

    if (!data.categoryId || data.categoryId === '') {
      throw new Error('ข้อมูลไม่ครบถ้วน กรุณาเลือกหมวดหมู่สินค้า');
    }
    if (!mongoose.Types.ObjectId.isValid(data.categoryId)) {
      throw new Error('รูปแบบรหัสหมวดหมู่ไม่ถูกต้อง');
    }

    // ✅ ตรวจสอบ SKU (ถ้าไม่มี ให้ระบบสร้างใหม่)
    let sku = data.sku;
    if (!sku || sku.trim() === '') {
      sku = generateSKU();
    } else {
      sku = String(sku).toUpperCase();
    }

    const productData = {
      name: data.name,
      sku,
      description: data.description || '',
      price: parseFloat(data.price),
      weight: data.weight || '',
      material: data.material || '',
      dimensions: data.dimensions || '',
      categoryId: new mongoose.Types.ObjectId(data.categoryId),
      subCategoryId: data.subCategoryId ? new mongoose.Types.ObjectId(data.subCategoryId) : null,
      roomId: new mongoose.Types.ObjectId(data.roomId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();

    // ✅ populate ให้ครบ category / subCategory / room
    const populatedProduct = await Product.findById(savedProduct._id)
      .populate('categoryId', 'name')
      .populate('subCategoryId', 'name')
      .populate('roomId', 'name')
      .exec();

    return populatedProduct;
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการสร้างสินค้า:', error);
    throw error;
  }
};

// ✅ ดึงข้อมูล Product ทั้งหมด (พร้อมรูปจาก ProductColor)
const getAllProducts = async (room, category, searchQuery) => {
  try {
    const query = { isDeleted: { $ne: true } };

    if (room) query['roomId'] = toObjectId(room);
    if (category) query['categoryId'] = toObjectId(category);
    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, 'i');
      query['$or'] = [
        { name: { $regex: searchRegex } },
        { sku: { $regex: searchRegex } },
      ];
    }

    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .populate('subCategoryId', 'name')
      .populate('roomId', 'name')
      .sort({ createdAt: -1 })
      .exec();

    // ✅ เพิ่มภาพหลักจาก productColor
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const colors = await productColorModel.getByProductId(product._id);

        let mainImage = null;
        if (colors && colors.length > 0) {
          const firstColor = colors.find(c => !c.isDeleted);
          if (firstColor && firstColor.main_img) {
            mainImage = firstColor.main_img;
          }
        }

        return {
          ...product.toObject(),
          imageUrl: mainImage
            ? `http://localhost:8002/uploads/product/${mainImage}`
            : null,
          colors,
        };
      })
    );

    return productsWithImages;
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า:', error);
    throw error;
  }
};

// ✅ ดึง Product ตาม ID
const getProductById = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    const product = await Product.findById(id)
      .populate('categoryId', 'name')
      .populate('subCategoryId', 'name')
      .populate('roomId', 'name')
      .exec();

    // ✅ เพิ่มรูปในกรณีดึงแบบเดี่ยว
    const colors = await productColorModel.getByProductId(id);
    let mainImage = null;
    if (colors && colors.length > 0) {
      const firstColor = colors.find(c => !c.isDeleted);
      if (firstColor && firstColor.main_img) {
        mainImage = firstColor.main_img;
      }
    }

    return {
      ...product.toObject(),
      imageUrl: mainImage
        ? `http://localhost:8002/uploads/product/${mainImage}`
        : null,
      colors,
    };
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า:', error);
    throw error;
  }
};

// ✅ ดึงสินค้ายอดนิยม
const getTopProducts = async () => {
  try {
    const topProductsData = await OrderItem.aggregate([
      { $group: { _id: "$productId", totalSold: { $sum: "$quantity" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 3 },
      { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
      { $unwind: "$product" },
      { $match: { "product.isDeleted": { $ne: true } } },
    ]);

    const populatedProducts = await Promise.all(
      topProductsData.map(async (entry) => {
        const fullProduct = await Product.findById(entry.product._id)
          .populate('categoryId', 'name')
          .populate('subCategoryId', 'name')
          .populate('roomId', 'name')
          .lean();

        const colors = await productColorModel.getByProductId(toObjectId(fullProduct._id));
        const main_img = colors && colors.length > 0 ? colors[0].main_img : null;

        return {
          ...fullProduct,
          totalSold: entry.totalSold,
          imageUrl: main_img
            ? `http://localhost:8002/uploads/product/${main_img}`
            : null,
          colors,
        };
      })
    );

    return populatedProducts;
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการดึงสินค้ายอดนิยม:', error);
    throw error;
  }
};

// ✅ อัพเดต Product
const updateProduct = async (id, data) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('รูปแบบ ID ไม่ถูกต้อง');

    const updateData = {
      name: data.name,
      sku: data.sku ? String(data.sku).toUpperCase() : undefined,
      description: data.description,
      price: parseFloat(data.price),
      color: data.color,
      weight: data.weight || '',
      material: data.material || '',
      dimensions: data.dimensions || '',
      categoryId: data.categoryId ? new mongoose.Types.ObjectId(data.categoryId) : null,
      subCategoryId: data.subCategoryId ? new mongoose.Types.ObjectId(data.subCategoryId) : null,
      roomId: data.roomId ? new mongoose.Types.ObjectId(data.roomId) : null,
      updatedAt: new Date(),
    };

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true })
      .populate('categoryId', 'name')
      .populate('subCategoryId', 'name')
      .populate('roomId', 'name')
      .exec();

    if (!updatedProduct) throw new Error('ไม่พบสินค้าที่ต้องการอัพเดต');

    return updatedProduct;
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการอัพเดตสินค้า:', error);
    throw error;
  }
};

// ✅ ลบ Product (soft delete)
const deleteProduct = async (id) => {
  try {
    if (!id) throw new Error('ไม่ได้ระบุ ID ของสินค้า');
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('รูปแบบ ID ไม่ถูกต้อง');

    const objectId = new mongoose.Types.ObjectId(id);
    const productToDelete = await Product.findById(objectId);
    if (!productToDelete) throw new Error('ไม่พบสินค้าที่ต้องการลบ');

    const result = await Product.findByIdAndUpdate(objectId, { isDeleted: true }, { new: true });
    if (!result) throw new Error('ไม่สามารถลบสินค้าได้');

    return true;
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการลบสินค้า:', error);
    throw error;
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
