import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// Cloudinary config (للاستخدام المستقبلي إذا احتجت)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Mongoose Schemas
const CarSchema = new mongoose.Schema({
  name: String,
  details: String,
  price: Number,
  photo: String, // Cloudinary URL
  createdAt: { type: Date, default: Date.now },
});
const Car = mongoose.model("Car", CarSchema);

const OrderSchema = new mongoose.Schema({
  carName: String,
  carPrice: Number,
  wilaya: String,
  phone: String,
  email: String,
  clientName: String,
  createdAt: { type: Date, default: Date.now },
});
const Order = mongoose.model("Order", OrderSchema);

// Routes
app.get("/", (req, res) => res.json({ message: "Ghassen Cars API Running" }));

// GET cars
app.get("/api/public/cars", async (req, res) => {
  const cars = await Car.find().sort({ createdAt: -1 });
  res.json(cars);
});

// POST car (يقبل JSON مع Cloudinary URL)
app.post("/api/admin/cars", async (req, res) => {
  try {
    const { name, details, price, photo } = req.body;

    if (!name || !price || !photo) {
      return res.status(400).json({ message: "Name, price and photo are required" });
    }

    const newCar = new Car({ name, details, price, photo });
    await newCar.save();
    res.status(201).json(newCar);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE car
app.delete("/api/admin/cars/:id", async (req, res) => {
  await Car.findByIdAndDelete(req.params.id);
  res.json({ message: "Car deleted" });
});

// POST order
app.post("/api/public/orders", async (req, res) => {
  const order = new Order(req.body);
  await order.save();
  res.status(201).json(order);
});

// GET orders
app.get("/api/admin/orders", async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

// DELETE order
app.delete("/api/admin/orders/:id", async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: "Order deleted" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));