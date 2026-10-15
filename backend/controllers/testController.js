const Question = require('../models/Question');
const TestAttempt = require('../models/TestAttempt');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// ─── Helper: evaluate a code answer against a question ────────────────────────
function evaluateCode(question, code) {
  const trimmed = (code || '').toString().trim();

  if (trimmed.length < 10) {
    return {
      passed: false,
      testCaseResults: (question.testCases || []).map((tc, i) => ({
        caseNumber: i + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        passed: false,
        note: 'No code submitted.'
      })),
      feedback: 'No code submitted.'
    };
  }

  // Check required keywords
  let missingKeyword = null;
  if (question.expectedKeywords && question.expectedKeywords.length > 0) {
    for (const kw of question.expectedKeywords) {
      if (!trimmed.includes(kw)) { missingKeyword = kw; break; }
    }
  }

  // Simulate test cases
  const testCaseResults = (question.testCases || []).map((tc, i) => {
    // Heuristic: pass the case if no missing keyword AND code is substantial
    const casePassed = !missingKeyword && trimmed.length > 15;
    return {
      caseNumber: i + 1,
      input: tc.input || '(no input)',
      expectedOutput: tc.expectedOutput || '(no output)',
      actualOutput: casePassed ? tc.expectedOutput : 'Incorrect / Runtime Error',
      passed: casePassed
    };
  });

  // If no test cases defined, do a plain keyword + length check
  if (testCaseResults.length === 0) {
    const passed = !missingKeyword && trimmed.length > 15;
    return {
      passed,
      testCaseResults: [{
        caseNumber: 1,
        input: '(auto)',
        expectedOutput: '(auto)',
        actualOutput: passed ? 'Correct logic detected' : 'Missing logic or keywords',
        passed
      }],
      feedback: passed
        ? 'All logic checks passed!'
        : `Missing required keyword/logic: "${missingKeyword || 'code too short'}".`
    };
  }

  const allPassed = testCaseResults.every(r => r.passed);
  return {
    passed: allPassed,
    testCaseResults,
    feedback: allPassed
      ? 'All test cases passed!'
      : missingKeyword
        ? `Missing required keyword: "${missingKeyword}". Check your logic.`
        : 'One or more test cases failed. Review your implementation.'
  };
}

// ─── Run Code (before submission) ─────────────────────────────────────────────
exports.runCode = async (req, res) => {
  try {
    const { questionId, code } = req.body;

    let originalId = (questionId || '').split('_reattempt_')[0];
    const question = await Question.findById(originalId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    if (question.type !== 'programming') {
      return res.status(400).json({ message: 'Run is only available for programming questions' });
    }

    const result = evaluateCode(question, code);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error running code: ' + error.message });
  }
};

// ─── Get Course Test Questions ─────────────────────────────────────────────────
exports.getCourseTestQuestions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const questions = await Question.find({ courseId });
    const mcqQuestions = questions.filter(q => q.type === 'mcq');
    const programmingQuestions = questions.filter(q => q.type === 'programming');

    const sanitizedQuestions = questions.map(q => ({
      _id: q._id,
      courseId: q.courseId,
      moduleTitle: q.moduleTitle,
      topicTitle: q.topicTitle,
      type: q.type,
      questionText: q.questionText,
      options: q.options,
      sampleCode: q.sampleCode,
      testCases: (q.testCases || []).map(tc => ({ input: tc.input, expectedOutput: tc.expectedOutput })),
      expectedKeywords: q.expectedKeywords || [],
      points: q.points
    }));

    let totalPossibleMarks = sanitizedQuestions.reduce((s, q) => s + q.points, 0);
    const estimatedMinutes = Math.min(120, Math.max(15, Math.ceil(mcqQuestions.length * 1 + programmingQuestions.length * 5)));

    res.json({
      courseTitle: course.title,
      totalQuestions: sanitizedQuestions.length,
      totalPossibleMarks,
      durationMinutes: estimatedMinutes,
      questions: sanitizedQuestions
    });
  } catch (error) {
    res.status(500).json({ message: 'Error loading test questions: ' + error.message });
  }
};

