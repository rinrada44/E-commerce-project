const express = require('express');
const router = express.Router();

// Import routes
const categoryRoutes = require('./category.routes');
const subCategoryRoutes = require('./subCategory.routes'); // แก้ path ให้ตรงกับไฟล์จริง
const productRoutes = require('./product.routes');
const productColorImageRoutes = require('./productColorImage.routes');
const productBatchRoutes = require('./product-batch.routes');
const orderRoutes = require('./order.routes');
const adminRoutes = require('./admin.routes');
const roomRoutes = require('./room.routes');
const productColorRoutes = require('./productColor.routes');
const productUnitRoutes = require('./productUnit.routes');
const authRoutes = require('./auth.routes');
const cartRoutes = require('./cart.routes');
const addressRoutes = require('./address.routes');
const wishlistRoutes = require('./wishlist.routes');
const reviewRoutes = require('./review.routes');
const couponRoutes = require('./coupon.routes');
const userRoutes = require('./user.routes');
const stockRoutes = require('./stock.routes');
const dashboardRoutes = require('./dashboard.routes');
const promotionImageRoutes = require('./promotionImage.routes');

// Mount routes
router.use('/categories', categoryRoutes);
router.use('/subcategories', subCategoryRoutes); // เพิ่ม subCategory router
router.use('/products', productRoutes);
router.use('/productColorImg', productColorImageRoutes);
router.use('/product-batches', productBatchRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);
router.use('/rooms', roomRoutes);
router.use('/productColor', productColorRoutes);
router.use('/productUnit', productUnitRoutes);
router.use('/auth', authRoutes);
router.use('/cart', cartRoutes);
router.use('/address', addressRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/review', reviewRoutes);
router.use('/coupon', couponRoutes);
router.use('/users', userRoutes);
router.use('/stock', stockRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/promotion-images', promotionImageRoutes);

// Route หลัก
router.get('/', (req, res) => {
  res.send('ยินดีต้อนรับสู่ API ร้านค้าออนไลน์!');
});

module.exports = router;
