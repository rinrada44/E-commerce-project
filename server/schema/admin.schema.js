const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema(
  {
    name: {                  // ชื่อผู้ใช้
      type: String,
      required: true,
      trim: true
    },
    email: {                 // อีเมล
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    phone: {                 // เบอร์โทร
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    password: {              // รหัสผ่าน
      type: String,
      required: true,
      trim: true
    },
    status: {                // สถานะผู้ใช้
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  { timestamps: true } // สร้าง createdAt, updatedAt อัตโนมัติ
);

module.exports = mongoose.model('Admin', AdminSchema);
