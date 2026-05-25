const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Enable wide-open CORS manually
app.use(cors());
app.use(express.json());

// Connect to MongoDB Database
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://admin:admin123@cluster0.xxxx.mongodb.net/test?retryWrites=true&w=majority";
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch(err => console.error("Database connection error:", err));

// --- SCHEMAS & MODELS ---
const Project = mongoose.models.Project || mongoose.model('Project', new mongoose.Schema({
  title: String, description: String, techStack: [String], liveLink: String, githubLink: String
}));

const Task = mongoose.models.Task || mongoose.model('Task', new mongoose.Schema({
  title: String, description: String, status: { type: String, default: 'Pending' }
}));

const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
  name: String, price: Number, description: String, image: String
}));

const Order = mongoose.models.Order || mongoose.model('Order', new mongoose.Schema({
  items: Array, total: Number, status: { type: String, default: 'Processing' }, date: { type: Date, default: Date.now }
}));

const CommentSchema = new mongoose.Schema({
  username: String, text: String, date: { type: Date, default: Date.now }
});

const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', new mongoose.Schema({
  title: String, author: String, content: String, comments: [CommentSchema], date: { type: Date, default: Date.now }
}));

// --- ENDPOINTS & HANDLERS ---

// Base test path
app.get('/', (req, res) => res.send("Backend server is running smoothly!"));

// Auth Endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if ((username === 'admin' && password === 'admin123') || (username === 'user' && password === 'user123')) {
    res.json({ success: true, username: username, role: username === 'admin' ? 'Admin' : 'User', message: 'Welcome!' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }
});

// Portfolio Paths
app.get('/api/projects', async (req, res) => {
  try { res.json(await Project.find()); } catch(e) { res.status(500).json({ error: e.message }); }
});

// Task Paths
app.get('/api/tasks', async (req, res) => {
  try { res.json(await Task.find()); } catch(e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/tasks', async (req, res) => {
  try { const t = new Task(req.body); await t.save(); res.json(t); } catch(e) { res.status(500).json({ error: e.message }); }
});
app.put('/api/tasks/:id', async (req, res) => {
  try { res.json(await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })); } catch(e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/tasks/:id', async (req, res) => {
  try { await Task.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); } catch(e) { res.status(500).json({ error: e.message }); }
});

// E-Commerce Paths
app.get('/api/products', async (req, res) => {
  try {
    let products = await Product.find();
    if (products.length === 0) {
      products = await Product.insertMany([
        { name: "Wireless Headphones", price: 99, description: "Noise-canceling over-ear headphones.", image: "🎧" },
        { name: "Smart Watch", price: 199, description: "Tracks health metrics.", image: "⌚" },
        { name: "Mechanical Keyboard", price: 89, description: "RGB backlit mechanical switches.", image: "⌨️" }
      ]);
    }
    res.json(products);
  } catch(e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/products', async (req, res) => {
  try { const p = new Product(req.body); await p.save(); res.json(p); } catch(e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/orders', async (req, res) => {
  try { const o = new Order(req.body); await o.save(); res.json({ success: true, order: o }); } catch(e) { res.status(500).json({ error: e.message }); }
});
app.get('/api/orders', async (req, res) => {
  try { res.json(await Order.find().sort({ date: -1 })); } catch(e) { res.status(500).json({ error: e.message }); }
});

// Blog Paths
app.get('/api/posts', async (req, res) => {
  try {
    let posts = await BlogPost.find().sort({ date: -1 });
    if (posts.length === 0) {
      posts = await BlogPost.insertMany([
        { title: "Welcome to Full-Stack Development", author: "admin", content: "This is our live blog app tracking data dynamically across server endpoints.", comments: [{ username: "user", text: "Looks great!" }] }
      ]);
    }
    res.json(posts);
  } catch(e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/posts', async (req, res) => {
  try { const p = new BlogPost(req.body); await p.save(); res.json(p); } catch(e) { res.status(500).json({ error: e.message }); }
});
app.put('/api/posts/:id', async (req, res) => {
  try { res.json(await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true })); } catch(e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/posts/:id', async (req, res) => {
  try { await BlogPost.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); } catch(e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    post.comments.push(req.body);
    await post.save();
    res.json(post);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));