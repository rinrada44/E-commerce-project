require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('./config/mongoose');
const routes = require('./routes');
const initializeStripe = require('./utils/stripe');
const Order = require("./schema/order.schema");
const OrderItem = require("./schema/orderItems.schema");
const CartItem = require("./schema/cartItems.schema");
const ProductColor = require("./schema/productColor.schema");
const Cart = require("./schema/cart.schema");
const ProductUnit = require("./schema/productUnit.schema");
const Stock = require("./schema/stock.schema");
const { sendOrderNotify, sendBillingEmail } = require('./middlewares/nodemailer');
const User = require('./schema/user.schema');
const toObjectId = require('./utils/toObjectId');

const app = express();
const PORT = process.env.PORT || 8005;

// ------------------------
// Middleware
// ------------------------
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// สร้างโฟลเดอร์อัปโหลดถ้ายังไม่มี
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ตั้งค่า multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('รองรับเฉพาะไฟล์รูปภาพเท่านั้น'), false);
  }
});

// ------------------------
// Routes
// ------------------------

// Legacy API
app.get('/api/items', (req, res) => {
  const items = [
    { id: 1, name: 'สินค้า 1' },
    { id: 2, name: 'สินค้า 2' },
    { id: 3, name: 'สินค้า 3' }
  ];
  res.json(items);
});

// Root
app.get('/', (req, res) => res.send('ยินดีต้อนรับสู่ API ร้านค้าออนไลน์!'));

// Upload images
app.post('/api/upload', (req, res) => {
  console.log('ได้รับคำขออัปโหลดรูปภาพ');
  
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
    console.error('ไม่ใช่ multipart/form-data');
    return res.status(400).json({ error: 'ต้องส่งข้อมูลแบบ multipart/form-data เท่านั้น' });
  }

  upload.array('images', 10)(req, res, (err) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการอัปโหลด:', err.message);
      return res.status(400).json({ error: err.message });
    }

    const files = req.files;
    if (!files || files.length === 0) {
      console.error('ไม่พบไฟล์รูปภาพ');
      return res.status(400).json({ error: 'ไม่พบไฟล์รูปภาพ' });
    }

    const fileUrls = files.map(file => `/uploads/${file.filename}`);
    console.log('อัปโหลดสำเร็จ:', fileUrls);
    res.status(200).json({ urls: fileUrls });
  });
});

// Stripe webhook
app.post("/api/webhook/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
      const stripe = await initializeStripe();
      event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
    } catch (err) {
      console.error("⚠️ Webhook signature verification failed.", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const { type } = event;

    if (type === "checkout.session.completed") {
      const session = event.data.object;
      const metadata = session.metadata;

      if (!metadata) return res.status(400).send("Missing metadata in session");

      try {
        const {
          cartId,
          userId,
          addressId,
          amount,
          payment_method,
          payment_fee,
          isDelivery,
          isDiscount,
          couponId,
          discount_amount
        } = metadata;

        const cartItems = await CartItem.find({ cartId }).lean();
        if (!cartItems.length) return res.status(404).send("No cart items found");

        const newOrder = await Order.create({
          userId,
          addressId,
          isDelivery: isDelivery === "true",
          isDiscount: isDiscount === "true",
          couponId: couponId || null,
          discount_amount: parseFloat(discount_amount),
          payment_method,
          status: "รอจัดส่ง",
          payment_fee: parseFloat(payment_fee),
          amount: parseFloat(amount),
        });

        for (const item of cartItems) {
          await OrderItem.create({
            orderId: newOrder._id,
            productId: item.productId,
            productColorId: item.productColorId,
            price: item.price,
            quantity: item.quantity,
            total: item.total,
          });

          const productUnits = await ProductUnit.find({
            productId: item.productId,
            colorId: item.productColorId,
            status: 'in-stock',
          })
            .sort({ createdAt: 1 })
            .limit(item.quantity);

          if (productUnits.length < item.quantity) {
            console.error(`❗ สินค้าไม่พอ: productId=${item.productId}, colorId=${item.productColorId}`);
            return res.status(400).send("สินค้าไม่พอในคลัง");
          }

          const unitIds = productUnits.map(unit => unit._id);
          await ProductUnit.updateMany(
            { _id: { $in: unitIds } },
            { $set: { status: 'sold', createdAt: new Date() } }
          );

          await Stock.create({
            transaction_type: 'ขายออก',
            transaction_date: new Date(),
            batchCode: productUnits[0].batchId,
            productId: item.productId,
            productColorId: item.productColorId,
            productUnitId: productUnits[0]._id,
            stock_change: -item.quantity,
          });

          await ProductColor.findByIdAndUpdate(
            item.productColorId,
            { $inc: { quantity: -item.quantity } },
            { new: true }
          );
        }

        await CartItem.deleteMany({ cartId });
        await Cart.findByIdAndDelete(cartId);

        await sendOrderNotify(newOrder._id);

        const user = await User.findById(toObjectId(userId));
        if (user && user.email) {
          await sendBillingEmail(newOrder._id, user.email, {
            amount: parseFloat(amount),
            payment_fee: parseFloat(payment_fee),
            isDiscount: isDiscount === "true",
            discount_amount: parseFloat(discount_amount),
            payment_method,
            status: "รอจัดส่ง"
          });
        }

        res.status(200).json({ received: true });
      } catch (error) {
        console.error("❌ เกิดข้อผิดพลาดในการดำเนินการ:", error.message);
        res.status(500).send("เกิดข้อผิดพลาดภายในระบบ");
      }
    } else {
      console.warn(`⚠️ ประเภทอีเวนต์ไม่ได้จัดการ: ${type}`);
      res.status(200).json({ message: "Unhandled event type" });
    }
  }
);

// ใช้งาน routes หลัก
app.use('/api', routes);

// ------------------------
// เริ่มเซิร์ฟเวอร์
// ------------------------
app.listen(PORT, () => {
  console.log(`เซิร์ฟเวอร์กำลังทำงานที่พอร์ต ${PORT}`);
});

// จัดการการปิดระบบอย่างถูกต้อง
process.on('SIGINT', async () => {
  await mongoose.disconnect();
  console.log('ปิดการเชื่อมต่อ MongoDB แล้ว');
  process.exit(0);
});
