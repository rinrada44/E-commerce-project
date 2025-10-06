const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller');
const upload = require('../middlewares/roomImages'); // middleware สำหรับอัปโหลดรูป

router.get('/', roomController.getRooms);
router.get('/:id', roomController.getRoomById);
router.post('/', upload.single('image'), roomController.createRoom);
router.put('/:id', upload.single('image'), roomController.updateRoom);
router.delete('/:id', roomController.deleteRoom);

module.exports = router;
