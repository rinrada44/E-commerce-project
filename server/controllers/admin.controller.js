const adminModel = require('../models/admin.model');
const { generateToken } = require('../utils/jwt');
const { verifyPassword } = require('../utils/passwordUtils');
const { sendAdminResetRequest } = require('../middlewares/nodemailer');
const jwt = require("../utils/jwt");
const argon2 = require("argon2");
const toObjectId = require("../utils/toObjectId");

// ✅ สร้างแอดมินใหม่
const createAdmin = async (req, res) => {
  try {
    const { name, email, phone, password, status } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลครบทุกช่อง" });
    }

    const hashedPassword = await argon2.hash(password);

    const admin = await adminModel.createAdmin({
      name,
      email,
      phone,
      password: hashedPassword,
      status: status || "active",
    });

    res.status(201).json(admin);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// ✅ ดึงแอดมินทั้งหมด
const getAllAdmins = async (req, res) => {
  try {
    const admins = await adminModel.getAllAdmins();
    res.status(200).json(admins);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ ดึงแอดมินตาม ID
const getAdminById = async (req, res) => {
  try {
    const admin = await adminModel.getAdminById(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.status(200).json(admin);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ อัปเดตข้อมูลแอดมิน
const updateAdmin = async (req, res) => {
  try {
    const { name, email, phone, status, password } = req.body;
    const updateData = { name, email, phone, status };

    // ถ้ามีรหัสผ่านใหม่ ให้ hash ก่อน
    if (password) {
      updateData.password = await argon2.hash(password);
    }

    const updatedAdmin = await adminModel.updateAdmin(req.params.id, updateData);
    if (!updatedAdmin) return res.status(404).json({ message: 'Admin not found' });

    res.status(200).json(updatedAdmin);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// ✅ ลบแอดมินแบบ Hard Delete
const deleteAdmin = async (req, res) => {
  try {
    const deletedAdmin = await adminModel.hardDeleteAdmin(req.params.id);
    res.status(200).json({ message: "ลบข้อมูลสำเร็จ", admin: deletedAdmin });
  } catch (err) {
    console.error(err);
    if (err.message === "ID ไม่ถูกต้อง" || err.message === "ไม่พบผู้ดูแลระบบ") {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

// ✅ เข้าสู่ระบบ
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await adminModel.getAdminByEmail(email);
    if (!admin) return res.status(401).json({ message: 'Invalid email' });

    const isMatch = await verifyPassword(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    const token = generateToken({ id: admin._id, email: admin.email, role: "admin" });
    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ ลืมรหัสผ่าน
const forgot = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await adminModel.getAdminByEmail(email);
    if (!user) return res.status(404).json({ message: "ไม่พบบัญชีผู้ใช้ในระบบ" });

    const token = jwt.generateToken({ id: user._id });
    sendAdminResetRequest(token, email);
    res.status(200).json({ message: "ส่งคำขอสำเร็จ กรุณาตรวจสอบอีเมลของคุณ" });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

// ✅ รีเซ็ตรหัสผ่าน
const reset = async (req, res) => {
  const { password, token } = req.body;
  if (!token) return res.status(400).send("Missing token");

  try {
    const decoded = jwt.verifyToken(token);
    const userId = decoded.id;
    const hashed = await argon2.hash(password);

    const user = await adminModel.getAdminById(toObjectId(userId));
    if (!user) return res.status(404).send("Admin not found");

    await adminModel.updateAdmin(toObjectId(userId), { password: hashed });

    res.status(200).json({ message: "รีเซ็ตรหัสผ่านสำเร็จ" });
  } catch (err) {
    console.error(err);
    res.status(500).json("err");
  }
};

// ✅ เปลี่ยนรหัสผ่าน
const changePassword = async (req, res) => {
  const { userId } = req.params;
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await adminModel.getAdminById(toObjectId(userId));
    if (!user) return res.status(404).send("User not found");

    const isMatch = await argon2.verify(user.password, oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "รหัสผ่านเดิมไม่ถูกต้อง" });
    }

    const hashed = await argon2.hash(newPassword);
    await adminModel.updateAdmin(toObjectId(userId), { password: hashed });

    res.status(200).json({ message: "เปลี่ยนรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบใหม่อีกครั้ง" });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

module.exports = {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  adminLogin,
  forgot,
  reset,
  changePassword,
};
