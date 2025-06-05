const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTP } = require('../utils/sendEmail');
require('dotenv').config();

exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

  let user = await User.findOne({ email });
  if (!user) {
    user = new User({ email });
  }
  user.otp = otp;
  await user.save();

  await sendOTP(email, otp);

  res.json({ message: 'OTP sent successfully' });
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  user.isVerified = true;
  user.otp = null; // clear OTP
  await user.save();

  res.json({ message: 'Email verified successfully' });
};

exports.register = async (req, res) => {
  const { email, password, confirmPassword, mobile } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'User not found. Verify email first.' });
  if (!user.isVerified) return res.status(400).json({ message: 'Email not verified' });
  if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });

  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  user.mobile = mobile;
  await user.save();

  res.json({ message: 'User registered successfully' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'User not found' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

  res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      mobile: user.mobile
    }
  });
};
