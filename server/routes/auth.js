import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// authentication middleware
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

// Register
router.post('/register', async (req, res) => {
  const { firstName, lastName, username, email, password } = req.body;

  try {
    // check if required fields are filled in
    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({error: "Please fill out all fields"});
    }

    // check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: "Username already exists. Pick a different one." });

    // create new user (pre-save hook will hash password)
    const newUser = new User({ firstName, lastName, username, email, password });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    console.error("Registration error: ", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // find user by username
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "Username not recognized" });

    // compare entered pass with hashed pass in DB
    const valid = await user.comparePassword(password);
    if (!valid) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    console.error("Login error: ", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update profile
router.put('/me', authenticate, async (req, res) => {
  const { firstName, lastName, bio, profilePhoto } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { firstName, lastName, bio, profilePhoto },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: "Profile update failed" });
  }
});

export default router;
