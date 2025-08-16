const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  whatsapp: String,
  gmail: String,
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, required: true }
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  age: {
    type: Number,
    required: true,
    min: 18,
    max: 65
  },
  sex: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other']
  },
  // Photo file data
  photo: {
    data: Buffer,
    contentType: String,
    filename: String
  },
  // Government ID file data
  governmentId: {
    data: Buffer,
    contentType: String,
    filename: String
  },
  // Keep URLs for backward compatibility and easy access
  photoUrl: String,
  governmentIdUrl: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  submittedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: Date,
  lastDonation: Date,
  totalDonations: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Donor', donorSchema);