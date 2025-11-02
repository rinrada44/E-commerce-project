const mongoose = require("mongoose");
const { hashPassword } = require("../utils/passwordUtils");

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", AdminSchema);

// สร้าง admin
const createAdmin = async (data) => {
  const { name, email, phone, password, status } = data;

  if (!name || !email || !phone || !password)
    throw new Error("กรุณากรอกข้อมูลครบทุกช่อง");

  const existingEmail = await Admin.findOne({ email: email.toLowerCase().trim() });
  if (existingEmail) throw new Error("อีเมลนี้ถูกใช้งานแล้ว");

  const existingPhone = await Admin.findOne({ phone: phone.trim() });
  if (existingPhone) throw new Error("เบอร์โทรนี้ถูกใช้งานแล้ว");

  const hashedPassword = await hashPassword(password.trim());

  const newAdmin = new Admin({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    password: hashedPassword,
    status: status || 'active',
  });

  return await newAdmin.save();
};

// ดึง admin ทั้งหมด
const getAllAdmins = async () => {
  // เรียง status: active ก่อน inactive
  return await Admin.find().sort({ status: 1, createdAt: -1 });
};

// ดึง admin ตาม ID
const getAdminById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return await Admin.findById(id);
};

// ดึง admin ตามอีเมล
const getAdminByEmail = async (email) => {
  if (!email) return null;
  return await Admin.findOne({ email: email.toLowerCase().trim() });
};

// อัปเดต admin
const updateAdmin = async (id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("ID ไม่ถูกต้อง");

  const updateData = {};
  if (data.name) updateData.name = data.name.trim();
  if (data.email) updateData.email = data.email.toLowerCase().trim();
  if (data.phone) updateData.phone = data.phone.trim();
  if (data.status) updateData.status = data.status;
  if (data.password) updateData.password = await hashPassword(data.password.trim());

  const updatedAdmin = await Admin.findByIdAndUpdate(id, updateData, { new: true });
  if (!updatedAdmin) throw new Error("ไม่พบผู้ดูแลระบบ");

  return updatedAdmin;
};

// ลบ admin แบบ Hard Delete
const hardDeleteAdmin = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("ID ไม่ถูกต้อง");

  const admin = await Admin.findByIdAndDelete(id);
  if (!admin) throw new Error("ไม่พบผู้ดูแลระบบ");

  return admin;
};

module.exports = {
  Admin,
  createAdmin,
  getAllAdmins,
  getAdminById,
  getAdminByEmail,
  updateAdmin,
  hardDeleteAdmin,
};
