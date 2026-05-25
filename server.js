const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || "your_mongodb_fallback_link_here";
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// --- SCHEMAS ---
const Project = mongoose.model('Project', new mongoose.Schema({
  title: String, description: String, techStack: [String], liveLink: String, githubLink: String
}));

const Task = mongoose.model('Task', new mongoose.Schema({
  title: String, description: String, status: { type: String, default: 'Pending' }
}));

// E-Commerce Schemas
const Product = mongoose.model('Product', new mongoose.Schema({
  name: String, price: Number, description: String, image: String
}));

const Order = mongoose.model('Order', new mongoose.Schema({
  items: Array, total: Number, status: { type: String, default: 'Processing' }, date: { type: Date, default: Date.now }
}));

// --- ROUTES ---
app.get('/api/projects', async (req, res) => {
  try { res.json(await Project.find()); } catch (err) { res.status(500).json({ error: err.message }); }
});

// Role-Based Authentication
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    res.json({ success: true, role: 'Admin', message: 'Logged in as Admin!' });
  } else if (username === 'user' && password === 'user123') {
    res.json({ success: true, role: 'User', message: 'Logged in as Customer!' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials. Use admin/admin123 or user/user123' });
  }
});

// Task Routes
app.post('/api/tasks', async (req, res) => {
  try { const t = new Task(req.body); await t.save(); res.json(t); } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/tasks', async (req, res) => {
  try { res.json(await Task.find()); } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/tasks/:id', async (req, res) => {
  try { res.json(await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })); } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/tasks/:id', async (req, res) => {
  try { await Task.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- E-COMMERCE ENDPOINTS ---
// Get all products
app.get('/api/products', async (req, res) => {
  try {
    let products = await Product.find();
    if (products.length === 0) {
      // Seed initial dummy sample products if catalog is completely empty
      products = await Product.insertMany([
        { name: "Wireless Headphones", price: 99, description: "Noise-canceling over-ear headphones.", image: "🎧" },
        { name: "Smart Watch", price: 199, description: "Tracks health metrics and notifications.", image: "⌚" },
        { name: "Mechanical Keyboard", price: 89, description: "RGB backlit mechanical switches.", image: "⌨️" }
      ]);
    }
    res.json(products);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: Add new product
app.post('/api/products', async (req, res) => {
  try { const p = new Product(req.body); await p.save(); res.json(p); } catch (err) { res.status(500).json({ error: err.message }); }
});

// Checkout / Place Order
app.post('/api/orders', async (req, res) => {
  try { const o = new Order(req.body); await o.save(); res.json({ success: true, order: o }); } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin: Get all orders tracking list
app.get('/api/orders', async (req, res) => {
  try { res.json(await Order.find().sort({ date: -1 })); } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/', (req, res) => res.send("Backend server is running smoothly!"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));