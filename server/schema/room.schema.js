const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    fileName: { type: String, trim: true, default: null }, // ✅ ไม่ required, default null
  },
  { timestamps: true }
);

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
