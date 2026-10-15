const express = require('express');
const router = express.Router();
const { getStudentRecommendations, getKnowledgeGapAnalysis } = require('../controllers/recommendationController');
const { protect, isStudent } = require('../middleware/authMiddleware');

router.get('/', protect, isStudent, getStudentRecommendations);
router.get('/knowledge-gap', protect, isStudent, getKnowledgeGapAnalysis);

module.exports = router;
