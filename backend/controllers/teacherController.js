const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const TestAttempt = require('../models/TestAttempt');
const Course = require('../models/Course');

// Get list of students connected to current teacher
exports.getConnectedStudents = async (req, res) => {
  try {
    const teacherId = req.user._id;

    const students = await User.find({ connectedTeacherId: teacherId, role: 'student' }).select('-password');

    let studentSummaries = [];
    for (let student of students) {
      const enrollments = await Enrollment.find({ studentId: student._id }).populate('courseId', 'title code');
      const testAttempts = await TestAttempt.find({ studentId: student._id }).sort({ createdAt: -1 });

      const totalEnrolled = enrollments.length;
      const totalTests = testAttempts.length;
      const avgScore = totalTests > 0 
        ? Math.round(testAttempts.reduce((acc, curr) => acc + curr.scorePercentage, 0) / totalTests)
        : 0;

      let weakTopicsSet = new Set();
      testAttempts.forEach(attempt => {
        attempt.topicPerformance.forEach(tp => {
          if (tp.skillPercentage < 75) {
            weakTopicsSet.add(tp.topicTitle);
          }
        });
      });

      studentSummaries.push({
        _id: student._id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        institution: student.institution,
        department: student.department,
        gender: student.gender,
        totalEnrolledCourses: totalEnrolled,
        totalTestsAttempted: totalTests,
        averageTestScore: avgScore,
        weakTopicsCount: weakTopicsSet.size,
        enrolledCourseNames: enrollments.map(e => e.courseId?.title).filter(Boolean)
      });
    }

    res.json({
      teacherCode: req.user.teacherCode,
      totalConnectedStudents: studentSummaries.length,
      students: studentSummaries
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching connected students: ' + error.message });
  }
};

// Detailed student activity monitoring view
exports.getStudentDetailedActivity = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { studentId } = req.params;

    const student = await User.findById(studentId).select('-password');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Verify student is connected to this teacher
    if (student.connectedTeacherId?.toString() !== teacherId.toString()) {
      return res.status(403).json({ message: 'Forbidden: This student is not connected to your teacher profile.' });
    }

    const enrollments = await Enrollment.find({ studentId }).populate('courseId');
    const testAttempts = await TestAttempt.find({ studentId }).populate('courseId', 'title code').sort({ createdAt: -1 });

    // Extract strengths & weak topics
    let topicMap = {};
    testAttempts.forEach(attempt => {
      attempt.topicPerformance.forEach(tp => {
        if (!topicMap[tp.topicTitle]) {
          topicMap[tp.topicTitle] = tp;
        }
      });
    });

    const topicList = Object.values(topicMap);
    const strengths = topicList.filter(t => t.skillPercentage >= 75).map(t => t.topicTitle);
    const weakTopics = topicList.filter(t => t.skillPercentage < 75).map(t => ({
      topicTitle: t.topicTitle,
      skillPercentage: t.skillPercentage,
      reason: t.reason
    }));

    // Calculate eligible tests based on enrolled courses and progress
    const eligibleTests = enrollments.map(env => {
      const isEligible = env.progressPercentage >= 10; // eligible after starting modules
      return {
        courseId: env.courseId?._id,
        courseTitle: env.courseId?.title,
        courseCode: env.courseId?.code,
        progressPercentage: env.progressPercentage,
        isEligible,
        status: isEligible ? 'Eligible for Comprehensive Course Test' : 'Requires higher module completion'
      };
    });

    res.json({
      studentInfo: {
        _id: student._id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        institution: student.institution,
        department: student.department,
        gender: student.gender
      },
      enrolledCoursesCount: enrollments.length,
      enrolledCourseNames: enrollments.map(e => e.courseId?.title).filter(Boolean),
      enrolledCoursesDetails: enrollments.map(e => ({
        courseId: e.courseId?._id,
        courseTitle: e.courseId?.title,
        courseCode: e.courseId?.code,
        progressPercentage: e.progressPercentage,
        completedTopicsCount: e.completedTopics?.length || 0,
        lastStudiedTopic: e.lastStudiedTopic
      })),
      testAttempts: testAttempts.map(ta => ({
        _id: ta._id,
        testTitle: ta.testTitle,
        courseTitle: ta.courseId?.title,
        scorePercentage: ta.scorePercentage,
        totalMarks: ta.totalMarks,
        maxPossibleMarks: ta.maxPossibleMarks,
        mcqMarks: ta.mcqMarks,
        programmingMarks: ta.programmingMarks,
        tabSwitchCount: ta.tabSwitchCount,
        startTime: ta.startTime,
        endTime: ta.endTime,
        attemptDate: ta.createdAt
      })),
      strengths,
      weakTopics,
      eligibleTests,
      systemRecommendations: weakTopics.map(wt => `System Recommendation: Student requires revision in ${wt.topicTitle} (Skill: ${wt.skillPercentage}%). Recommended LeetCode/HackerRank targeted exercises.`)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student activity: ' + error.message });
  }
};

// Remove student from teacher's connected list
exports.removeStudentFromTeacher = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { studentId } = req.params;

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.connectedTeacherId?.toString() !== teacherId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Student is not connected to this teacher' });
    }

    student.connectedTeacherId = null;
    await student.save();

    res.json({ message: `Successfully removed student ${student.name} from your managed list. Student history retained.` });
  } catch (error) {
    res.status(500).json({ message: 'Error removing student: ' + error.message });
  }
};
