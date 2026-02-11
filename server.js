require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const cors = require("cors");
app.use(cors());

const app = express();
app.use(express.json());

// CONFIG
const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI;

// Show the V8 engine version used by your Node.js installation
  console.log(`V8 version: ${process.versions.v8}`);

// CONNECT MONGODB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

/* ---------------- SIGNUP API ---------------- */
app.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email & password required' });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: 'User registered successfully',
      userId: user._id
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/* ---------------- LOGIN API ---------------- */
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/* ---------------- PROTECTED API ---------------- */
app.get('/profile', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user.userId).select('-password');
  res.json(user);
});

/* ---------------- JWT MIDDLEWARE ---------------- */
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token)
    return res.status(401).json({ message: 'Token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ message: 'Invalid token' });

    req.user = user;
    next();
  });
}

// START SERVER
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
