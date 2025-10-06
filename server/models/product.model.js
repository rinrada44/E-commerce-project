const Product = require('../schema/product.schema');
const mongoose = require('mongoose');
const toObjectId = require("../utils/toObjectId");
const OrderItem = require('../schema/orderItems.schema');
const productColorModel = require("./productColor.model");
// สร้าง Product
const createProduct = async (data) => {
  try {
    // ตรวจสอบว่ามีการระบุหมวดหมู่สินค้าหรือไม่
    console.log('ตรวจสอบ categoryId:', data.categoryId, 'ประเภท:', typeof data.categoryId);
    
    // ตรวจสอบว่า categoryId เป็น null, undefined หรือสตริงว่าง
    if (!data.categoryId || data.categoryId === '') {
      throw new Error('ข้อมูลไม่ครบถ้วน กรุณาเลือกหมวดหมู่สินค้า');
    }

    // ตรวจสอบความถูกต้องของ categoryId
    if (!mongoose.Types.ObjectId.isValid(data.categoryId)) {
      throw new Error('รูปแบบรหัสหมวดหมู่ไม่ถูกต้อง');
    }
    
    // สร้างข้อมูล Product
    const productData = {
      name: data.name,
      sku: data.sku.toUpperCase(),
      description: data.description || '',
      price: parseFloat(data.price),
      weight: data.weight || '',
      material: data.material || '',
      dimensions: data.dimensions || '',
      categoryId: new mongoose.Types.ObjectId(data.categoryId),
      roomId: new mongoose.Types.ObjectId(data.roomId),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // สร้าง Product ใหม่
    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();
    
    // ดึงข้อมูล Product ที่เพิ่งสร้างพร้อมข้อมูล Category (ถ้ามี)
    const populatedProduct = await Product.findById(savedProduct._id)
      .populate('categoryId')
      .populate('roomId')
      .exec();
    
    return populatedProduct;
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการสร้างสินค้า:', error);
    throw error;
  }
};

// ดึงข้อมูล Product ทั้งหมด
const getAllProducts = async (room, category, searchQuery) => {
  try {
    // Build the base query
    const query = { isDeleted: { $ne: true } };

    // Add room filter if provided
    if (room) {
      query['roomId'] = toObjectId(room); // Match directly on roomId
    }

    // Add category filter if provided
    if (category) {
      query['categoryId'] = toObjectId(category); // Match directly on categoryId
    }

    // Add search query filter if provided
    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, 'i'); // Case-insensitive search
      query['$or'] = [
        { 'name': { $regex: searchRegex } },  // Search by product name
        { 'sku': { $regex: searchRegex } },  // Search by product description
      ];
    }

    // Execute the query and populate related fields
    const products = await Product.find(query)
        .populate('roomId') // Populate the roomId field
        .populate('categoryId') // Populate the categoryId field
        .sort({createdAt: -1})
        .exec();

    return products;
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า:', error);
    throw error;
  }
};



// ดึงข้อมูล Product ตาม ID
const getProductById = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    
    const product = await Product.findById(id)
    .populate('categoryId')
    .populate('roomId')
      .exec();
    
    return product;
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า:', error);
    throw error;
  }
};

// ดึงสินค้ายอดนิยม 6 อันดับ (จากยอดขายรวม)
const getTopProducts = async () => {
  try {

    const topProductsData = await OrderItem.aggregate([
      {
        $group: {
          _id: "$productId",
          totalSold: { $sum: "$quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $match: {
          "product.isDeleted": { $ne: true }
        }
      }
    ]);


    const populatedProducts = await Promise.all(
      topProductsData.map(async (entry, index) => {

        const fullProduct = await Product.findById(entry.product._id)
          .populate("categoryId")
          .populate("roomId")
          .lean();


        const colors = await productColorModel.getByProductId(toObjectId(fullProduct._id));
        const main_img = colors && colors.length > 0 ? colors[0].main_img : null;


        return {
          ...fullProduct,
          totalSold: entry.totalSold,
          main_img
        };
      })
    );


    return populatedProducts;
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการดึงสินค้ายอดนิยม:", error);
    throw error;
  }
};


// อัพเดต Product
const updateProduct = async (id, data) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('รูปแบบ ID ไม่ถูกต้อง');
    }
    
    const updateData = {
      name: data.name,
      sku: data.sku,
      description: data.description,
      price: parseFloat(data.price),
      color: data.color,
      weight: data.weight || '',
      material: data.material || '',
      dimensions: data.dimensions || '',
      categoryId: data.categoryId ? new mongoose.Types.ObjectId(data.categoryId) : null,
      roomId: data.roomId ? new mongoose.Types.ObjectId(data.roomId) : null,
      updatedAt: new Date()
    };
    
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true } // ส่งข้อมูลที่อัพเดตแล้วกลับมา
    ).populate('categoryId').populate('roomId').exec();
    
    if (!updatedProduct) {
      throw new Error('ไม่พบสินค้าที่ต้องการอัพเดต');
    }
    
    return updatedProduct;
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการอัพเดตสินค้า:', error);
    throw error;
  }
};

// ลบ Product
const deleteProduct = async (id) => {
  try {
    console.log('กำลังลบสินค้าที่มี ID:', id, 'ประเภทข้อมูล:', typeof id);
    
    // ตรวจสอบว่ามี ID หรือไม่
    if (!id) {
      console.error('ไม่ได้ระบุ ID ของสินค้า');
      throw new Error('ไม่ได้ระบุ ID ของสินค้า');
    }
    
    // ตรวจสอบว่า ID มีรูปแบบเป็น ObjectId หรือไม่
    let objectId;
    
    // ตรวจสอบว่า ID เป็นอ็อบเจ็กต์ที่มี $oid หรือไม่
    if (typeof id === 'object' && id.$oid) {
      console.log('พบ ID ในรูปแบบอ็อบเจ็กต์ที่มี $oid:', id.$oid);
      id = id.$oid; // ใช้ค่า $oid แทน
    }
    
    // ตรวจสอบว่า ID ถูกต้องตามรูปแบบ ObjectId หรือไม่
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error('รูปแบบ ID ไม่ถูกต้อง:', id);
      throw new Error('รูปแบบ ID ไม่ถูกต้อง');
    }
    
    try {
      // ใช้ new mongoose.Types.ObjectId เพื่อสร้าง ObjectId ที่ถูกต้อง
      objectId = new mongoose.Types.ObjectId(id);
      console.log('แปลงเป็น ObjectId แล้ว:', objectId);
    } catch (err) {
      console.error('ไม่สามารถแปลง ID เป็น ObjectId ได้:', err);
      throw new Error('รูปแบบ ID ไม่ถูกต้อง');
    }
    
    // ค้นหาสินค้าก่อนลบ
    const productToDelete = await Product.findById(objectId);
    if (!productToDelete) {
      console.error('ไม่พบสินค้าที่ต้องการลบ:', id);
      throw new Error('ไม่พบสินค้าที่ต้องการลบ');
    }
    
    console.log('พบสินค้าที่ต้องการลบ:', productToDelete.name);
    
    // ลบสินค้า
    const result = await Product.findByIdAndUpdate(objectId, { isDeleted: true }, { new: true });
    
    if (!result) {
      console.error('ไม่สามารถลบสินค้าได้:', id);
      throw new Error('ไม่สามารถลบสินค้าได้');
    }
    
    console.log('ลบสินค้าสำเร็จ:', id);
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
  deleteProduct
};
