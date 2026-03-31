import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import User from './models/User.js';
import authRoutes from './routes/auth.js';
import groupRoutes from './routes/groupRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import inviteRoute from './routes/inviteRoute.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads folder exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Created uploads directory');
}

app.use(cors());
app.use(express.json());
app.use('/api', groupRoutes);
app.use('/api', taskRoutes);
app.use('/api', fileRoutes);
app.use('/api', inviteRoute);
app.use('/uploads', express.static(uploadDir)); // serve public files

// DB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/coordiNoteDB')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Default route (optional)
app.get('/', (req, res) => {
  res.send('CoordiNote server is running!');
});

// Test route (optional)
app.get('/test-db', async (req, res) => {
  try {
    const testUser = new User({
      username: 'testuser123',
      email: 'test@example.com',
      password: 'password123'
    });

    await testUser.save();
    res.send('✅ Test user saved to the database!');
  } catch (err) {
    console.error('❌ Error saving test user:', err);
    res.status(500).send('Database connection or model error.');
  }
});

// Routes
app.use('/api', authRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
