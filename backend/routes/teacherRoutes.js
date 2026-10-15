const express = require('express');
const router = express.Router();
const { getConnectedStudents, getStudentDetailedActivity, removeStudentFromTeacher } = require('../controllers/teacherController');
const { protect, isTeacher } = require('../middleware/authMiddleware');

router.get('/students', protect, isTeacher, getConnectedStudents);
router.get('/student-activity/:studentId', protect, isTeacher, getStudentDetailedActivity);
router.delete('/remove-student/:studentId', protect, isTeacher, removeStudentFromTeacher);

module.exports = router;
