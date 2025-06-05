const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String },
  password: { type: String },
  mobile: { type: String },
  isVerified: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);
