const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  moduleTitle: {
    type: String,
    required: true,
    trim: true
  },
  topicTitle: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['mcq', 'programming'],
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  options: [{
    type: String
  }],
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed, // index for MCQ (Number), or expected solution code/logic string for programming
    required: true
  },
  sampleCode: {
    type: String,
    default: ''
  },
  testCases: [{
    input: { type: String, default: '' },
    expectedOutput: { type: String, default: '' }
  }],
  expectedKeywords: [{
    type: String
  }],
  points: {
    type: Number,
    required: true,
    default: function() {
      return this.type === 'mcq' ? 1 : 5;
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Question', questionSchema);
