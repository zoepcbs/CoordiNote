import express from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import File from '../models/File.js';

const router = express.Router();

// Inline auth middleware
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

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
console.log('Upload directory path:', uploadDir);
if (!fs.existsSync(uploadDir)) {
  console.log('Creating uploads directory as it does not exist');
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer file upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Upload a file to a group
router.post('/groups/:groupId/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    console.log('File upload request received:', req.file);
    const file = new File({
      filename: req.file.filename,
      originalName: req.file.originalname,
      uploader: req.userId,
      group: req.params.groupId,
    });
    await file.save();
    console.log('File saved to database:', file);
    res.status(201).json(file);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Get all files for a group
router.get('/groups/:groupId/files', authenticate, async (req, res) => {
  try {
    console.log('Fetching files for group:', req.params.groupId);
    const files = await File.find({ group: req.params.groupId }).populate('uploader', 'username');
    console.log(`Found ${files.length} files`);
    res.json(files);
  } catch (err) {
    console.error('Error fetching files:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a file
router.delete('/groups/:groupId/files/:fileId', authenticate, async (req, res) => {
  console.log('=== DELETE FILE OPERATION STARTED ===');
  console.log('Delete request params:', { groupId: req.params.groupId, fileId: req.params.fileId });
  
  try {
    // Step 1: Find the file in the database
    console.log('Step 1: Searching for file in database with ID:', req.params.fileId);
    const file = await File.findById(req.params.fileId);
    
    if (!file) {
      console.error('File not found in database');
      return res.status(404).json({ error: 'File not found in database' });
    }
    
    console.log('File found in database:', file);
    
    // Step 2: Check if the file exists in the filesystem
    const filePath = path.join(uploadDir, file.filename);
    console.log('Step 2: Checking if file exists at path:', filePath);
    
    const fileExists = fs.existsSync(filePath);
    console.log('File exists in filesystem:', fileExists);
    
    // Step 3: Delete the file from filesystem if it exists
    if (fileExists) {
      console.log('Step 3: Attempting to delete file from filesystem');
      try {
        fs.unlinkSync(filePath);
        console.log('File successfully deleted from filesystem');
      } catch (fsError) {
        console.error('Error deleting file from filesystem:', fsError);
        // Here we're not returning, we'll still try to delete from database
      }
    } else {
      console.log('File not found in filesystem, skipping file deletion');
    }
    
    // Step 4: Remove the file record from the database
    console.log('Step 4: Deleting file record from database');
    try {
      await File.findByIdAndDelete(req.params.fileId);
      console.log('File record successfully deleted from database');
    } catch (dbError) {
      console.error('Error deleting file record from database:', dbError);
      return res.status(500).json({ error: 'Failed to delete file record from database' });
    }
    
    console.log('=== DELETE FILE OPERATION COMPLETED SUCCESSFULLY ===');
    res.json({ message: 'File deleted successfully' });
    
  } catch (err) {
    console.error('=== DELETE FILE OPERATION FAILED ===');
    console.error('Unhandled error during delete operation:', err);
    res.status(500).json({ error: 'Failed to delete file', details: err.message });
  }
});

// Download a file
router.get('/groups/:groupId/files/download/:filename', authenticate, (req, res) => {
  // Log the requested filename and path for debugging
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, filename);
  
  console.log('Download request for:', filename);
  console.log('Looking for file at path:', filePath);
  console.log('File exists:', fs.existsSync(filePath));
  
  // Check if file exists first
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    return res.status(404).send('File not found');
  }
  
  // Send the file
  res.download(filePath, filename, (err) => {
    if (err) {
      console.error('Download error:', err);
      // Only send error response if headers haven't been sent yet
      if (!res.headersSent) {
        res.status(500).send('Error downloading file');
      }
    }
  });
});

router.get('/public-download/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }
  
  res.download(filePath, req.params.filename, (err) => {
    if (err) {
      console.error('Download error:', err);
      if (!res.headersSent) {
        res.status(500).send('Error downloading file');
      }
    }
  });
});

export default router;