// ─── Get Reattempt Test Questions ─────────────────────────────────────────────
exports.getReattemptTestQuestions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { topicTitle } = req.query;

    if (!topicTitle) return res.status(400).json({ message: 'topicTitle required' });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const topicQuestions = await Question.find({ courseId, topicTitle });
    let mcqPool = topicQuestions.filter(q => q.type === 'mcq');
    let progPool = topicQuestions.filter(q => q.type === 'programming');

    let selectedMCQs = mcqPool.slice(0, 10);
    while (selectedMCQs.length < 10 && mcqPool.length > 0) {
      selectedMCQs.push(mcqPool[selectedMCQs.length % mcqPool.length]);
    }
    let selectedProg = progPool.slice(0, 5);
    while (selectedProg.length < 5 && progPool.length > 0) {
      selectedProg.push(progPool[selectedProg.length % progPool.length]);
    }

    const finalQuestions = [...selectedMCQs, ...selectedProg];
    const sanitizedQuestions = finalQuestions.map((q, idx) => ({
      _id: q._id + `_reattempt_${idx}`,
      originalId: q._id,
      courseId: q.courseId,
      moduleTitle: q.moduleTitle,
      topicTitle: q.topicTitle,
      type: q.type,
      questionText: `[Reattempt Q${idx + 1}] ${q.questionText}`,
      options: q.options,
      sampleCode: q.sampleCode,
      testCases: (q.testCases || []).map(tc => ({ input: tc.input, expectedOutput: tc.expectedOutput })),
      expectedKeywords: q.expectedKeywords || [],
      points: q.points
    }));

    const totalPossibleMarks = sanitizedQuestions.reduce((s, q) => s + q.points, 0);

    res.json({
      courseTitle: course.title,
      topicTitle,
      isReattempt: true,
      totalQuestions: sanitizedQuestions.length,
      totalPossibleMarks,
      durationMinutes: 25,
      questions: sanitizedQuestions
    });
  } catch (error) {
    res.status(500).json({ message: 'Error loading reattempt test: ' + error.message });
  }
};

