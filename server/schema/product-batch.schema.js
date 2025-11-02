const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// สร้าง Schema สำหรับสินค้าในล็อต
const batchProductSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  colorId: { type: Schema.Types.ObjectId, ref: 'ProductColor', required: true },
  quantity: { type: Number, default: 0, min: 0 },
  createdAt: { type: Date, default: Date.now }
});

// สร้าง Schema สำหรับล็อตสินค้า
const productBatchSchema = new Schema({
  batchName: { type: String, required: true, trim: true },
  batchCode: { type: String, unique: true, trim: true },
  description: { type: String, default: '', trim: true },
  totalProducts: { type: Number, default: 0 },
  totalQuantity: { type: Number, default: 0 },
  products: [batchProductSchema],
  notes: { type: String, default: '' },
  tags: { type: [String], default: [] },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

// Counter สำหรับ gen batchCode
const counterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});
const Counter = mongoose.model('Counter', counterSchema);

// pre-save hook สำหรับ gen batchCode
productBatchSchema.pre('validate', async function (next) {
  if (!this.batchCode) {
    try {
      const date = new Date();
      const yy = String(date.getFullYear()).slice(-2);
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const datePart = `${yy}${mm}${dd}`;

      // สร้างตัวอักษร + ตัวเลขสุ่ม 4 ตัว
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let randomPart = '';
      for (let i = 0; i < 4; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      this.batchCode = `BATCH-${datePart}-${randomPart}`;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});


const ProductBatch = mongoose.model('ProductBatch', productBatchSchema);

module.exports = { ProductBatch, Counter };
