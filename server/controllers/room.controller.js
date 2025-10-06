const roomService = require('../models/room.model');
const path = require('path');
const fs = require('fs');

// Get all rooms
const getRooms = async (req, res) => {
    try {
        const rooms = await roomService.getAllRooms();
        res.status(200).json(rooms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get room by ID
const getRoomById = async (req, res) => {
    try {
        const room = await roomService.getById(req.params.id);
        if (!room) return res.status(404).json({ message: 'ไม่พบข้อมูลห้อง' });
        res.status(200).json(room);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new room
const createRoom = async (req, res) => {
    try {
        const { name } = req.body;
        const fileName = req.file ? req.file.filename : null;

        const newRoom = await roomService.createRoom({ name, fileName });
        res.status(201).json(newRoom);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update a room
const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, removeImage } = req.body;

        const existingRoom = await roomService.getById(id);
        if (!existingRoom) return res.status(404).json({ message: 'ไม่พบข้อมูลห้อง' });

        let fileName = existingRoom.fileName;

        if (removeImage === 'true' && fileName) {
            const oldPath = path.join(__dirname, '..', 'public', 'uploads', 'room', fileName);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            fileName = null;
        }

        if (req.file && req.file.filename) {
            if (fileName) {
                const oldPath = path.join(__dirname, '..', 'public', 'uploads', 'room', fileName);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            fileName = req.file.filename;
        }

        const updatedRoom = await roomService.updateRoom(id, { name, fileName });
        res.status(200).json(updatedRoom);
    } catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ message: err.message });
    }
};

// Delete a room
const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRoom = await roomService.deleteRoom(id);
        if (!deletedRoom) return res.status(404).json({ message: 'ไม่พบห้องที่ต้องการลบ' });

        if (deletedRoom.fileName) {
            const filePath = path.join(__dirname, '..', 'public', 'uploads', 'room', deletedRoom.fileName);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        res.status(200).json({ message: 'ลบห้องเรียบร้อย', room: deletedRoom });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ message: err.message });
    }
};

// Export ฟังก์ชันทั้งหมด
module.exports = {
    getRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom
};
