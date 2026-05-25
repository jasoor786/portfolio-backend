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

// Task Management Schema
const Task = mongoose.model('Task', new mongoose.Schema({
  title: String, description: String, status: { type: String, default: 'Pending' }
}));

// --- ROUTES ---
// Existing Portfolio Endpoint
app.get('/api/projects', async (req, res) => {
  try { res.json(await Project.find()); } catch (err) { res.status(500).json({ error: err.message }); }
});

// Mock Login Authentication Endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    res.json({ success: true, token: 'mock-jwt-token', message: 'Logged in successfully!' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials. Use admin / admin123' });
  }
});

// CRUD: Create Task
app.post('/api/tasks', async (req, res) => {
  try {
    const newTask = new Task(req.body);
    await newTask.save();
    res.json(newTask);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// CRUD: Read Tasks
app.get('/api/tasks', async (req, res) => {
  try { res.json(await Task.find()); } catch (err) { res.status(500).json({ error: err.message }); }
});

// CRUD: Update Task Status
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTask);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// CRUD: Delete Task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted successfully" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/', (req, res) => res.send("Backend server is running smoothly!"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));