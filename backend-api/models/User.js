const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: false
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['passenger', 'staff', 'admin'],
    default: 'passenger'
  },
  profilePicture: {
    type: String,
    required: false
  },
  address: {
    type: String,
    required: false
  },
  city: {
    type: String,
    required: false
  },
  country: {
    type: String,
    required: false
  },
  otpVerified: {
    type: Boolean,
    default: false
  },
  resetToken: {
    type: String,
    required: false
  },
  resetTokenExpire: {
    type: Date,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
