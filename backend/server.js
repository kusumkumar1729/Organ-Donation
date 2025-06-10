const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const User = require('./models/User');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:9000',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.path}, Origin: ${req.headers.origin}`);
  next();
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Access denied: No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Email Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

transporter.verify((error) => {
  if (error) console.error('Email transporter verification failed:', error);
  else console.log('Email transporter is ready');
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Helper Functions
const validateInput = (fields, res) => {
  for (const [key, value] of Object.entries(fields)) {
    if (!value || typeof value !== 'string') {
      return res.status(400).json({ error: `${key} is required and must be a string` });
    }
  }
  return null;
};

const generateToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
const setTokenCookie = (res, token) => res.cookie('token', token, { 
  httpOnly: true, 
  secure: process.env.NODE_ENV === 'production', 
  sameSite: 'lax' 
});

// API Routes
app.post('/api/auth/register', async (req, res) => {
  const { email, password, role = 'user' } = req.body;
  console.log('Register attempt:', { email, password, role }); // Debug log
  try {
    const validationError = validateInput({ email, password }, res);
    if (validationError) return validationError;

    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser && !existingUser.otp) return res.status(400).json({ error: 'User already exists' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    if (existingUser && existingUser.otp) {
      console.log('Updating existing user with new password:', password); // Debug log
      existingUser.password = password; // Store as plain text
      existingUser.otp = otp;
      existingUser.otpExpires = otpExpires;
      existingUser.role = role;
      await existingUser.save();
      console.log('Updated user password:', existingUser.password); // Debug log
    } else {
      console.log('Creating new user with password:', password); // Debug log
      const user = new User({ email: normalizedEmail, password, otp, otpExpires, role });
      await user.save();
      console.log('New user password:', user.password); // Debug log
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: normalizedEmail,
      subject: `Your OTP for ${role === 'admin' ? 'Admin' : 'User'} Registration`,
      text: `Your OTP is ${otp}. Valid for 10 minutes.`,
    });

    res.status(200).json({ message: 'OTP sent to your email', email: normalizedEmail });
  } catch (error) {
    console.error('Error in register route:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/admin/register', (req, res) => {
  req.body.role = 'admin';
  app._router.handle({ ...req, url: '/api/auth/register' }, res);
});

app.post('/api/auth/verify-register-otp', async (req, res) => {
  const { email, otp } = req.body;
  console.log('OTP verification attempt:', { email, otp }); // Debug log
  try {
    const validationError = validateInput({ email, otp }, res);
    if (validationError) return validationError;

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.otp || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    user.otp = null;
    user.otpExpires = null;
    await user.save();
    console.log('OTP verified for user:', normalizedEmail); // Debug log

    const token = generateToken(user);
    setTokenCookie(res, token);
    const redirectUrl = user.role === 'admin' ? 'http://localhost:9000/login-admin.html' : 'http://localhost:9000/login-user.html';
    res.status(200).json({ message: 'Registration successful, please login', role: user.role, redirectUrl });
  } catch (error) {
    console.error('Error in verify-register-otp route:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// User Login Route
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('User login attempt:', { email, password }); // Debug log
  try {
    const validationError = validateInput({ email, password }, res);
    if (validationError) return validationError;

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ error: 'Account not found' });

    if (user.otp) return res.status(400).json({ error: 'Account not verified. Please complete OTP verification.' });

    // Compare passwords directly (plain text)
    const isMatch = password === user.password;
    console.log('Password comparison:', { entered: password, stored: user.password, isMatch });
    if (!isMatch) return res.status(400).json({ error: 'Incorrect password' });

    const token = generateToken(user);
    setTokenCookie(res, token);
    res.status(200).json({ message: 'Login successful', role: user.role, token });
  } catch (error) {
    console.error('Error in user login route:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin Login Route
app.post('/api/auth/admin/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Admin login attempt:', { email, password }); // Debug log
  try {
    const validationError = validateInput({ email, password }, res);
    if (validationError) return validationError;

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ error: 'Admin not found' });

    if (user.otp) return res.status(400).json({ error: 'Admin not verified. Please complete OTP verification.' });

    if (user.role !== 'admin') return res.status(403).json({ error: 'Not an admin' });

    // Compare passwords directly (plain text)
    const isMatch = password === user.password;
    console.log('Password comparison:', { entered: password, stored: user.password, isMatch });
    if (!isMatch) return res.status(400).json({ error: 'Incorrect password' });

    const token = generateToken(user);
    setTokenCookie(res, token);
    res.status(200).json({ message: 'Admin login successful', token });
  } catch (error) {
    console.error('Error in admin login route:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.status(200).json({ message: 'Token is valid', userId: req.user.id, role: req.user.role });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
  res.status(200).json({ message: 'Logged out successfully' });
});

// Serve Static Files
app.use(express.static(path.join(__dirname)));
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'homepage.html')));

// Catch-all Route
app.use((req, res) => {
  console.log(`Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Registered routes:');
  app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
      console.log(`${Object.keys(r.route.methods)} ${r.route.path}`);
    }
  });
});