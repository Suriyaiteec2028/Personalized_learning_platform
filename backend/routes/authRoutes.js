const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getProfile, updateProfile, connectTeacher } = require('../controllers/authController');
const { protect, isStudent } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/connect-teacher', protect, isStudent, connectTeacher);

module.exports = router;
