const express = require('express');
const router = express.Router();
const { enrollInCourse, getStudentEnrollments, updateTopicProgress } = require('../controllers/enrollmentController');
const { protect, isStudent } = require('../middleware/authMiddleware');

router.post('/enroll', protect, isStudent, enrollInCourse);
router.get('/my-courses', protect, isStudent, getStudentEnrollments);
router.post('/update-progress', protect, isStudent, updateTopicProgress);

module.exports = router;
