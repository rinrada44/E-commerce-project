const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// สร้าง Schema สำหรับ Product
const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  weight: {
    type: String,
    default: '',
    trim: true
  },
  material: {
    type: String,
    default: '',
    trim: true
  },
  dimensions: {
    type: String,
    default: '',
    trim: true
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  // ✅ เพิ่มประเภทย่อย (SubCategory)
  subCategoryId: {
    type: Schema.Types.ObjectId,
    ref: 'SubCategory', // ต้องมี model ชื่อ SubCategory ในระบบด้วย
    default: null
  },
  roomId: {
    type: Schema.Types.ObjectId,
    ref: 'Room'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
});

// สร้าง Model จาก Schema
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
