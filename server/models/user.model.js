const User = require('../schema/user.schema');
const Address = require('../schema/address.schema');
const mongoose = require('mongoose');

// ✅ Create User
const createUser = async (data) => {
    try {
        const { email, password } = data;

        if (!email || !password) {
            throw new Error('กรุณาระบุอีเมลและรหัสผ่าน');
        }

        const user = new User({
            email: email.trim(),
            password: password.trim(),
        });

        return await user.save();
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการสร้างผู้ใช้:', error.message);
        throw error;
    }
};

// ✅ Get All Users + Address
const getAllUsers = async () => {
    const users = await User.find({ isDeleted: { $ne: true } }).sort({ created_at: -1 }).lean();

    // Merge Address
    const usersWithAddress = await Promise.all(
        users.map(async (user) => {
            const address = await Address.findOne({ userId: user._id, isDeleted: false }).lean();
            return { ...user, address };
        })
    );

    return usersWithAddress;
};

// ✅ Get User By ID + Address
const getUserById = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    const user = await User.findById(id).lean();
    if (!user) return null;

    const address = await Address.findOne({ userId: user._id, isDeleted: false }).lean();
    return { ...user, address };
};

// ✅ Get User By Email
const getUserByEmail = async (email) => {
    return await User.findOne({ email: email.trim() });
};

// ✅ Update User
const updateUser = async (id, data) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('ID ไม่ถูกต้อง');
        }

        const updated = await User.findByIdAndUpdate(id, data, { new: true });

        if (!updated) {
            throw new Error('ไม่พบผู้ใช้ที่ต้องการอัปเดต');
        }

        return updated;
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการอัปเดตผู้ใช้:', error.message);
        throw error;
    }
};

// ✅ Delete User (soft delete)
const deleteUser = async (id) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('ID ไม่ถูกต้อง');
        }

        const deleted = await User.findById(id);

        if (!deleted) {
            throw new Error('ไม่พบผู้ใช้ที่ต้องการลบ');
        }

        deleted.isDeleted = true;
        await deleted.save();

        return deleted;
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลบผู้ใช้:', error.message);
        throw error;
    }
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    getUserByEmail,
    updateUser,
    deleteUser
};
