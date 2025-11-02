const Room = require('../schema/room.schema');
const Product = require('../schema/product.schema');

// ดึงห้องทั้งหมด
const getAllRooms = async () => {
  return await Room.find().sort({ createdAt: -1 });
};

// ดึงห้องตาม ID
const getById = async (id) => {
  return await Room.findById(id);
};

// สร้างห้อง
const createRoom = async (data) => {
  const room = new Room(data);
  return await room.save();
};

// อัปเดตห้อง
const updateRoom = async (id, data) => {
  return await Room.findByIdAndUpdate(id, data, { new: true });
};

// ลบห้อง
const deleteRoom = async (id, force = false) => {
  if (!force) {
    const productsCount = await Product.countDocuments({ roomId: id });
    if (productsCount > 0) {
      throw new Error('ไม่สามารถลบห้องที่มีสินค้าอยู่ได้');
    }
  } else {
    // ลบสินค้าที่อยู่ในห้องก่อน
    await Product.deleteMany({ roomId: id });
  }

  return await Room.findByIdAndDelete(id);
};



module.exports = {
  getAllRooms,
  getById,
  createRoom,
  updateRoom,
  deleteRoom,
};
