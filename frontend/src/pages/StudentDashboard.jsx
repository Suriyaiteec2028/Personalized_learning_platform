import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import CourseLearningView from '../components/CourseLearningView';
import SecureTestModal from '../components/SecureTestModal';
import { Search, BookOpen, Sparkles, PieChart, User, Check, Play, Award, ExternalLink, RefreshCw, Key, AlertTriangle, Layers, Code, CheckCircle, Lightbulb } from 'lucide-react';

export default function StudentDashboard() {
  const { user, updateProfile, connectTeacher } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('search-course'); // 'search-course' | 'course-management' | 'recommendations' | 'knowledge-gap' | 'profile'
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [knowledgeGaps, setKnowledgeGaps] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Active view states
  const [activeLearningCourse, setActiveLearningCourse] = useState(null);
  const [activeTestModal, setActiveTestModal] = useState(null); // testData object

  // Profile Form & Teacher Connection States
  const [inputTeacherCode, setInputTeacherCode] = useState('');
  const [connectSuccessMsg, setConnectSuccessMsg] = useState('');
  const [connectErrorMsg, setConnectErrorMsg] = useState('');
  const [connecting, setConnecting] = useState(false);

  const [name, setName] = useState(user?.name || '');
  const [rollNumber, setRollNumber] = useState(user?.rollNumber || '');
  const [institution, setInstitution] = useState(user?.institution || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [profileSavedMsg, setProfileSavedMsg] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [coursesRes, enrollmentsRes, recsRes, gapRes] = await Promise.all([
        API.get('/courses'),
        API.get('/enrollments/my-courses'),
        API.get('/recommendations'),
        API.get('/recommendations/knowledge-gap')
      ]);
      setCourses(coursesRes.data);
      setEnrollments(enrollmentsRes.data);
      setRecommendations(recsRes.data);
      setKnowledgeGaps(gapRes.data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Self-Enrollment handler
  const handleEnrollCourse = async (courseId) => {
    try {
      await API.post('/enrollments/enroll', { courseId });
      await fetchAllData();
      alert('Successfully enrolled in course! It is now added to your Course Management section.');
    } catch (err) {
      alert('Enrollment error: ' + (err.response?.data?.message || err.message));
    }
  };

  // Connect to Teacher Handler
  const handleConnectTeacher = async (e) => {
    e.preventDefault();
    setConnectSuccessMsg('');
    setConnectErrorMsg('');
    if (!inputTeacherCode.trim()) {
      setConnectErrorMsg('Please enter an 8-digit teacher code.');
      return;
    }

    setConnecting(true);
    try {
      const res = await connectTeacher(inputTeacherCode.trim());
      setConnectSuccessMsg(res.message || 'Connected to teacher successfully!');
      setInputTeacherCode('');
    } catch (err) {
      setConnectErrorMsg(err.message || 'Invalid or non-existing Teacher Code.');
    } finally {
      setConnecting(false);
    }
  };

  // Save Student Profile Handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSavedMsg('');
    try {
      await updateProfile({ name, rollNumber, institution, department, gender });
      setProfileSavedMsg('Profile updated successfully!');
      setTimeout(() => setProfileSavedMsg(''), 4000);
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    }
  };

  // Launch Standard Course Test
  const handleStartCourseTest = async (courseId) => {
    try {
      const res = await API.get(`/tests/course/${courseId}`);
      setActiveTestModal(res.data);
      setActiveLearningCourse(null);
    } catch (err) {
      alert('Error loading test questions: ' + (err.response?.data?.message || err.message));
    }
  };

  // Launch Reattempt Test for Weak Topic (15 Questions: 10 MCQ + 5 Programming)
  const handleStartReattemptTest = async (courseId, topicTitle) => {
    try {
      const res = await API.get(`/tests/reattempt/${courseId}?topicTitle=${encodeURIComponent(topicTitle)}`);
      setActiveTestModal(res.data);
    } catch (err) {
      alert('Error starting reattempt test: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const enrolledCourseIds = enrollments.map((e) => e.courseId?._id?.toString());

  // Render Course Learning View overlay
  if (activeLearningCourse) {
    const currentEnrollment = enrollments.find((e) => e.courseId?._id?.toString() === activeLearningCourse._id.toString());
    return (
      <CourseLearningView
        course={activeLearningCourse}
        enrollment={currentEnrollment}
        onBack={() => {
          setActiveLearningCourse(null);
          fetchAllData();
        }}
        onStartTest={handleStartCourseTest}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        
        {/* Navigation Tabs Header */}
        <div className="flex flex-wrap border-b border-slate-800 mb-8 gap-2 sm:gap-6">
          <button
            onClick={() => setActiveTab('search-course')}
            className={`pb-3 px-3 font-semibold text-sm transition-all border-b-2 flex items-center space-x-2 ${
              activeTab === 'search-course'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="h-4 w-4" />
            <span>Search Course</span>
          </button>

          <button
            onClick={() => setActiveTab('course-management')}
            className={`pb-3 px-3 font-semibold text-sm transition-all border-b-2 flex items-center space-x-2 ${
              activeTab === 'course-management'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Course Management ({enrollments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('recommendations')}
            className={`pb-3 px-3 font-semibold text-sm transition-all border-b-2 flex items-center space-x-2 ${
              activeTab === 'recommendations'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Recommendation Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('knowledge-gap')}
            className={`pb-3 px-3 font-semibold text-sm transition-all border-b-2 flex items-center space-x-2 ${
              activeTab === 'knowledge-gap'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChart className="h-4 w-4" />
            <span>Knowledge Gap Analysis</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-3 font-semibold text-sm transition-all border-b-2 flex items-center space-x-2 ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Profile & Teacher Link</span>
          </button>
        </div>

        {/* TAB 1: SEARCH COURSE */}
        {activeTab === 'search-course' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-white">Search Available Courses</h2>
                <p className="text-xs text-slate-400">
                  Self-enroll in courses based on your interests. The course will automatically appear in your Course Management menu.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Java, Python, DSA..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-500">Loading catalog...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => {
                  const isEnrolled = enrolledCourseIds.includes(course._id.toString());
                  return (
                    <div
                      key={course._id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col justify-between hover:border-slate-700 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2.5 py-0.5 rounded border border-blue-500/30">
                            {course.category}
                          </span>
                          {course.isDefault && (
                            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/30">
                              Core Default
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-white mb-1">{course.title}</h3>
                        <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">{course.description}</p>

                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1 mb-4">
                          <p>📦 Modules: <strong className="text-white">{course.modules?.length || 0} Modules</strong></p>
                          <p>🎯 Difficulty: <strong className="text-emerald-400">{course.difficulty}</strong></p>
                        </div>
                      </div>

                      {isEnrolled ? (
                        <div className="w-full py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold text-xs rounded-xl flex items-center justify-center space-x-1.5">
                          <Check className="h-4 w-4" />
                          <span>Enrolled ✓ (In Course Management)</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEnrollCourse(course._id)}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-1.5 transition-all"
                        >
                          <BookOpen className="h-4 w-4" />
                          <span>Enroll Now (Instant Self-Enroll)</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COURSE MANAGEMENT */}
        {activeTab === 'course-management' && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-white">Course Management (My Enrolled Courses)</h2>

            {enrollments.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
                <BookOpen className="h-12 w-12 text-slate-600 mx-auto" />
                <h3 className="text-lg font-bold text-white">No Enrolled Courses Yet</h3>
                <p className="text-xs max-w-md mx-auto">
                  Search the course catalog and enroll in Java, Python, or DSA to begin your personalized learning journey.
                </p>
                <button
                  onClick={() => setActiveTab('search-course')}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-md"
                >
                  Browse Course Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments.map((env) => {
                  const course = env.courseId;
                  if (!course) return null;

                  return (
                    <div
                      key={env._id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col justify-between hover:border-slate-700 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-blue-400 uppercase font-mono">{course.code}</span>
                          <span className="text-xs font-bold text-emerald-400">{env.progressPercentage}% Completed</span>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-2">{course.title}</h3>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-950 rounded-full h-2.5 border border-slate-800 overflow-hidden mb-4">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${env.progressPercentage}%` }}
                          />
                        </div>

                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1 mb-6">
                          <p>📌 Last Studied: <strong className="text-white">{env.lastStudiedTopic || 'Module 1 Topic 1'}</strong></p>
                          <p>✅ Completed Topics: <strong className="text-emerald-400">{env.completedTopics?.length || 0} topics</strong></p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => setActiveLearningCourse(course)}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5 transition-all"
                        >
                          <Play className="h-4 w-4" />
                          <span>Open Course & Continue Learning</span>
                        </button>

                        <button
                          onClick={() => handleStartCourseTest(course._id)}
                          className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold text-xs rounded-xl border border-amber-500/30 flex items-center justify-center space-x-1.5 transition-all"
                        >
                          <Award className="h-4 w-4" />
                          <span>Attempt Course Test (~100 Qs)</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: RECOMMENDATION ENGINE */}
        {activeTab === 'recommendations' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-amber-400" />
                <span>Intelligent Personalized Recommendation Engine</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Analyzes your test performance, course progress, and interests to diagnose root causes and recommend targeted problem sets.
              </p>
            </div>

            {recommendations && (
              <div className="space-y-8">
                
                {/* Weak Topics Root-Cause Diagnosis & Direct Problem Links */}
                <div>
                  <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Topic Performance Diagnosis & Direct LeetCode / HackerRank Problems</span>
                  </h3>

                  {recommendations.weakTopics.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-emerald-400 text-xs font-semibold">
                      🎉 Great job! You currently have no identified weak topics. Keep taking course assessments!
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {recommendations.weakTopics.map((wt, idx) => (
                        <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800">
                            <div>
                              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">Weak Topic Identified</span>
                              <h4 className="text-lg font-bold text-white">{wt.topicTitle}</h4>
                            </div>
                            <span className="bg-rose-500/20 text-rose-300 font-mono text-sm font-bold px-3 py-1 rounded-full border border-rose-500/30">
                              Skill Percentage: {wt.latestPercentage}%
                            </span>
                          </div>

                          {/* Root Cause Explanation */}
                          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 mb-4 space-y-1">
                            <span className="font-bold text-amber-300 block uppercase">Root-Cause Explanation (Why Struggling):</span>
                            <p className="leading-relaxed text-slate-300">{wt.reason}</p>
                          </div>

                          {/* Direct LeetCode Links Grid */}
                          <div className="mb-4">
                            <h5 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center space-x-1.5">
                              <Code className="h-4 w-4 text-amber-400" />
                              <span>Recommended LeetCode Practice Problems (10 Direct Links)</span>
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {wt.leetcodeLinks?.slice(0, 10).map((link, lIdx) => (
                                <a
                                  key={lIdx}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-blue-400 hover:text-blue-300 flex items-center justify-between transition-colors group"
                                >
                                  <span className="truncate pr-2">{lIdx + 1}. {link.name}</span>
                                  <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-blue-400 flex-shrink-0" />
                                </a>
                              ))}
                            </div>
                          </div>

                          {/* Direct HackerRank Links Grid */}
                          <div>
                            <h5 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center space-x-1.5">
                              <Code className="h-4 w-4 text-emerald-400" />
                              <span>Recommended HackerRank Practice Problems (10 Direct Links)</span>
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {wt.hackerrankLinks?.slice(0, 10).map((link, hIdx) => (
                                <a
                                  key={hIdx}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-emerald-400 hover:text-emerald-300 flex items-center justify-between transition-colors group"
                                >
                                  <span className="truncate pr-2">{hIdx + 1}. {link.name}</span>
                                  <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-emerald-400 flex-shrink-0" />
                                </a>
                              ))}
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Interest-Based Additional Course Recommendations */}
                <div>
                  <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider mb-4 flex items-center space-x-2">
                    <Lightbulb className="h-4 w-4" />
                    <span>Recommended Additional Courses Based on Your Interests</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.recommendedCourses.map((rc) => (
                      <div key={rc._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md flex justify-between items-center">
                        <div>
                          <span className="text-[10px] font-bold text-blue-400 uppercase">{rc.category}</span>
                          <h4 className="font-bold text-white text-base">{rc.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-1">{rc.description}</p>
                        </div>
                        <button
                          onClick={() => handleEnrollCourse(rc._id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md flex-shrink-0 ml-4"
                        >
                          Enroll Now
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* TAB 4: KNOWLEDGE GAP ANALYSIS */}
        {activeTab === 'knowledge-gap' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center space-x-2">
                <PieChart className="h-6 w-6 text-purple-400" />
                <span>Knowledge Gap Analysis & Weak-Topic Reattempt Tests</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Visualizes the gap between your current understanding and expected course mastery. Click Reattempt Test on weak topics to attempt 15 targeted questions (10 MCQ + 5 Programming).
              </p>
            </div>

            {knowledgeGaps.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
                <PieChart className="h-12 w-12 text-slate-600 mx-auto" />
                <h3 className="text-lg font-bold text-white">No Course Data for Gap Analysis</h3>
                <p className="text-xs">Enroll in courses and take course assessments to calculate your detailed topic knowledge gaps.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {knowledgeGaps.map((cg) => (
                  <div key={cg.courseId} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
                      <div>
                        <span className="text-xs font-bold text-blue-400 uppercase font-mono">{cg.courseCode}</span>
                        <h3 className="text-lg font-extrabold text-white">{cg.courseTitle}</h3>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <span className="text-[11px] text-slate-400 block font-medium">Overall Skill</span>
                          <span className="font-mono text-sm font-bold text-emerald-400">{cg.overallSkillPercentage}%</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] text-slate-400 block font-medium">Weak Gap %</span>
                          <span className="font-mono text-sm font-bold text-rose-400">{cg.overallWeakPercentage}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Topic Knowledge Breakdown Table */}
                    <div className="space-y-3">
                      {cg.topics.map((t, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                            t.isWeak ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-950 border-slate-800'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-bold text-white text-sm">{t.topicTitle}</span>
                              <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                {t.moduleTitle}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">{t.reason}</p>
                          </div>

                          <div className="flex items-center space-x-4 flex-shrink-0">
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block">Weakness Gap</span>
                              <span className={`font-mono text-xs font-bold ${t.isWeak ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {t.weakKnowledgePercentage}% Gap
                              </span>
                            </div>

                            {/* Targeted Reattempt Test Trigger (15 Questions: 10 MCQ + 5 Programming) */}
                            {t.isWeak && (
                              <button
                                onClick={() => handleStartReattemptTest(cg.courseId, t.topicTitle)}
                                className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/20 flex items-center space-x-1.5 transition-all"
                              >
                                <Play className="h-3.5 w-3.5" />
                                <span>Reattempt Test (15 Qs)</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PROFILE & TEACHER LINK */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-6">
            
            {/* 8-Digit Teacher Code Link Section */}
            <div className="bg-slate-900 border-2 border-amber-500/40 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Connect to Your Teacher</h3>
                  <p className="text-xs text-slate-400">
                    Enter the 8-digit unique alphanumeric code provided by your teacher to share your progress.
                  </p>
                </div>
              </div>

              {user?.connectedTeacherId ? (
                <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/40 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-emerald-400 font-bold block uppercase">Connected Teacher Account:</span>
                    <span className="text-white font-bold text-sm">{user.connectedTeacherId.name}</span>
                    <span className="text-slate-400 block">{user.connectedTeacherId.email} | Code: {user.connectedTeacherId.teacherCode}</span>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                    Linked ✓
                  </span>
                </div>
              ) : (
                <form onSubmit={handleConnectTeacher} className="space-y-3 mt-4">
                  {connectSuccessMsg && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl">
                      {connectSuccessMsg}
                    </div>
                  )}

                  {connectErrorMsg && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold rounded-xl">
                      {connectErrorMsg}
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      maxLength={8}
                      value={inputTeacherCode}
                      onChange={(e) => setInputTeacherCode(e.target.value.toUpperCase())}
                      placeholder="ENTER 8-DIGIT CODE (e.g. TCH7A9X2)"
                      className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm font-bold text-amber-300 placeholder-slate-600 focus:outline-none focus:border-amber-500 uppercase tracking-widest"
                    />
                    <button
                      type="submit"
                      disabled={connecting}
                      className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/30 transition-all"
                    >
                      {connecting ? 'Verifying...' : 'OK'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Profile Details Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">Student Profile Details</h3>

              {profileSavedMsg && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl">
                  {profileSavedMsg}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address (Read-Only)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 text-sm cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Roll Number</label>
                    <input
                      type="text"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Institution Name</label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all text-sm"
                  >
                    Save Profile Changes
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}

      </div>

      {/* SECURE TEST MODAL OVERLAY */}
      {activeTestModal && (
        <SecureTestModal
          testData={activeTestModal}
          onClose={() => setActiveTestModal(null)}
          onTestCompleted={() => fetchAllData()}
        />
      )}

    </div>
  );
}
