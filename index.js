import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import multer from "multer"
import path from "path"
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// Middleware
app.use(cors())
app.use(express.json())
app.use("/uploads", express.static("uploads"))

// MongoDB Connection - Atlas
mongoose.connect("mongodb+srv://ghassenyounes89:amina123@cluster0.0vlvpwb.mongodb.net/ghssen-cars?retryWrites=true&w=majority&appName=Cluster0")

// معالجة أحداث الاتصال
mongoose.connection.on('connected', () => {
  console.log('✅ Connected to MongoDB Atlas successfully!')
})

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err)
})

// Car Schema
const carSchema = new mongoose.Schema({
  name: String,
  details: String,
  price: Number,
  photo: String,
  createdAt: { type: Date, default: Date.now },
})

const Car = mongoose.model("Car", carSchema)

// Order Schema - محدث
const orderSchema = new mongoose.Schema({
  carName: String,
  carPrice: Number,
  wilaya: String,        // تم التحديث
  phone: String,
  email: String,
  clientName: String,    // تم الإضافة
  createdAt: { type: Date, default: Date.now },
})

const Order = mongoose.model("Order", orderSchema)

// File Upload Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  },
})

const upload = multer({ storage: storage })

// 📱 PUBLIC ROUTES - للعملاء فقط
app.get("/", (req, res) => {
  res.json({ 
    message: "🏠 Welcome to Ghssen Cars - Find your dream car today",
    instructions: "هذه الصفحة للعملاء - يمكنهم رؤية السيارات وعمل طلبات فقط"
  })
})

// الحصول على السيارات (للعملاء)
app.get("/api/public/cars", async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 })
    res.json(cars)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// إنشاء طلب جديد (للعملاء) - محدث
app.post("/api/public/orders", async (req, res) => {
  try {
    const order = new Order({
      carName: req.body.carName,
      carPrice: req.body.carPrice,
      wilaya: req.body.wilaya,        // تم التحديث
      phone: req.body.phone,
      email: req.body.email,
      clientName: req.body.clientName, // تم الإضافة
    })
    const newOrder = await order.save()
    
    // إشعار عند استلام طلب جديد
    console.log('🆕 New Order Received:')
    console.log('   Car:', newOrder.carName)
    console.log('   Price: $', newOrder.carPrice)
    console.log('   Client:', newOrder.clientName)
    console.log('   Email:', newOrder.email)
    console.log('   Phone:', newOrder.phone)
    console.log('   Wilaya:', newOrder.wilaya)
    console.log('   Date:', newOrder.createdAt)
    
    res.status(201).json(newOrder)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// 🔐 ADMIN ROUTES - للمشرف فقط
app.get("/admin", (req, res) => {
  res.json({ 
    message: "🔐 Admin Panel - Welcome to Ghssen Cars Admin",
    instructions: "هذه الصفحة للمشرف فقط - يمكنك إدارة السيارات والطلبات"
  })
})

// الحصول على جميع السيارات (للمشرف)
app.get("/api/admin/cars", async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 })
    res.json(cars)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// إضافة سيارة جديدة (للمشرف)
app.post("/api/admin/cars", upload.single("photo"), async (req, res) => {
  try {
    const car = new Car({
      name: req.body.name,
      details: req.body.details,
      price: req.body.price,
      photo: req.file ? `/uploads/${req.file.filename}` : "",
    })
    const newCar = await car.save()
    res.status(201).json(newCar)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// حذف سيارة (للمشرف)
app.delete("/api/admin/cars/:id", async (req, res) => {
  try {
    await Car.findByIdAndDelete(req.params.id)
    res.json({ message: "Car deleted" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// الحصول على جميع الطلبات (للمشرف)
app.get("/api/admin/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// حذف طلب (للمشرف)
app.delete("/api/admin/orders/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id)
    res.json({ message: "Order deleted" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

const PORT =   process.env.PORT || 5000;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})