import express from 'express';
import jwt from 'jsonwebtoken';
import Invitation from '../models/Invitation.js';
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

// ✅ Create an invitation
router.post('/groups/:groupId/invite', authenticate, async (req, res) => {
  const { username } = req.body;
  const { groupId } = req.params;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const existing = await Invitation.findOne({ group: groupId, invitedUser: user._id });
    if (existing) return res.status(400).json({ error: "User already invited" });

    const invite = new Invitation({
      group: groupId,
      invitedUser: user._id,
      invitedBy: req.userId
    });

    await invite.save();
    res.status(201).json({ message: "Invitation sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/invitations', authenticate, async (req, res) => {
    try {
      const invites = await Invitation.find({ invitedUser: req.userId })
        .populate('group', 'groupName')
        .populate('invitedBy', 'username');
  
      res.json(invites);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

// ✅ Accept invitation
router.post('/invitations/:id/accept', authenticate, async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);
    if (!invitation || invitation.invitedUser.toString() !== req.userId) {
      return res.status(403).json({ error: "Unauthorized or not found" });
    }

    await Group.findByIdAndUpdate(invitation.group, {
      $addToSet: { members: req.userId }
    });

    await User.findByIdAndUpdate(req.userId, {
      $addToSet: { groups: invitation.group }
    });

    await Invitation.findByIdAndDelete(invitation._id);

    res.json({ message: "Joined group successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Decline invitation
router.delete('/invitations/:id/decline', authenticate, async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);
    if (!invitation || invitation.invitedUser.toString() !== req.userId) {
      return res.status(403).json({ error: "Unauthorized or not found" });
    }

    await Invitation.findByIdAndDelete(invitation._id);
    res.json({ message: "Invitation declined" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
