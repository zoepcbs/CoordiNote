import mongoose from 'mongoose';

// Task schema represents either a task or meeting
// each task has a title, type, due date, status, user assigned to, & creator
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['task', 'meeting'], required: true },
  dueDate: { type: Date },
  status: { type: String, enum: ['pending', 'in progress', 'completed'], default: 'pending' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }
});

export default mongoose.model('Task', taskSchema);
