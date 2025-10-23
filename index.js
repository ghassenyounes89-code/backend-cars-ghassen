import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection - Atlas
mongoose.connect("mongodb+srv://ghassenyounes89:amina123@cluster0.0vlvpwb.mongodb.net/ghssen-cars?retryWrites=true&w=majority&appName=Cluster0");

// ✅ Log connection events
mongoose.connection.on("connected", () => {
  console.log("✅ Connected to MongoDB Atlas successfully!");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
});

// 🚗 Car Schema
const carSchema = new mongoose.Schema({
  name: String,
  details: String,
  price: Number,
  photo: String, // سيكون رابط Firebase
  createdAt: { type: Date, default: Date.now },
});
const Car = mongoose.model("Car", carSchema);

// 🧾 Order Schema
const orderSchema = new mongoose.Schema({
  carName: String,
  carPrice: Number,
  wilaya: String,
  phone: String,
  email: String,
  clientName: String,
  createdAt: { type: Date, default: Date.now },
});
const Order = mongoose.model("Order", orderSchema);

// 🏠 PUBLIC ROUTES
app.get("/", (req, res) => {
  res.json({
    message: "🏠 Welcome to Ghssen Cars - Find your dream car today",
  });
});

// الحصول على السيارات (للعملاء)
app.get("/api/public/cars", async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// إنشاء طلب جديد
app.post("/api/public/orders", async (req, res) => {
  try {
    const order = new Order({
      carName: req.body.carName,
      carPrice: req.body.carPrice,
      wilaya: req.body.wilaya,
      phone: req.body.phone,
      email: req.body.email,
      clientName: req.body.clientName,
    });
    const newOrder = await order.save();

    console.log("🆕 New Order:", newOrder);
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 🔐 ADMIN ROUTES
app.get("/api/admin/cars", async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ إضافة سيارة جديدة (من Firebase)
app.post("/api/admin/cars", async (req, res) => {
  try {
    const { name, details, price, photo } = req.body;

    if (!photo || !name || !price) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const car = new Car({
      name,
      details,
      price,
      photo, // هنا نضع رابط Firebase مباشرة
    });

    const newCar = await car.save();
    res.status(201).json(newCar);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// حذف سيارة
app.delete("/api/admin/cars/:id", async (req, res) => {
  try {
    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: "Car deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// الحصول على جميع الطلبات
app.get("/api/admin/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// حذف طلب
app.delete("/api/admin/orders/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