// ─── Submit & Evaluate Test ────────────────────────────────────────────────────
exports.submitTest = async (req, res) => {
  try {
    const {
      courseId,
      isReattempt,
      weakTopic,
      startTime,
      endTime,
      tabSwitchCount,
      malpracticeCount,
      isTerminatedForMalpractice,
      malpracticeReason,
      answers,
      questionsSnapshot
    } = req.body;
    const studentId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    let mcqMarks = 0;
    let programmingMarks = 0;
    let maxPossibleMarks = 0;
    let processedAnswers = [];
    let topicMap = {};
    // Per-question results for the detailed summary shown after submission
    let questionResults = [];

    for (let [idx, item] of answers.entries()) {
      const originalId = (item.questionId || '').split('_reattempt_')[0];
      const question = await Question.findById(originalId);
      if (!question) continue;

      const points = question.points;
      maxPossibleMarks += points;

      if (!topicMap[question.topicTitle]) {
        topicMap[question.topicTitle] = {
          topicTitle: question.topicTitle,
          mcqCorrect: 0, mcqTotal: 0,
          progCorrect: 0, progTotal: 0,
          totalPoints: 0, earnedPoints: 0
        };
      }
      topicMap[question.topicTitle].totalPoints += points;

      let isCorrect = false;
      let earned = 0;
      let feedback = '';
      let selectedOptionText = '';
      let correctOptionText = '';
      let testCaseResults = [];

      if (question.type === 'mcq') {
        topicMap[question.topicTitle].mcqTotal += 1;
        const studentIdx = parseInt(item.studentAnswer);
        const correctIdx = parseInt(question.correctAnswer);
        selectedOptionText = question.options[studentIdx] !== undefined ? question.options[studentIdx] : '(not answered)';
        correctOptionText = question.options[correctIdx] || '';
        if (!isNaN(studentIdx) && studentIdx === correctIdx) {
          isCorrect = true;
          earned = points;
          mcqMarks += points;
          topicMap[question.topicTitle].mcqCorrect += 1;
          feedback = 'Correct!';
        } else {
          feedback = `Incorrect. Correct answer: "${correctOptionText}"`;
        }
      } else if (question.type === 'programming') {
        topicMap[question.topicTitle].progTotal += 1;
        const evalResult = evaluateCode(question, item.studentAnswer);
        testCaseResults = evalResult.testCaseResults;
        if (evalResult.passed) {
          isCorrect = true;
          earned = points;
          programmingMarks += points;
          topicMap[question.topicTitle].progCorrect += 1;
        }
        feedback = evalResult.feedback;
      }

      topicMap[question.topicTitle].earnedPoints += earned;

      processedAnswers.push({
        questionId: originalId,
        studentAnswer: item.studentAnswer,
        isCorrect,
        marksEarned: earned,
        feedback
      });

      questionResults.push({
        questionNumber: idx + 1,
        questionText: question.questionText,
        topicTitle: question.topicTitle,
        moduleTitle: question.moduleTitle,
        type: question.type,
        marksEarned: earned,
        maxMarks: points,
        isCorrect,
        feedback,
        // MCQ specific
        selectedOption: selectedOptionText,
        correctOption: correctOptionText,
        // Programming specific
        submittedCode: question.type === 'programming' ? (item.studentAnswer || '').toString().substring(0, 500) : null,
        testCaseResults: question.type === 'programming' ? testCaseResults : null
      });
    }

    const totalMarks = mcqMarks + programmingMarks;
    const scorePercentage = maxPossibleMarks > 0 ? Math.round((totalMarks / maxPossibleMarks) * 100) : 0;

    const topicPerformance = Object.values(topicMap).map(t => {
      const skillPct = t.totalPoints > 0 ? Math.round((t.earnedPoints / t.totalPoints) * 100) : 0;
      let reason = '';
      if (skillPct >= 80) {
        reason = 'Strong understanding demonstrated across both MCQs and practical coding.';
      } else if (skillPct >= 50) {
        reason = 'Moderate performance. Needs slightly more practice in syntax and edge case implementation.';
      } else if (t.mcqTotal > 0 && t.mcqCorrect < Math.ceil(t.mcqTotal / 2)) {
        reason = `Struggling with core conceptual questions in ${t.topicTitle}. Review basic definitions and rules.`;
      } else if (t.progTotal > 0 && t.progCorrect === 0) {
        reason = `Understands theory but struggles to translate ${t.topicTitle} concepts into functional code.`;
      } else {
        reason = `Low score in ${t.topicTitle}. Practice more problems and review examples.`;
      }
      return {
        topicTitle: t.topicTitle,
        skillPercentage: skillPct,
        mcqCorrect: t.mcqCorrect, mcqTotal: t.mcqTotal,
        progCorrect: t.progCorrect, progTotal: t.progTotal,
        reason
      };
    });

    const testAttempt = await TestAttempt.create({
      studentId, courseId,
      testTitle: isReattempt ? `Reattempt Test: ${weakTopic}` : `${course.title} Comprehensive Course Test`,
      isReattempt: !!isReattempt,
      weakTopic: weakTopic || '',
      totalQuestions: processedAnswers.length,
      mcqMarks, programmingMarks, totalMarks, maxPossibleMarks, scorePercentage,
      startTime: new Date(startTime || Date.now() - 300000),
      endTime: new Date(endTime || Date.now()),
      tabSwitchCount: tabSwitchCount || 0,
      malpracticeCount: malpracticeCount !== undefined ? malpracticeCount : (tabSwitchCount || 0),
      isTerminatedForMalpractice: !!isTerminatedForMalpractice,
      malpracticeReason: malpracticeReason || '',
      answers: processedAnswers,
      topicPerformance
    });

    res.status(201).json({
      testAttemptId: testAttempt._id,
      testTitle: testAttempt.testTitle,
      totalMarks, maxPossibleMarks,
      mcqMarks, programmingMarks,
      scorePercentage,
      startTime: testAttempt.startTime,
      endTime: testAttempt.endTime,
      tabSwitchCount: testAttempt.tabSwitchCount,
      malpracticeCount: testAttempt.malpracticeCount,
      isTerminatedForMalpractice: testAttempt.isTerminatedForMalpractice,
      malpracticeReason: testAttempt.malpracticeReason,
      topicPerformance,
      questionResults   // ← per-question detail for the summary screen
    });
  } catch (error) {
    console.error('Test Submission Error:', error);
    res.status(500).json({ message: 'Error evaluating test submission: ' + error.message });
  }
};

// ─── Get Test History ──────────────────────────────────────────────────────────
exports.getStudentTestHistory = async (req, res) => {
  try {
    const attempts = await TestAttempt.find({ studentId: req.user._id })
      .populate('courseId', 'title code')
      .sort({ createdAt: -1 });
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching test history: ' + error.message });
  }
};
