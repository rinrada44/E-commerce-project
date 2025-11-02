const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// ✅ สร้างสินค้า
// POST /api/products/create
router.post('/create', productController.createProduct);

// ✅ ดึงสินค้าทั้งหมด
// GET /api/products
router.get('/', productController.getAllProducts);

// ✅ ดึงสินค้าตาม ID
// GET /api/products/:id
router.get('/:id', productController.getProductById);

// ✅ อัพเดตสินค้า
// PUT /api/products/:id
router.put('/:id', productController.updateProduct);

// ✅ ลบสินค้าแบบ soft delete
// DELETE /api/products/:id
router.delete('/:id', productController.deleteProduct);

module.exports = router;
