const Address = require("../schema/address.schema");
const User = require("../schema/user.schema");
const mongoose = require('mongoose');
const toObjectId = require("../utils/toObjectId");

// ✅ Create Address
const createAddress = async (data) => {
    try {
        if (!data || typeof data !== 'object') throw new Error('ข้อมูลไม่ถูกต้อง');

        const { userId, fullname, phone, address, tambon, amphure, province, zip_code } = data;

        if (!fullname || typeof fullname !== 'string') throw new Error('ต้องระบุชื่อ');
        const trimmedName = fullname.trim();
        if (trimmedName.length < 2) throw new Error('ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร');
        if (trimmedName.length > 50) throw new Error('ชื่อต้องไม่เกิน 50 ตัวอักษร');

        const addressData = {
            userId: toObjectId(userId),
            fullname: trimmedName,
            phone,
            address,
            tambon,
            amphure,
            province,
            zip_code,
        };

        const newAddress = new Address(addressData);
        const savedAddress = await newAddress.save();

        return savedAddress;
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการสร้าง Address:', error.message);
        throw error;
    }
};

// ✅ Get All Address (optional populate user)
const getAllAddress = async (populateUser = false) => {
    const addresses = await Address.find({ isDeleted: false }).sort({ created_at: 1 }).lean();

    if (populateUser) {
        return await Promise.all(
            addresses.map(async (addr) => {
                const user = await User.findById(addr.userId).lean();
                return { ...addr, user };
            })
        );
    }

    return addresses;
};

// ✅ Get Address By ID (populate user)
const getAddressById = async (id, populateUser = false) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    const addr = await Address.findById(id).lean();
    if (!addr) return null;

    if (populateUser) {
        const user = await User.findById(addr.userId).lean();
        return { ...addr, user };
    }

    return addr;
};

// ✅ Update Address
const updateAddress = async (id, data) => {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) throw new Error('ID ไม่ถูกต้อง');
    if (!data || typeof data !== 'object') throw new Error('ข้อมูลไม่ถูกต้อง');

    const { fullname, phone, address, tambon, amphure, province, zip_code } = data;

    if (!fullname || typeof fullname !== 'string') throw new Error('ต้องระบุชื่อ');
    const trimmedName = fullname.trim();
    if (trimmedName.length < 2) throw new Error('ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร');
    if (trimmedName.length > 50) throw new Error('ชื่อต้องไม่เกิน 50 ตัวอักษร');

    const updateData = { fullname: trimmedName, phone, address, tambon, amphure, province, zip_code };

    const updated = await Address.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) throw new Error('ไม่พบที่อยู่');

    return updated;
};

// ✅ Delete Address (soft delete)
const deleteAddress = async (id) => {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) throw new Error('ID ไม่ถูกต้อง');

    const existing = await Address.findById(id);
    if (!existing || existing.isDeleted) throw new Error('ไม่พบที่อยู่นี้');

    const deleted = await Address.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    return deleted;
};

module.exports = {
    createAddress,
    getAllAddress,
    getAddressById,
    updateAddress,
    deleteAddress
};
