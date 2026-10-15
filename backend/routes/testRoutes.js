const express = require('express');
const router = express.Router();
const { getCourseTestQuestions, getReattemptTestQuestions, submitTest, getStudentTestHistory, runCode } = require('../controllers/testController');
const { protect, isStudent } = require('../middleware/authMiddleware');

router.get('/course/:courseId', protect, isStudent, getCourseTestQuestions);
router.get('/reattempt/:courseId', protect, isStudent, getReattemptTestQuestions);
router.post('/run-code', protect, isStudent, runCode);
router.post('/submit', protect, isStudent, submitTest);
router.get('/history', protect, isStudent, getStudentTestHistory);

module.exports = router;
