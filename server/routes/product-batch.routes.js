const express = require('express');
const router = express.Router();
const productBatchController = require('../controllers/product-batch.controller');

/**
 * ✅ POST /api/product-batches
 * สร้างล็อตสินค้าใหม่ (batchCode จะถูก gen อัตโนมัติใน model)
 */
router.post('/', productBatchController.createProductBatch);

/**
 * ✅ GET /api/product-batches
 * ดึงข้อมูลล็อตสินค้าทั้งหมด
 */
router.get('/', productBatchController.getAllProductBatches);

/**
 * ✅ GET /api/product-batches/:id
 * ดึงข้อมูลล็อตสินค้าตาม ID
 */
router.get('/:id', productBatchController.getProductBatchById);

/**
 * ✅ PUT /api/product-batches/:id
 * อัปเดตล็อตสินค้า (เช่น batchName, description, จำนวนสินค้า ฯลฯ)
 */
router.put('/:id', productBatchController.updateProductBatch);

/**
 * ✅ PATCH /api/product-batches/:id/delete
 * Soft delete ล็อตสินค้า (isDeleted = true)
 */
router.patch('/:id/delete', productBatchController.deleteProductBatch);

module.exports = router;
