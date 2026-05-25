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

const Product = mongoose.model('Product', new mongoose.Schema({
  name: String, price: Number, description: String, image: String
}));

const Order = mongoose.model('Order', new mongoose.Schema({
  items: Array, total: Number, status: { type: String, default: 'Processing' }, date: { type: Date, default: Date.now }
}));

// Blog Platform Schemas (Embedded Comments Array for Simplicity)
const CommentSchema = new mongoose.Schema({
  username: String, text: String, date: { type: Date, default: Date.now }
});

const BlogPost = mongoose.model('BlogPost', new mongoose.Schema({
  title: String, author: String, content: String, comments: [CommentSchema], date: { type: Date, default: Date.now }
}));

// --- AUTHENTICATION ROUTE ---
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if ((username === 'admin' && password === 'admin123') || (username === 'user' && password === 'user123')) {
    res.json({ success: true, username: username, message: 'Welcome back!' });
  } else {
    res.status(401).json({ success: false, message: 'Use admin/admin123 or user/user123' });
  }
});

// --- PAST APP API PATHS (PORTFOLIO, TASKS, E-COMM) ---
app.get('/api/projects', async (req, res) => { try { res.json(await Project.find()); } catch(e) { res.status(500).json(e); } });
app.get('/api/tasks', async (req, res) => { try { res.json(await Task.find()); } catch(e) { res.status(500).json(e); } });
app.post('/api/tasks', async (req, res) => { try { const t = new Task(req.body); await t.save(); res.json(t); } catch(e) { res.status(500).json(e); } });
app.put('/api/tasks/:id', async (req, res) => { try { res.json(await Task.findByIdAndUpdate(req.params.id, req.body, {new:true})); } catch(e) { res.status(500).json(e); } });
app.delete('/api/tasks/:id', async (req, res) => { try { await Task.findByIdAndDelete(req.params.id); res.json({m:"Deleted"}); } catch(e) { res.status(500).json(e); } });
app.get('/api/products', async (req, res) => { try { res.json(await Product.find()); } catch(e) { res.status(500).json(e); } });
app.post('/api/products', async (req, res) => { try { const p = new Product(req.body); await p.save(); res.json(p); } catch(e) { res.status(500).json(e); } });
app.post('/api/orders', async (req, res) => { try { const o = new Order(req.body); await o.save(); res.json({success:true,order:o}); } catch(e) { res.status(500).json(e); } });
app.get('/api/orders', async (req, res) => { try { res.json(await Order.find()); } catch(e) { res.status(500).json(e); } });

// --- BLOG ENDPOINTS (RESTful API) ---
// READ all articles
app.get('/api/posts', async (req, res) => {
  try {
    let posts = await BlogPost.find().sort({ date: -1 });
    if (posts.length === 0) {
      // Seed initial dummy blog post if empty
      posts = await BlogPost.insertMany(