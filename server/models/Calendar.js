import mongoose from 'mongoose';

// Calendar schema tracks all of the tasks & meetings
// links a calendar to a group & stores a list of Task references
const calendarSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', unique: true },
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
});

export default mongoose.model('Calendar', calendarSchema);
