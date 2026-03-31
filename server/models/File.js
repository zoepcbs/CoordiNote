import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  uploadDate: { type: Date, default: Date.now }
});

export default mongoose.model('File', fileSchema);
