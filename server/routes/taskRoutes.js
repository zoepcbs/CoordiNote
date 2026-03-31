import express from 'express';
import jwt from 'jsonwebtoken';
import Task from '../models/Task.js';

const router = express.Router();

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Get all tasks for a group
router.get('/groups/:groupId/tasks', authenticate, async (req, res) => {
  try {
    const tasks = await Task.find({ group: req.params.groupId })
      .populate('assignedTo', 'username')
      .populate('creator', 'username');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a task to the group
router.post('/groups/:groupId/tasks', authenticate, async (req, res) => {
  const { title, dueDate, type, status, assignedTo } = req.body;

  try {
    const task = new Task({
      title,
      dueDate,
      type,
      status, // <- includes status
      assignedTo,
      creator: req.userId,
      group: req.params.groupId,
    });

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// update tasks
router.put('/tasks/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    // Update fields
    task.title = req.body.title || task.title;
    task.type = req.body.type || task.type;
    task.status = req.body.status || task.status;
    task.dueDate = req.body.dueDate || task.dueDate;
    task.assignedTo = req.body.assignedTo || task.assignedTo;

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/tasks/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
