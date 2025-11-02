const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// ✅ Public routes
router.post('/login', adminController.adminLogin); // Login Admin
router.post('/forgot', adminController.forgot); // Forgot password
router.post('/reset-password', adminController.reset); // Reset password

// ✅ Protected/Admin management routes
router.post('/', adminController.createAdmin); // Create Admin
router.put('/:id', adminController.updateAdmin); // Update Admin
router.put('/change-password/:userId', adminController.changePassword); // Change password
router.delete('/:id', adminController.deleteAdmin); // Hard Delete Admin

// ✅ Get Admin(s)
router.get('/', adminController.getAllAdmins); // Get All Admins
router.get('/:id', adminController.getAdminById); // Get Admin by ID

module.exports = router;
