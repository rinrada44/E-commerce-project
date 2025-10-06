const productModel = require('../models/product.model');
const categoryModel = require('../models/category.model');
const productColorModel = require("../models/productColor.model");
const toObjectId = require("../utils/toObjectId");
// สร้าง Product ใหม่
const createProduct = async (req, res) => {
  try {
    console.log('ข้อมูลที่ได้รับจาก frontend (req.body):', req.body);
    console.log('ประเภทข้อมูล:', typeof req.body);
    console.log('Content-Type:', req.headers['content-type']);
    
    // รับข้อมูลจาก frontend และตรวจสอบว่ามีค่าหรือไม่
    const { name, sku, description, price, weight, material, dimensions, categoryId, roomId } = req.body;
    
    console.log('ข้อมูลหลังจากแยก:', { 
      name, 
      description, 
      price, 
      categoryId: categoryId || 'ไม่ได้ระบุ',
      categoryIdType: categoryId ? typeof categoryId : 'ไม่มีข้อมูล'
    });
    
    if (!name || !price) {
      return res.status(400).json({ error: 'ต้องระบุชื่อและราคาสินค้า' });
    }
    
    if (!categoryId || categoryId === '') {
      return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน กรุณาเลือกหมวดหมู่สินค้า' });
    }
    
    // ตรวจสอบว่า categoryId เป็น ObjectId ที่ถูกต้อง
    console.log('ตรวจสอบ categoryId:', {
      categoryId,
      type: typeof categoryId,
      isValid: require('mongoose').Types.ObjectId.isValid(categoryId)
    });
    
    if (!require('mongoose').Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ error: 'categoryId ไม่ถูกต้องตามรูปแบบ ObjectId' });
    }
    
    // ตรวจสอบว่าหมวดหมู่มีอยู่จริง
    const category = await categoryModel.getCategoryById(categoryId);
    console.log('ผลการค้นหาหมวดหมู่:', category);
    
    if (!category) {
      return res.status(404).json({ error: 'ไม่พบหมวดหมู่ที่ระบุ' });
    }
    
    const product = await productModel.createProduct({
      name,
      sku,
      description,
      price,
      weight,
      material,
      dimensions,
      categoryId,
      roomId
    });
    

    res.status(201).json(product);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการสร้างสินค้า:', error);
    
    if (error.message === 'ข้อมูลไม่ครบถ้วน กรุณาเลือกหมวดหมู่สินค้า') {
      return res.status(400).json({ error: error.message });
    } else if (error.message === 'รูปแบบรหัสหมวดหมู่ไม่ถูกต้อง') {
      return res.status(400).json({ error: error.message });
    } else if (error.code === 11000) { // MongoDB duplicate key error
      return res.status(400).json({ error: 'มีสินค้านี้อยู่แล้ว' });
    } else {
      return res.status(500).json({ error: 'ไม่สามารถสร้างสินค้าได้', details: error.message });
    }
  }
};

// ดึงข้อมูล Product ทั้งหมด
const getAllProducts = async (req, res) => {
  const { r, c, q } = req.query;  // Extract 'r' (room) and 'c' (category) from the query string
  try {
    // Fetch products using dynamic filters for room and category
    const products = await productModel.getAllProducts(r, c, q);

    // Use Promise.all to handle async operations for each product
    const productsWithImages = await Promise.all(
        products.map(async (product) => {
          // Fetch colors associated with each product
          const colors = await productColorModel.getByProductId(toObjectId(product._id));

          // If colors exist, assign the first color's main image, otherwise null
          const mainImage = colors && colors.length > 0 ? colors[0].main_img : null;

          // Return the product with the injected 'main_img' field
          return {
            ...product.toObject(), // Convert Mongoose Document to plain object
            main_img: mainImage,    // Inject the main image
          };
        })
    );

    // Send the response with products that have the main image field added
    res.json(productsWithImages);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า:', error);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลสินค้าได้' });
  }
};



// ดึงข้อมูล Product ตาม ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.getProductById(id);
    
    if (!product) {
      return res.status(404).json({ error: 'ไม่พบสินค้า' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า:', error);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลสินค้าได้' });
  }
};

const getTopProducts = async (req, res) => {
  try {
    const products = await productModel.getTopProducts();
    res.status(200).json(products);
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'ไม่สามารถดึงสินค้ายอดนิยมได้', error: err.message });
  }
};

// อัพเดต Product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, description, price, color, weight, material, dimensions, categoryId, roomId } = req.body;
    
    // ถ้ามีการอัพเดต categoryId ให้ตรวจสอบว่าหมวดหมู่มีอยู่จริง
    if (categoryId) {
      const category = await categoryModel.getCategoryById(categoryId);
      
      if (!category) {
        return res.status(404).json({ error: 'ไม่พบหมวดหมู่' });
      }
    }
    
    const product = await productModel.updateProduct(id, {
      name,
      sku,
      description,
      price,
      color,
      weight,
      material,
      dimensions,
      categoryId,
      roomId
    });
    
    res.json(product);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการอัพเดตสินค้า:', error);
    res.status(500).json({ error: 'ไม่สามารถอัพเดตสินค้าได้', details: error.message });
  }
};

// ลบ Product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await productModel.deleteProduct(id);
    
    res.status(204).send();
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการลบสินค้า:', error);
    res.status(500).json({ error: 'ไม่สามารถลบสินค้าได้', details: error.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  getTopProducts,
  updateProduct,
  deleteProduct
};
