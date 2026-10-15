const mongoose = require('mongoose');

const topicPerfSchema = new mongoose.Schema({
  topicTitle: { type: String, required: true },
  skillPercentage: { type: Number, required: true },
  mcqCorrect: { type: Number, default: 0 },
  mcqTotal: { type: Number, default: 0 },
  progCorrect: { type: Number, default: 0 },
  progTotal: { type: Number, default: 0 },
  reason: { type: String, default: '' }
});

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  studentAnswer: { type: mongoose.Schema.Types.Mixed },
  isCorrect: { type: Boolean, default: false },
  marksEarned: { type: Number, default: 0 },
  feedback: { type: String, default: '' }
});

const testAttemptSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  testTitle: {
    type: String,
    required: true
  },
  isReattempt: {
    type: Boolean,
    default: false
  },
  weakTopic: {
    type: String,
    default: ''
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  mcqMarks: {
    type: Number,
    default: 0
  },
  programmingMarks: {
    type: Number,
    default: 0
  },
  totalMarks: {
    type: Number,
    required: true
  },
  maxPossibleMarks: {
    type: Number,
    required: true
  },
  scorePercentage: {
    type: Number,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  tabSwitchCount: {
    type: Number,
    default: 0
  },
  malpracticeCount: {
    type: Number,
    default: 0
  },
  isTerminatedForMalpractice: {
    type: Boolean,
    default: false
  },
  malpracticeReason: {
    type: String,
    default: ''
  },
  answers: [answerSchema],
  topicPerformance: [topicPerfSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('TestAttempt', testAttemptSchema);
