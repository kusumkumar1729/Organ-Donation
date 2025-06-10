// backend/models/PendingRegistration.js
const mongoose = require('mongoose');

const pendingRegistrationSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: '10m' } }, // Auto-expire after 10 minutes
});

module.exports = mongoose.model('PendingRegistration', pendingRegistrationSchema);