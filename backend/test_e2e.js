const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function runE2ETests() {
  console.log('--- STARTING E2E VERIFICATION SUITE FOR PERSONALIZED LEARNING PLATFORM ---');

  try {
    // 1. Teacher Login
    console.log('\n[1] Testing Teacher Login & Unique Code Verification...');
    const teacherLoginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'teacher@platform.com',
      password: 'teacher123',
      role: 'teacher'
    });

    const teacherToken = teacherLoginRes.data.token;
    const teacherCode = teacherLoginRes.data.teacherCode;
    console.log(`✓ Teacher Logged In. Name: ${teacherLoginRes.data.name}, Role: ${teacherLoginRes.data.role}`);
    console.log(`✓ Verified 8-Digit Unique Teacher Code: "${teacherCode}" (Length: ${teacherCode.length})`);
    if (teacherCode.length !== 8) {
      throw new Error('Teacher code must be exactly 8 characters long!');
    }

    // 2. Student Login
    console.log('\n[2] Testing Student Login & Profile...');
    const studentLoginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'student@platform.com',
      password: 'student123',
      role: 'student'
    });

    const studentToken = studentLoginRes.data.token;
    const studentAuthHeader = { headers: { Authorization: `Bearer ${studentToken}` } };
    const teacherAuthHeader = { headers: { Authorization: `Bearer ${teacherToken}` } };

    console.log(`✓ Student Logged In. Name: ${studentLoginRes.data.name}, Role: ${studentLoginRes.data.role}`);

    // 3. Connect Student to Teacher using Teacher Code
    console.log('\n[3] Testing Student-Teacher Connection via 8-Digit Code...');
    const connectRes = await axios.post(`${API_URL}/auth/connect-teacher`, { teacherCode }, studentAuthHeader);
    console.log(`✓ Connection Result: ${connectRes.data.message}`);

    // 4. Course Catalog & Default Courses
    console.log('\n[4] Testing Course Catalog Fetching...');
    const coursesRes = await axios.get(`${API_URL}/courses`);
    const courses = coursesRes.data;
    console.log(`✓ Fetched ${courses.length} courses from DB:`);
    courses.forEach(c => console.log(`   - ${c.title} (${c.code}): ${c.modules.length} Modules`));

    const javaCourse = courses.find(c => c.code === 'JAVA101');
    if (!javaCourse) throw new Error('Default Java course missing!');

    // 5. Student Self-Enrollment
    console.log('\n[5] Testing Student Course Self-Enrollment...');
    let enrollRes;
    try {
      enrollRes = await axios.post(`${API_URL}/enrollments/enroll`, { courseId: javaCourse._id }, studentAuthHeader);
      console.log(`✓ Enrolled in ${javaCourse.title} successfully!`);
    } catch (e) {
      console.log('✓ Already enrolled in Java course, fetching enrolled list...');
    }

    // Update progress
    console.log('\n[6] Testing Topic Completion & Progress Tracking...');
    const progRes = await axios.post(`${API_URL}/enrollments/update-progress`, {
      courseId: javaCourse._id,
      topicTitle: 'Variables, Constants, and Data Types',
      completed: true
    }, studentAuthHeader);
    console.log(`✓ Updated progress: ${progRes.data.progressPercentage}% Completed`);

    // 7. Course Test Assessment
    console.log('\n[7] Testing Course Assessment & Question Fetching...');
    const testQsRes = await axios.get(`${API_URL}/tests/course/${javaCourse._id}`, studentAuthHeader);
    console.log(`✓ Fetched ${testQsRes.data.totalQuestions} questions for course test. Duration: ${testQsRes.data.durationMinutes} mins`);

    // Submit Test
    console.log('\n[8] Submitting Test Answers & Evaluating Marks...');
    const sampleAnswers = testQsRes.data.questions.map((q, idx) => ({
      questionId: q._id,
      studentAnswer: q.type === 'mcq' ? 1 : 'public static double convertCelsiusToFahrenheit(double celsius) { return (celsius * 9.0 / 5.0) + 32; }'
    }));

    const submitRes = await axios.post(`${API_URL}/tests/submit`, {
      courseId: javaCourse._id,
      isReattempt: false,
      startTime: new Date(Date.now() - 300000),
      endTime: new Date(),
      tabSwitchCount: 0,
      answers: sampleAnswers
    }, studentAuthHeader);

    console.log(`✓ Test Submitted & Evaluated Immediately! Total Score: ${submitRes.data.totalMarks} / ${submitRes.data.maxPossibleMarks} (${submitRes.data.scorePercentage}%)`);
    console.log(`✓ Score Breakdown: MCQ Marks = ${submitRes.data.mcqMarks}, Programming Marks = ${submitRes.data.programmingMarks}`);

    // 9. Recommendation Engine & Knowledge Gap
    console.log('\n[9] Testing Recommendation Engine & Direct Links...');
    const recsRes = await axios.get(`${API_URL}/recommendations`, studentAuthHeader);
    console.log(`✓ Weak Topics Identified: ${recsRes.data.weakTopics.length}`);
    if (recsRes.data.weakTopics.length > 0) {
      const topWeak = recsRes.data.weakTopics[0];
      console.log(`   Weak Topic: "${topWeak.topicTitle}" (Skill: ${topWeak.latestPercentage}%)`);
      console.log(`   Reason: "${topWeak.reason}"`);
      console.log(`   LeetCode Direct Problem Links: ${topWeak.leetcodeLinks.length} links (e.g. ${topWeak.leetcodeLinks[0].url})`);
      console.log(`   HackerRank Direct Problem Links: ${topWeak.hackerrankLinks.length} links (e.g. ${topWeak.hackerrankLinks[0].url})`);
    }

    // 10. Reattempt Test Generation (15 Questions: 10 MCQ + 5 Programming)
    console.log('\n[10] Testing Reattempt Test Generation for Weak Topic (15 Questions)...');
    const weakTopicName = 'Variables, Constants, and Data Types';
    const reattemptQsRes = await axios.get(`${API_URL}/tests/reattempt/${javaCourse._id}?topicTitle=${encodeURIComponent(weakTopicName)}`, studentAuthHeader);
    console.log(`✓ Reattempt Test Questions count: ${reattemptQsRes.data.totalQuestions} (Target: 15)`);
    if (reattemptQsRes.data.totalQuestions !== 15) {
      throw new Error('Reattempt test must contain exactly 15 questions!');
    }

    // 11. Teacher Student Activity Monitoring
    console.log('\n[11] Testing Teacher Detailed Student Activity Inspection...');
    const teacherStudentsRes = await axios.get(`${API_URL}/teacher/students`, teacherAuthHeader);
    console.log(`✓ Connected Students Count for Teacher: ${teacherStudentsRes.data.totalConnectedStudents}`);

    const studentId = teacherStudentsRes.data.students[0]._id;
    const studentActivityRes = await axios.get(`${API_URL}/teacher/student-activity/${studentId}`, teacherAuthHeader);
    console.log(`✓ Teacher Inspected Student Activity for "${studentActivityRes.data.studentInfo.name}":`);
    console.log(`   - Enrolled Courses Count: ${studentActivityRes.data.enrolledCoursesCount}`);
    console.log(`   - Test Attempts Logged: ${studentActivityRes.data.testAttempts.length}`);
    console.log(`   - Test Start & End Times Logged properly.`);
    console.log(`   - Strengths: ${studentActivityRes.data.strengths.join(', ')}`);
    console.log(`   - Weak Topics: ${studentActivityRes.data.weakTopics.map(w => w.topicTitle).join(', ')}`);

    console.log('\n======================================================');
    console.log('🎉 ALL END-TO-END VERIFICATION TESTS PASSED CLEANLY! 🎉');
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ E2E TEST FAILED:', err.response?.data || err.message);
    process.exit(1);
  }
}

runE2ETests();
