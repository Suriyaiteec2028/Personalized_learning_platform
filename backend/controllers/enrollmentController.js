const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// Enroll in course
exports.enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user._id;

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    let enrollment = await Enrollment.findOne({ studentId, courseId });
    if (enrollment) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }

    enrollment = await Enrollment.create({
      studentId,
      courseId,
      completedTopics: [],
      progressPercentage: 0,
      lastStudiedTopic: course.modules[0]?.topics[0]?.title || ''
    });

    const populated = await Enrollment.findById(enrollment._id).populate('courseId');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error enrolling in course: ' + error.message });
  }
};

// Get student's enrolled courses
exports.getStudentEnrollments = async (req, res) => {
  try {
    const studentId = req.user._id;
    const enrollments = await Enrollment.find({ studentId }).populate('courseId');
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching enrolled courses: ' + error.message });
  }
};

// Mark topic completed and update progress
exports.updateTopicProgress = async (req, res) => {
  try {
    const { courseId, topicTitle, completed } = req.body;
    const studentId = req.user._id;

    let enrollment = await Enrollment.findOne({ studentId, courseId });
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment record not found for this course' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Count total topics in course
    let totalTopicsCount = 0;
    course.modules.forEach(mod => {
      totalTopicsCount += mod.topics.length;
    });

    let completedSet = new Set(enrollment.completedTopics);

    if (completed) {
      completedSet.add(topicTitle);
    } else {
      completedSet.delete(topicTitle);
    }

    enrollment.completedTopics = Array.from(completedSet);
    enrollment.lastStudiedTopic = topicTitle;
    enrollment.progressPercentage = totalTopicsCount > 0 
      ? Math.round((enrollment.completedTopics.length / totalTopicsCount) * 100)
      : 0;

    await enrollment.save();
    const updated = await Enrollment.findById(enrollment._id).populate('courseId');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating learning progress: ' + error.message });
  }
};
