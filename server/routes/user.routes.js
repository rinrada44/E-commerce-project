const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// ----------------------------------
// GET /api/users
// คืน Users ทั้งหมด พร้อม Address
router.get('/', userController.getAllUsers);

// GET /api/users/:id
// คืน User ตาม ID พร้อม Address
router.get('/:id', userController.getUserById);

// GET /api/users/email/:email
// คืน User ตาม Email
router.get('/email/:email', userController.getUserByEmail);

// POST /api/users
// สร้าง User ใหม่
router.post('/', userController.createUser);

// PUT /api/users/:id
// อัปเดต User
router.put('/:id', userController.updateUser);

// PATCH /api/users/delete/:id
// ลบ User แบบ soft delete
router.patch('/delete/:id', userController.deleteUser);

module.exports = router;
