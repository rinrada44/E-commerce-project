const productUnitService = require('../models/productUnit.model');

// ==============================
// สร้าง ProductUnits ใหม่
// serialNumber จะถูกสร้างอัตโนมัติใน Model
// ==============================
const createProductUnits = async (req, res) => {
  try {
    const { productId, colorId, batchId, quantity } = req.body;

    if (!productId || !colorId || !batchId || !quantity) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const units = await productUnitService.createProductUnits(
      productId,
      colorId,
      batchId,
      quantity
    );

    res.status(201).json(units);
  } catch (error) {
    console.error('Create Product Units Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==============================
// ดึง ProductUnits ทั้งหมด
// ==============================
const getAll = async (req, res) => {
  try {
    const units = await productUnitService.getProductUnits();
    res.status(200).json(units);
  } catch (error) {
    console.error('Get All Product Units Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==============================
// ดึง ProductUnits ตาม batchId
// ==============================
const getByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const units = await productUnitService.getProductUnitsByBatch(batchId);
    res.json(units);
  } catch (error) {
    console.error('Get Units By Batch Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==============================
// ดึง ProductUnits ตาม colorId
// ==============================
const getByColor = async (req, res) => {
  try {
    const { colorId } = req.params;
    const units = await productUnitService.getProductUnitsByColor(colorId);
    res.json(units);
  } catch (error) {
    console.error('Get Units By Color Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==============================
// ดึง ProductUnits ตาม productId
// ==============================
const getByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const units = await productUnitService.getProductUnitsByProduct(productId);
    res.json(units);
  } catch (error) {
    console.error('Get Units By Product Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==============================
// ดึง ProductUnit ตาม serialNumber
// ==============================
const getBySerial = async (req, res) => {
  try {
    const { serialNumber } = req.params;
    const unit = await productUnitService.getProductUnitBySerial(serialNumber);
    if (!unit) return res.status(404).json({ message: 'Not found' });
    res.json(unit);
  } catch (error) {
    console.error('Get Unit By Serial Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==============================
// อัปเดต status ของ ProductUnit
// ==============================
const updateStatus = async (req, res) => {
  try {
    const { serialNumber } = req.params;
    const { status } = req.body;

    if (!status) return res.status(400).json({ message: 'Missing status' });

    const updated = await productUnitService.updateUnitStatus(serialNumber, status);

    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (error) {
    console.error('Update Unit Status Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createProductUnits,
  getAll,
  getByBatch,
  getByColor,
  getByProduct,
  getBySerial,
  updateStatus,
};
