import express from 'express';
import jwt from 'jsonwebtoken';
import Group from '../models/Group.js';
import User from '../models/User.js';

const router = express.Router();

// Auth middleware
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

// ✅ Create a group
router.post('/groups', authenticate, async (req, res) => {
  const { groupName } = req.body;

  try {
    const group = new Group({
      groupName,
      creator: req.userId,
      members: [req.userId]
    });

    await group.save();
    await User.findByIdAndUpdate(req.userId, { $addToSet: { groups: group._id } });

    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all groups current user is in
router.get('/my-groups', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate({
        path: 'groups',
        populate: [
          { path: 'creator', select: 'username' },
          { path: 'members', select: 'username' }
        ]
      });
    res.json(user.groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Leave a group
router.post('/groups/:groupId/leave', authenticate, async (req, res) => {
  const { groupId } = req.params;

  try {
    await Group.findByIdAndUpdate(groupId, {
      $pull: { members: req.userId }
    });

    await User.findByIdAndUpdate(req.userId, {
      $pull: { groups: groupId }
    });

    res.json({ message: "Left the group" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/groups/:groupId/members', authenticate, async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await Group.findById(groupId).populate('members', 'username email'); // Adjust fields as necessary
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.json(group.members); // Return the list of members
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
