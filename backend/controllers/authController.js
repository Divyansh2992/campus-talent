const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @desc  Register user
const registerUser = async (req, res) => {
  const { name, email, password, hostel, year } = req.body;

  // Enforce SVNIT email format: [roll][dept]@svnit.ac.in or subdomains like @coed.svnit.ac.in
  const svnitRegex = /^[a-z0-9.]+@([a-z0-9-]+\.)*svnit\.ac\.in$/i;
  if (!svnitRegex.test(email)) {
    return res.status(400).json({ message: 'Only @svnit.ac.in or its departmental emails are allowed' });
  }

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already registered' });
  const user = await User.create({ name, email, password, hostel, year });
  res.status(201).json({
    _id: user._id, name: user.name, email: user.email,
    hostel: user.hostel, year: user.year, profilePic: user.profilePic,
    skills: user.skills, token: generateToken(user._id),
  });
};

// @desc  Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id, name: user.name, email: user.email,
      hostel: user.hostel, year: user.year, profilePic: user.profilePic,
      skills: user.skills, token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc  Get current user
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
};

module.exports = { registerUser, loginUser, getMe };
