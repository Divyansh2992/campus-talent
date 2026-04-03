const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// @desc Get public profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -email');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc Update own profile
router.put('/profile', protect, upload.single('profilePic'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, bio, hostel, year, skills, razorpayAccountId } = req.body;
    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (hostel) user.hostel = hostel;
    if (year) user.year = year;
    if (razorpayAccountId) user.razorpayAccountId = razorpayAccountId;
    if (skills) user.skills = skills.split(',').map(s => s.trim());
    if (req.file) user.profilePic = `/uploads/${req.file.filename}`;
    const updated = await user.save();
    res.json({ _id: updated._id, name: updated.name, bio: updated.bio, hostel: updated.hostel, year: updated.year, skills: updated.skills, profilePic: updated.profilePic });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
