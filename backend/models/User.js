const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'staff'],
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  whatsapp: String,
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: false,
    default: undefined
  },
  age: Number,
  sex: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String
  },
  salary: Number,
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);