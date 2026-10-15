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
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['teacher', 'student'],
    required: true
  },
  // Teacher-specific fields
  teacherCode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  phone: {
    type: String,
    default: ''
  },
  institution: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: ''
  },
  qualification: {
    type: String,
    default: ''
  },
  // Student-specific fields
  connectedTeacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  rollNumber: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
    default: ''
  },
  interests: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
