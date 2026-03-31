import mongoose from 'mongoose';

// Group schema represents a study or project group
// each group has a name, a creator (references User), a member list (references User), tasks
//   (references Task), a calendar (references Calendar), & uploaded files (references File)

const groupSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  calendar: { type: mongoose.Schema.Types.ObjectId, ref: 'Calendar' },
  files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }]
});

export default mongoose.model('Group', groupSchema);
