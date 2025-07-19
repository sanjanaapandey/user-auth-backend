const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  emailOrMobile: {
    type: String,
    required: true,
    unique: true,
  },
  password: String,
  otp: String,
  otpExpires: Date,
});

module.exports = mongoose.model('User', userSchema);
