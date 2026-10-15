const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  topicNumber: { type: Number, required: true },
  title: { type: String, required: true, trim: true },
  explanation: { type: String, required: true },
  codeExample: { type: String, default: '' },
  diagram: { type: String, default: '' },
  practicalNotes: { type: String, default: '' }
});

const moduleSchema = new mongoose.Schema({
  moduleNumber: { type: Number, required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  topics: [topicSchema]
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  modules: [moduleSchema],
  isDefault: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
